// lib/resurface-queue.js
/** @typedef {import('./types').Post} Post */
/** @typedef {import('./types').Queue} Queue */
/** @typedef {import('./types').QueueItem} QueueItem */
/** @typedef {import('./types').BlendFeedArgs} BlendFeedArgs */

/**
 * Create an empty resurface queue.
 * @returns {Queue}
 */
export function createQueue() {
  return { items: [] };
}

/**
 * Append a scheduled item to the queue. Null items (ephemeral reactions) are
 * ignored, returning the queue unchanged. Pure: returns a new queue.
 * @param {Queue} queue
 * @param {QueueItem | null} item
 * @returns {Queue}
 */
export function addItem(queue, item) {
  if (!item) return queue;
  return { items: [...queue.items, item] };
}

/**
 * Items whose scheduledFor is at or before `now`.
 * @param {Queue} queue
 * @param {number} now epoch ms
 * @returns {QueueItem[]}
 */
export function dueItems(queue, now) {
  return queue.items.filter(i => i.scheduledFor <= now);
}

/**
 * Interleave due resurface items into a fresh feed at roughly `mixRatio`.
 * Returns a copy of `fresh` when nothing is due.
 * @param {BlendFeedArgs} args
 * @returns {Post[]}
 */
export function blendFeed({ fresh, queue, now, mixRatio, postLookup }) {
  const due = dueItems(queue, now);
  if (due.length === 0) return [...fresh];

  const totalLen = Math.ceil(fresh.length / (1 - mixRatio));
  const targetResurfaced = Math.min(due.length, totalLen - fresh.length);
  if (targetResurfaced <= 0) return [...fresh];

  const result = [];
  let freshIdx = 0;
  let resurfacedIdx = 0;
  for (let i = 0; i < fresh.length + targetResurfaced; i++) {
    const shouldResurface =
      resurfacedIdx < targetResurfaced &&
      Math.floor((i * targetResurfaced) / (fresh.length + targetResurfaced)) > resurfacedIdx - 1 &&
      Math.floor((i * targetResurfaced) / (fresh.length + targetResurfaced)) <= resurfacedIdx;

    if (shouldResurface) {
      const item = due[resurfacedIdx];
      result.push(postLookup(item.postId));
      resurfacedIdx += 1;
    } else if (freshIdx < fresh.length) {
      result.push(fresh[freshIdx]);
      freshIdx += 1;
    }
  }

  while (freshIdx < fresh.length) result.push(fresh[freshIdx++]);
  return result;
}
