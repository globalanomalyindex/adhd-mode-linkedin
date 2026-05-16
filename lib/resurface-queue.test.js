// lib/resurface-queue.test.js
import { describe, it, expect } from 'vitest';
import { createQueue, addItem, dueItems, blendFeed } from './resurface-queue.js';
import { schedule } from './spaced-repetition.js';

const NOW = new Date('2026-05-16T12:00:00Z').getTime();

describe('createQueue()', () => {
  it('returns an empty queue', () => {
    const q = createQueue();
    expect(q.items).toEqual([]);
  });
});

describe('addItem()', () => {
  it('adds a scheduled item to the queue', () => {
    let q = createQueue();
    const item = schedule({ reaction: 'insightful', now: NOW, postId: 'p1' });
    q = addItem(q, item);
    expect(q.items).toHaveLength(1);
    expect(q.items[0].postId).toBe('p1');
  });

  it('ignores null items (non-resurfacing reactions)', () => {
    let q = createQueue();
    q = addItem(q, null);
    expect(q.items).toHaveLength(0);
  });
});

describe('dueItems()', () => {
  it('returns only items whose scheduledFor <= now', () => {
    let q = createQueue();
    const a = schedule({ reaction: 'insightful', now: NOW, postId: 'a' });
    const b = schedule({ reaction: 'love', now: NOW, postId: 'b' });
    q = addItem(q, a);
    q = addItem(q, b);
    const now5 = NOW + 5 * 24 * 60 * 60 * 1000;
    expect(dueItems(q, now5).map(i => i.postId)).toEqual(['a']);
  });
});

describe('blendFeed()', () => {
  it('returns only fresh posts when queue is empty', () => {
    const q = createQueue();
    const fresh = [{ id: 'f1' }, { id: 'f2' }, { id: 'f3' }];
    const blend = blendFeed({ fresh, queue: q, now: NOW, mixRatio: 0.3, postLookup: id => ({ id }) });
    expect(blend.map(p => p.id)).toEqual(['f1', 'f2', 'f3']);
  });

  it('interleaves due resurface items with fresh posts at the mix ratio', () => {
    let q = createQueue();
    q = addItem(q, schedule({ reaction: 'insightful', now: NOW - 10 * 24 * 60 * 60 * 1000, postId: 'r1' }));
    q = addItem(q, schedule({ reaction: 'insightful', now: NOW - 10 * 24 * 60 * 60 * 1000, postId: 'r2' }));
    const fresh = Array.from({ length: 8 }, (_, i) => ({ id: `f${i + 1}` }));
    const blend = blendFeed({
      fresh, queue: q, now: NOW, mixRatio: 0.3,
      postLookup: id => ({ id, resurfaced: true }),
    });
    const resurfaced = blend.filter(p => p.resurfaced);
    expect(resurfaced.length).toBeGreaterThanOrEqual(2);
    expect(resurfaced.length).toBeLessThanOrEqual(3);
  });
});
