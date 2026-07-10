// lib/session-state.test.js
import { describe, it, expect, vi } from 'vitest';
import { createSession, send } from './session-state.js';

describe('createSession()', () => {
  it('starts in entry state with default config', () => {
    const s = createSession();
    expect(s.state).toBe('entry');
    expect(s.checkpointShown).toBe(false);
    expect(s.cardsSeen).toBe(0);
    expect(s.reactionsSent).toBe(0);
    expect(s.queueAdds).toBe(0);
  });
});

describe('send()', () => {
  it('entry to setup on START_SETUP', () => {
    const s = send(createSession(), { type: 'START_SETUP' });
    expect(s.state).toBe('setup');
  });

  it('setup to active on BEGIN with mode and duration', () => {
    let s = send(createSession(), { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 12 });
    expect(s.state).toBe('active');
    expect(s.mode).toBe('focus');
    expect(s.postCap).toBe(12);
    expect(s.durationSec).toBe(720);
  });

  it('counts CARD_SEEN events while active', () => {
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 12 });
    s = send(s, { type: 'CARD_SEEN' });
    s = send(s, { type: 'CARD_SEEN' });
    expect(s.cardsSeen).toBe(2);
  });

  it('counts REACT events and tracks queue additions for resurfacing reactions', () => {
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 12 });
    s = send(s, { type: 'REACT', reaction: 'like' });
    s = send(s, { type: 'REACT', reaction: 'insightful' });
    s = send(s, { type: 'REACT', reaction: 'love' });
    expect(s.reactionsSent).toBe(3);
    expect(s.queueAdds).toBe(2);
  });

  it('shows one checkpoint at the post-cap midpoint', () => {
    const sink = vi.fn();
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 6 });
    s = send(s, { type: 'CARD_SEEN' }, sink);
    s = send(s, { type: 'CARD_SEEN' }, sink);
    expect(s.state).toBe('active');
    s = send(s, { type: 'CARD_SEEN' }, sink);
    expect(s.state).toBe('checkpoint');
    expect(s.cardsSeen).toBe(3);
    expect(s.checkpointShown).toBe(true);
    expect(sink.mock.calls.map(([event]) => event.type)).toEqual([
      'card_seen',
      'card_seen',
      'card_seen',
      'checkpoint_shown',
    ]);
  });

  it('continues after the midpoint without showing the checkpoint again', () => {
    const sink = vi.fn();
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 6 });
    s = send(s, { type: 'CARD_SEEN' }, sink);
    s = send(s, { type: 'CARD_SEEN' }, sink);
    s = send(s, { type: 'CARD_SEEN' }, sink);
    expect(s.state).toBe('checkpoint');
    s = send(s, { type: 'CONTINUE' });
    expect(s.state).toBe('active');
    s = send(s, { type: 'CARD_SEEN' }, sink);
    s = send(s, { type: 'CARD_SEEN' }, sink);
    expect(s.state).toBe('active');
    expect(s.cardsSeen).toBe(5);
    expect(s.checkpointShown).toBe(true);
    expect(
      sink.mock.calls.filter(([event]) => event.type === 'checkpoint_shown'),
    ).toHaveLength(1);
  });

  it('ends at the post cap and records postcap as the wrap reason', () => {
    const sink = vi.fn();
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 4 });
    s = send(s, { type: 'CARD_SEEN' }, sink);
    s = send(s, { type: 'CARD_SEEN' }, sink);
    s = send(s, { type: 'CONTINUE' });
    s = send(s, { type: 'CARD_SEEN' }, sink);
    s = send(s, { type: 'CARD_SEEN' }, sink);
    expect(s.state).toBe('end');
    expect(s.cardsSeen).toBe(4);
    expect(sink).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: 'session_wrapped',
        reason: 'postcap',
        posts_seen: 4,
      }),
    );
  });

  it('ends on TIME_UP while active and records the timebox reason', () => {
    const sink = vi.fn();
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 12 });
    s = send(s, { type: 'TIME_UP', settledness_delta: 1 }, sink);
    expect(s.state).toBe('end');
    expect(sink).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: 'session_wrapped',
        reason: 'timebox',
        settledness_delta: 1,
      }),
    );
  });

  it('still ends on TIME_UP while the midpoint checkpoint is open', () => {
    const sink = vi.fn();
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 4 });
    s = send(s, { type: 'CARD_SEEN' });
    s = send(s, { type: 'CARD_SEEN' });
    expect(s.state).toBe('checkpoint');
    s = send(s, { type: 'TIME_UP' }, sink);
    expect(s.state).toBe('end');
    expect(sink).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'session_wrapped', reason: 'timebox' }),
    );
  });

  it('preserves voluntary wrap from both active and checkpoint states', () => {
    for (const fromCheckpoint of [false, true]) {
      const sink = vi.fn();
      let s = createSession();
      s = send(s, { type: 'START_SETUP' });
      s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 4 });
      if (fromCheckpoint) {
        s = send(s, { type: 'CARD_SEEN' });
        s = send(s, { type: 'CARD_SEEN' });
        expect(s.state).toBe('checkpoint');
      }
      s = send(s, { type: 'WRAP' }, sink);
      expect(s.state).toBe('end');
      expect(sink).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: 'session_wrapped',
          reason: 'user_closed',
        }),
      );
    }
  });

  it('end to exit on CLOSE', () => {
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 12 });
    s = send(s, { type: 'TIME_UP' });
    s = send(s, { type: 'CLOSE' });
    expect(s.state).toBe('exit');
  });
});
