// lib/gestures.test.js
import { describe, it, expect } from 'vitest';
import { classifyGesture, magnificationFor, REACTIONS_ORDER } from './gestures.js';

const VIEW = { width: 360, height: 640 };

describe('classifyGesture()', () => {
  it('returns idle when displacement is below threshold', () => {
    const g = classifyGesture({ dx: 4, dy: 8 }, VIEW);
    expect(g.zone).toBe('idle');
  });

  it('returns skip when dragged up beyond threshold', () => {
    const g = classifyGesture({ dx: 0, dy: -120 }, VIEW);
    expect(g.zone).toBe('skip');
    expect(g.commit).toBe(true);
  });

  it('returns react with default Like when dragged straight down beyond threshold', () => {
    const g = classifyGesture({ dx: 0, dy: 120 }, VIEW);
    expect(g.zone).toBe('react');
    expect(g.reaction).toBe('like');
    expect(g.commit).toBe(true);
  });

  it('selects a richer reaction when down-drag drifts sideways', () => {
    const g = classifyGesture({ dx: 140, dy: 120 }, VIEW);
    expect(g.zone).toBe('react');
    expect(g.reaction).toBe(REACTIONS_ORDER[REACTIONS_ORDER.length - 1]);
  });

  it('marks gesture as preview (not commit) below the commit threshold', () => {
    const g = classifyGesture({ dx: 0, dy: 60 }, VIEW);
    expect(g.zone).toBe('react');
    expect(g.commit).toBe(false);
  });
});

describe('magnificationFor()', () => {
  it('returns 1.0 (no magnification) for reactions far from the cursor', () => {
    const m = magnificationFor('insightful', { dx: -200, dy: 120 }, VIEW);
    expect(m).toBeCloseTo(1.0, 1);
  });

  it('returns > 1.5 for the reaction directly under the cursor', () => {
    const m = magnificationFor('like', { dx: 0, dy: 120 }, VIEW);
    expect(m).toBeGreaterThan(1.5);
  });
});

describe('REACTIONS_ORDER', () => {
  it('contains the six LinkedIn reactions in display order', () => {
    expect(REACTIONS_ORDER).toEqual(['like', 'celebrate', 'support', 'love', 'insightful', 'funny']);
  });
});
