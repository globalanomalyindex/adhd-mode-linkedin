// lib/spaced-repetition.test.js
import { describe, it, expect } from 'vitest';
import { schedule, advance, RESURFACING_REACTIONS } from './spaced-repetition.js';

const NOW = new Date('2026-05-16T12:00:00Z').getTime();

describe('schedule()', () => {
  it('schedules Insightful with a 3-day initial interval', () => {
    const item = schedule({ reaction: 'insightful', now: NOW, postId: 'p1' });
    expect(item.postId).toBe('p1');
    expect(item.reaction).toBe('insightful');
    expect(item.exposureCount).toBe(0);
    expect(item.scheduledFor).toBe(NOW + 3 * 24 * 60 * 60 * 1000);
  });

  it('schedules Support with a 7-day initial interval', () => {
    const item = schedule({ reaction: 'support', now: NOW, postId: 'p2' });
    expect(item.scheduledFor).toBe(NOW + 7 * 24 * 60 * 60 * 1000);
  });

  it('schedules Love with a 14-day initial interval', () => {
    const item = schedule({ reaction: 'love', now: NOW, postId: 'p3' });
    expect(item.scheduledFor).toBe(NOW + 14 * 24 * 60 * 60 * 1000);
  });

  it('returns null for non-resurfacing reactions', () => {
    for (const r of ['like', 'celebrate', 'funny']) {
      expect(schedule({ reaction: r, now: NOW, postId: 'p4' })).toBeNull();
    }
  });

  it('throws on unknown reaction', () => {
    expect(() => schedule({ reaction: 'wow', now: NOW, postId: 'p5' })).toThrow();
  });
});

describe('advance()', () => {
  it('multiplies Insightful interval by 2.5 on each exposure', () => {
    const first = schedule({ reaction: 'insightful', now: NOW, postId: 'p1' });
    const second = advance(first, NOW + 3 * 24 * 60 * 60 * 1000);
    const expectedInterval = 3 * 2.5 * 24 * 60 * 60 * 1000;
    expect(second.exposureCount).toBe(1);
    expect(second.scheduledFor).toBe(NOW + 3 * 24 * 60 * 60 * 1000 + expectedInterval);
  });

  it('retires after the 4th exposure', () => {
    let item = schedule({ reaction: 'insightful', now: NOW, postId: 'p1' });
    for (let i = 0; i < 4; i++) {
      item = advance(item, item.scheduledFor);
    }
    expect(item).toBeNull();
  });
});

describe('RESURFACING_REACTIONS', () => {
  it('exports the three resurfacing reaction names', () => {
    expect(RESURFACING_REACTIONS.sort()).toEqual(['insightful', 'love', 'support']);
  });
});
