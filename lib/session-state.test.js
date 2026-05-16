// lib/session-state.test.js
import { describe, it, expect } from 'vitest';
import { createSession, send } from './session-state.js';

describe('createSession()', () => {
  it('starts in entry state with default config', () => {
    const s = createSession();
    expect(s.state).toBe('entry');
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

  it('active to checkpoint when CARD_SEEN count reaches postCap', () => {
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 3 });
    s = send(s, { type: 'CARD_SEEN' });
    s = send(s, { type: 'CARD_SEEN' });
    expect(s.state).toBe('active');
    s = send(s, { type: 'CARD_SEEN' });
    expect(s.state).toBe('checkpoint');
  });

  it('checkpoint to active on CONTINUE', () => {
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 1 });
    s = send(s, { type: 'CARD_SEEN' });
    expect(s.state).toBe('checkpoint');
    s = send(s, { type: 'CONTINUE' });
    expect(s.state).toBe('active');
  });

  it('checkpoint to end on WRAP', () => {
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 1 });
    s = send(s, { type: 'CARD_SEEN' });
    s = send(s, { type: 'WRAP' });
    expect(s.state).toBe('end');
  });

  it('active to end on TIME_UP', () => {
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 12 });
    s = send(s, { type: 'TIME_UP' });
    expect(s.state).toBe('end');
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
