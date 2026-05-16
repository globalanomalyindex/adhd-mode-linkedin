// lib/spaced-repetition.js
const DAY_MS = 24 * 60 * 60 * 1000;

const SCHEDULES = {
  insightful: { initialDays: 3,  multiplier: 2.5 },
  support:    { initialDays: 7,  multiplier: 2.0 },
  love:       { initialDays: 14, multiplier: 1.5 },
};

const NON_RESURFACING = new Set(['like', 'celebrate', 'funny']);
const MAX_EXPOSURES = 4;

export const RESURFACING_REACTIONS = Object.keys(SCHEDULES);

export function schedule({ reaction, now, postId }) {
  if (NON_RESURFACING.has(reaction)) return null;
  const config = SCHEDULES[reaction];
  if (!config) throw new Error(`Unknown reaction: ${reaction}`);
  return {
    postId,
    reaction,
    exposureCount: 0,
    intervalDays: config.initialDays,
    scheduledFor: now + config.initialDays * DAY_MS,
  };
}

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
