// lib/resurface-queue.js

export function createQueue() {
  return { items: [] };
}

export function addItem(queue, item) {
  if (!item) return queue;
  return { items: [...queue.items, item] };
}

export function dueItems(queue, now) {
  return queue.items.filter(i => i.scheduledFor <= now);
}

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
