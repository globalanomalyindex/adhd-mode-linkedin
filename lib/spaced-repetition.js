// lib/spaced-repetition.js
/** @typedef {import('./types').Reaction} Reaction */
/** @typedef {import('./types').ResurfacingReaction} ResurfacingReaction */
/** @typedef {import('./types').ScheduleItem} ScheduleItem */
/** @typedef {import('./types').ScheduleArgs} ScheduleArgs */

const DAY_MS = 24 * 60 * 60 * 1000;

/** @type {Record<ResurfacingReaction, { initialDays: number, multiplier: number }>} */
const SCHEDULES = {
  insightful: { initialDays: 3,  multiplier: 2.5 },
  support:    { initialDays: 7,  multiplier: 2.0 },
  love:       { initialDays: 14, multiplier: 1.5 },
};

/** @type {Set<Reaction>} */
const NON_RESURFACING = new Set(['like', 'celebrate', 'funny']);
const MAX_EXPOSURES = 4;

/**
 * The three reactions that seed a resurface (canon section 4).
 * @type {ResurfacingReaction[]}
 */
export const RESURFACING_REACTIONS = /** @type {ResurfacingReaction[]} */ (
  Object.keys(SCHEDULES)
);

/**
 * Schedule a resurface for a reacted post. Returns null for ephemeral
 * reactions (like, celebrate, funny); throws on an unknown reaction.
 * @param {ScheduleArgs} args
 * @returns {ScheduleItem | null}
 */
export function schedule({ reaction, now, postId }) {
  if (NON_RESURFACING.has(reaction)) return null;
  const config = SCHEDULES[/** @type {ResurfacingReaction} */ (reaction)];
  if (!config) throw new Error(`Unknown reaction: ${reaction}`);
  return {
    postId,
    reaction: /** @type {ResurfacingReaction} */ (reaction),
    exposureCount: 0,
    intervalDays: config.initialDays,
    scheduledFor: now + config.initialDays * DAY_MS,
  };
}

/**
 * Advance an item to its next exposure. Returns null once the item has been
 * shown MAX_EXPOSURES times (it retires from the queue).
 * @param {ScheduleItem} item
 * @param {number} shownAt epoch ms the item was shown at
 * @returns {ScheduleItem | null}
 */
export function advance(item, shownAt) {
  const nextExposure = item.exposureCount + 1;
  if (nextExposure >= MAX_EXPOSURES) return null;
  const multiplier = SCHEDULES[item.reaction].multiplier;
  const nextIntervalDays = item.intervalDays * multiplier;
  return {
    ...item,
    exposureCount: nextExposure,
    intervalDays: nextIntervalDays,
    scheduledFor: shownAt + nextIntervalDays * DAY_MS,
  };
}
