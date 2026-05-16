// lib/gestures.js
export const REACTIONS_ORDER = ['like', 'celebrate', 'support', 'love', 'insightful', 'funny'];

const IDLE_THRESHOLD_PX  = 16;
const COMMIT_THRESHOLD_PX = 96;
const MAG_RADIUS_PX = 80;
const MAG_PEAK = 1.8;

// Reactions are arranged so that dx=0 maps to the first reaction (like, the
// default), and increasing positive dx walks through the row to the last
// reaction (funny). The row spans `arcWidth` pixels, biased to the right of
// the touch origin so a small sideways drift previews a richer reaction.
function reactionOffsetDx(reaction, viewWidth) {
  const i = REACTIONS_ORDER.indexOf(reaction);
  const n = REACTIONS_ORDER.length;
  const arcWidth = viewWidth * 0.4;
  const step = arcWidth / (n - 1);
  return step * i;
}

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

export function magnificationFor(reaction, { dx, dy }, view) {
  if (dy <= 0) return 1.0;
  const ox = reactionOffsetDx(reaction, view.width);
  const distance = Math.abs(dx - ox);
  if (distance >= MAG_RADIUS_PX) return 1.0;
  const t = 1 - distance / MAG_RADIUS_PX;
  const eased = 1 - Math.pow(1 - t, 2);
  return 1.0 + (MAG_PEAK - 1.0) * eased;
}
