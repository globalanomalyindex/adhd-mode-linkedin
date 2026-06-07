// lib/gestures.js
/** @typedef {import('./types').Reaction} Reaction */
/** @typedef {import('./types').Delta} Delta */
/** @typedef {import('./types').View} View */
/** @typedef {import('./types').GestureClass} GestureClass */

/**
 * The six LinkedIn reactions in dock display order (canon section 4).
 * @type {Reaction[]}
 */
export const REACTIONS_ORDER = ['like', 'celebrate', 'support', 'love', 'insightful', 'funny'];

const IDLE_THRESHOLD_PX  = 16;
const COMMIT_THRESHOLD_PX = 96;
const MAG_RADIUS_PX = 80;
const MAG_PEAK = 1.8;

// Reactions are arranged so that dx=0 maps to the first reaction (like, the
// default), and increasing positive dx walks through the row to the last
// reaction (funny). The row spans `arcWidth` pixels, biased to the right of
// the touch origin so a small sideways drift previews a richer reaction.
/**
 * Horizontal offset (px) of a reaction within the drag arc.
 * @param {Reaction} reaction
 * @param {number} viewWidth
 * @returns {number}
 */
function reactionOffsetDx(reaction, viewWidth) {
  const i = REACTIONS_ORDER.indexOf(reaction);
  const n = REACTIONS_ORDER.length;
  const arcWidth = viewWidth * 0.4;
  const step = arcWidth / (n - 1);
  return step * i;
}

/**
 * The reaction whose arc offset is closest to the given horizontal drift.
 * @param {number} dx
 * @param {number} viewWidth
 * @returns {Reaction}
 */
function nearestReaction(dx, viewWidth) {
  let best = REACTIONS_ORDER[0];
  let bestDist = Infinity;
  for (const r of REACTIONS_ORDER) {
    const ox = reactionOffsetDx(r, viewWidth);
    const d = Math.abs(dx - ox);
    if (d < bestDist) { bestDist = d; best = r; }
  }
  return best;
}

/**
 * Classify a drag delta into an idle, skip, or react gesture.
 * @param {Delta} delta
 * @param {View} view
 * @returns {GestureClass}
 */
export function classifyGesture({ dx, dy }, view) {
  const distance = Math.hypot(dx, dy);
  if (distance < IDLE_THRESHOLD_PX) return { zone: 'idle' };

  if (dy < 0 && Math.abs(dy) > Math.abs(dx)) {
    return {
      zone: 'skip',
      progress: Math.min(Math.abs(dy) / COMMIT_THRESHOLD_PX, 1),
      commit: Math.abs(dy) >= COMMIT_THRESHOLD_PX,
    };
  }

  if (dy > 0) {
    const reaction = nearestReaction(dx, view.width);
    return {
      zone: 'react',
      reaction,
      progress: Math.min(dy / COMMIT_THRESHOLD_PX, 1),
      commit: dy >= COMMIT_THRESHOLD_PX,
    };
  }

  return { zone: 'idle' };
}

/**
 * Magnification factor (1.0 .. MAG_PEAK) for a reaction given the cursor's
 * proximity to that reaction's arc offset. Returns 1.0 when not down-dragging.
 * @param {Reaction} reaction
 * @param {Delta} delta
 * @param {View} view
 * @returns {number}
 */
export function magnificationFor(reaction, { dx, dy }, view) {
  if (dy <= 0) return 1.0;
  const ox = reactionOffsetDx(reaction, view.width);
  const distance = Math.abs(dx - ox);
  if (distance >= MAG_RADIUS_PX) return 1.0;
  const t = 1 - distance / MAG_RADIUS_PX;
  const eased = 1 - Math.pow(1 - t, 2);
  return 1.0 + (MAG_PEAK - 1.0) * eased;
}
