# ADHD Mode for LinkedIn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three coordinated portfolio deliverables for the ADHD Mode for LinkedIn design: a working HTML/JS interactive prototype, a Figma-ready specification package, and a case study writeup.

**Architecture:** A vanilla-JS, no-build single project. Pure logic lives in `lib/` as ES modules with colocated Vitest tests. Visual screens live as standalone HTML files in `screens/` that share a CSS-token design system. The interactive prototype assembles screens + lib modules. The Figma package is generated from the same tokens. The case study is its own HTML document that embeds the artifacts.

**Tech Stack:** HTML, modern CSS (custom properties, container queries), vanilla JavaScript (ES modules), Vitest for logic tests, Source Sans 3 (Google Fonts). No bundler, no framework. Browser-native everything.

**Reference implementations:** the production-grade `end-of-session.html` (motion system + LinkedIn-native visual language) and the design spec at `docs/superpowers/specs/2026-05-16-adhd-mode-linkedin-design.md`.

---

## File Structure

```
adhd-mode-app/
├── README.md
├── package.json
├── vitest.config.js
├── .gitignore
├── docs/superpowers/
│   ├── specs/2026-05-16-adhd-mode-linkedin-design.md  (exists)
│   └── plans/2026-05-16-adhd-mode-implementation.md   (this file)
├── design-system/
│   ├── tokens.css      single source of truth for visual + motion tokens
│   ├── tokens.json     W3C Design Tokens format for Figma import
│   └── base.css        resets, typography, primitive components
├── lib/
│   ├── spaced-repetition.js      scheduling math for the resurface queue
│   ├── spaced-repetition.test.js
│   ├── session-state.js          finite state machine for a session
│   ├── session-state.test.js
│   ├── reflow.js                 long-post chunking
│   ├── reflow.test.js
│   ├── gestures.js               threshold detection, magnification math
│   ├── gestures.test.js
│   ├── resurface-queue.js        queue storage + feed-blend logic
│   └── resurface-queue.test.js
├── screens/
│   ├── entry-point.html
│   ├── session-setup.html
│   ├── mid-session-checkin.html
│   ├── end-of-session.html       (refactor of existing root-level file)
│   └── before-feed-annotated.html
├── prototype/
│   ├── index.html                the working interactive prototype
│   ├── prototype.js              orchestration: state + DOM + event loop
│   └── sample-feed.js            canned post data for the prototype
├── figma-spec/
│   ├── tokens.json               (mirrors design-system/tokens.json)
│   ├── components.md             atomic → molecular → organism specs
│   └── screens.md                frame-by-frame screen specs
└── case-study/
    ├── index.html                the case study writeup
    └── case-study.css            scoped styles for the writeup
```

---

## Phase 0: Project Foundation

### Task 1: Initialize the repository

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `package.json`

- [ ] **Step 1: Initialize git in the project directory**

Run:
```bash
cd /Users/chrisfiore/Documents/Claude/Projects/adhd-mode-app
git init
```
Expected: `Initialized empty Git repository in .../adhd-mode-app/.git/`

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
.DS_Store
.superpowers/
.vitest-cache/
coverage/
*.log
.claude/
```

- [ ] **Step 3: Create `README.md`**

```markdown
# ADHD Mode for LinkedIn

A portfolio piece by Chris Fiore. Designs a research-grounded "Focus Session" feature inside LinkedIn for people with ADHD and Cognitive Disengagement Syndrome.

## Contents

- `docs/superpowers/specs/` , design specification
- `docs/superpowers/plans/` , implementation plan
- `design-system/` , tokens (CSS + W3C JSON)
- `lib/` , pure logic modules with Vitest tests
- `screens/` , static high-fidelity screens
- `prototype/` , working interactive prototype
- `figma-spec/` , Figma-ready specification package
- `case-study/` , case study writeup

## Running

Open any HTML file in a modern browser. No build step.

For the working prototype: open `prototype/index.html`.

## Testing the logic modules

```bash
npm install
npm test
```
```

- [ ] **Step 4: Create `package.json`**

```json
{
  "name": "adhd-mode-linkedin",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "ADHD Mode for LinkedIn portfolio piece",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^1.6.0",
    "@vitest/coverage-v8": "^1.6.0",
    "jsdom": "^24.0.0"
  }
}
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: `added N packages` with no errors.

- [ ] **Step 6: Create `vitest.config.js`**

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['lib/**/*.test.js'],
    globals: true,
  },
});
```

- [ ] **Step 7: Initial commit**

```bash
git add .gitignore README.md package.json vitest.config.js package-lock.json
git commit -m "chore: initial project scaffold with Vitest"
```

### Task 2: Move the existing end-of-session.html into the new structure

**Files:**
- Modify: move `end-of-session.html` → `screens/end-of-session.html`

- [ ] **Step 1: Create the directory and move the file**

```bash
mkdir -p screens
git mv end-of-session.html screens/end-of-session.html
```

- [ ] **Step 2: Verify it still opens correctly**

Open `screens/end-of-session.html` in a browser. Confirm: card fades in, "Done." rises, stats count up 0→11, 0→4, 0→3, queue items stagger in, hover states work on queue items and CTAs.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: move end-of-session.html into screens/"
```

---

## Phase 1: Design System

### Task 3: Extract design tokens into `design-system/tokens.css`

**Files:**
- Create: `design-system/tokens.css`

- [ ] **Step 1: Create `design-system/tokens.css`** with the canonical token set

```css
/* =========================================================
   ADHD MODE · DESIGN TOKENS
   Single source of truth. Imported by every screen and the
   working prototype. Mirror exists in tokens.json (W3C format)
   for Figma import via the Tokens Studio plugin.
   ========================================================= */

:root {
  /* ---------- COLOR ---------- */
  --bg:              #f4f2ee;
  --card:            #ffffff;
  --brand:           #0a66c2;
  --brand-hover:     #004182;
  --brand-tint:      rgba(10, 102, 194, 0.04);
  --text:            rgba(0, 0, 0, 0.9);
  --text-secondary:  rgba(0, 0, 0, 0.6);
  --text-tertiary:   rgba(0, 0, 0, 0.45);
  --hairline:        rgba(0, 0, 0, 0.06);
  --skip-grey:       rgba(0, 0, 0, 0.42);
  --skip-tint:       rgba(0, 0, 0, 0.06);
  --shadow:          0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-hover:    0 0 0 1px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.06);
  --shadow-drag:     0 0 0 1px rgba(0,0,0,0.10), 0 12px 32px rgba(0,0,0,0.12);

  /* Reaction accents (background tints for hover/commit states) */
  --react-insightful: #fef3c7;
  --react-support:    #ffedd5;
  --react-love:       #fee2e2;
  --react-celebrate:  #e0e7ff;

  /* ---------- TYPOGRAPHY ---------- */
  --font-sans: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif;
  --fs-display:   32px;
  --fs-heading:   20px;
  --fs-body:      14px;
  --fs-small:     13px;
  --fs-meta:      12px;
  --fs-tiny:      11px;
  --lh-tight:     1.15;
  --lh-base:      1.4;
  --lh-loose:     1.6;
  --tracking-tight: -0.015em;
  --tracking-wide:   0.04em;

  /* ---------- SPACE ---------- */
  --s-1:  4px;
  --s-2:  8px;
  --s-3:  12px;
  --s-4:  16px;
  --s-5:  20px;
  --s-6:  24px;
  --s-7:  32px;
  --s-8:  40px;
  --s-9:  56px;

  /* ---------- RADIUS ---------- */
  --r-sm:   4px;
  --r-md:   8px;
  --r-lg:   12px;
  --r-pill: 999px;

  /* ---------- MOTION ---------- */
  --d-fast:   150ms;
  --d-base:   240ms;
  --d-slow:   400ms;
  --d-page:   600ms;
  --ease-out:     cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --lift-sm:  4px;
  --lift-md:  8px;
  --lift-lg:  16px;
  --stagger-tight:  40ms;
  --stagger-loose:  80ms;
}

@media (prefers-color-scheme: dark) {
  /* Out of scope for the portfolio prototype; LinkedIn doesn't yet ship
     a fully tokenized dark mode for the feed. Note for future work. */
}
```

- [ ] **Step 2: Commit**

```bash
git add design-system/tokens.css
git commit -m "feat(design-system): add tokens.css with full token set"
```

### Task 4: Create `design-system/base.css` with resets and primitives

**Files:**
- Create: `design-system/base.css`

- [ ] **Step 1: Create the file**

```css
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300..700;1,400..600&display=swap');
@import url('./tokens.css');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: var(--fs-body);
  line-height: var(--lh-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'kern', 'liga';
}

button {
  font-family: inherit;
  font-size: inherit;
  border: none;
  background: none;
  cursor: pointer;
  color: inherit;
}

/* Primitive: card surface */
.surface-card {
  background: var(--card);
  border-radius: var(--r-md);
  box-shadow: var(--shadow);
}

/* Primitive: button styles */
.btn-primary {
  background: var(--brand);
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: var(--r-pill);
  transition: background var(--d-fast) var(--ease-in-out),
              transform var(--d-fast) var(--ease-out),
              box-shadow var(--d-base) var(--ease-out);
}
.btn-primary:hover {
  background: var(--brand-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 102, 194, 0.25);
}
.btn-primary:active { transform: translateY(0); }

.btn-text {
  color: var(--brand);
  font-weight: 600;
  padding: 8px 4px;
  position: relative;
  transition: color var(--d-fast) var(--ease-in-out);
}
.btn-text::after {
  content: '';
  position: absolute;
  left: 4px; right: 4px; bottom: 4px;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--d-base) var(--ease-out);
}
.btn-text:hover { color: var(--brand-hover); }
.btn-text:hover::after { transform: scaleX(1); }

/* Reduced motion: opacity-only fallback */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-delay: 0ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add design-system/base.css
git commit -m "feat(design-system): add base.css with resets and button primitives"
```

### Task 5: Create `design-system/tokens.json` in W3C Design Tokens format

**Files:**
- Create: `design-system/tokens.json`

- [ ] **Step 1: Create the file** (W3C Design Tokens Format Module, compatible with Figma Tokens Studio plugin)

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "bg":              { "$type": "color", "$value": "#f4f2ee" },
    "card":            { "$type": "color", "$value": "#ffffff" },
    "brand":           { "$type": "color", "$value": "#0a66c2" },
    "brand-hover":     { "$type": "color", "$value": "#004182" },
    "brand-tint":      { "$type": "color", "$value": "rgba(10, 102, 194, 0.04)" },
    "text":            { "$type": "color", "$value": "rgba(0, 0, 0, 0.9)" },
    "text-secondary":  { "$type": "color", "$value": "rgba(0, 0, 0, 0.6)" },
    "text-tertiary":   { "$type": "color", "$value": "rgba(0, 0, 0, 0.45)" },
    "hairline":        { "$type": "color", "$value": "rgba(0, 0, 0, 0.06)" },
    "skip-grey":       { "$type": "color", "$value": "rgba(0, 0, 0, 0.42)" },
    "react-insightful":{ "$type": "color", "$value": "#fef3c7" },
    "react-support":   { "$type": "color", "$value": "#ffedd5" },
    "react-love":      { "$type": "color", "$value": "#fee2e2" },
    "react-celebrate": { "$type": "color", "$value": "#e0e7ff" }
  },
  "typography": {
    "font-sans": { "$type": "fontFamily", "$value": ["Source Sans 3", "-apple-system", "BlinkMacSystemFont", "sans-serif"] },
    "fs-display": { "$type": "dimension", "$value": "32px" },
    "fs-heading": { "$type": "dimension", "$value": "20px" },
    "fs-body":    { "$type": "dimension", "$value": "14px" },
    "fs-small":   { "$type": "dimension", "$value": "13px" },
    "fs-meta":    { "$type": "dimension", "$value": "12px" },
    "fs-tiny":    { "$type": "dimension", "$value": "11px" }
  },
  "space": {
    "1": { "$type": "dimension", "$value": "4px" },
    "2": { "$type": "dimension", "$value": "8px" },
    "3": { "$type": "dimension", "$value": "12px" },
    "4": { "$type": "dimension", "$value": "16px" },
    "5": { "$type": "dimension", "$value": "20px" },
    "6": { "$type": "dimension", "$value": "24px" },
    "7": { "$type": "dimension", "$value": "32px" },
    "8": { "$type": "dimension", "$value": "40px" },
    "9": { "$type": "dimension", "$value": "56px" }
  },
  "radius": {
    "sm":   { "$type": "dimension", "$value": "4px" },
    "md":   { "$type": "dimension", "$value": "8px" },
    "lg":   { "$type": "dimension", "$value": "12px" },
    "pill": { "$type": "dimension", "$value": "999px" }
  },
  "motion": {
    "duration": {
      "fast": { "$type": "duration", "$value": "150ms" },
      "base": { "$type": "duration", "$value": "240ms" },
      "slow": { "$type": "duration", "$value": "400ms" },
      "page": { "$type": "duration", "$value": "600ms" }
    },
    "easing": {
      "out":     { "$type": "cubicBezier", "$value": [0.16, 1, 0.3, 1] },
      "in-out":  { "$type": "cubicBezier", "$value": [0.4, 0, 0.2, 1] },
      "spring":  { "$type": "cubicBezier", "$value": [0.34, 1.56, 0.64, 1] }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add design-system/tokens.json
git commit -m "feat(design-system): add W3C Design Tokens JSON for Figma import"
```

### Task 6: Refactor `screens/end-of-session.html` to import the shared token files

**Files:**
- Modify: `screens/end-of-session.html`

- [ ] **Step 1: Replace the inline `:root` token block and the Google Fonts `<link>` with an `@import url('../design-system/base.css');` at the top of the `<style>` block**

In `screens/end-of-session.html`, find the `<style>` block. Delete the `:root { ... }` token declarations and the `<link rel="preconnect">` + Google Fonts `<link>` tags from the `<head>`. Add this single line at the top of the `<style>` block:

```css
@import url('../design-system/base.css');
```

Keep all the screen-specific styles (`.card`, `.header`, `.hero`, etc.) below the import. The token references (`var(--brand)`, `var(--ease-out)`, etc.) keep working because they resolve from the imported file.

- [ ] **Step 2: Verify in browser**

Open `screens/end-of-session.html` in a browser. It must look and animate identically to before. Specifically verify: the `Done.` headline still uses Source Sans 3 (loaded via the imported base.css), the stat numbers still count up, hover states still work.

- [ ] **Step 3: Commit**

```bash
git add screens/end-of-session.html
git commit -m "refactor(screens): end-of-session imports shared design tokens"
```

---

## Phase 2: Pure Logic Libraries (TDD)

Every module in `lib/` is a pure ES module that takes plain inputs and returns plain outputs. No DOM, no globals, no side effects. Tested in isolation. The prototype imports them in Phase 4.

### Task 7: `lib/spaced-repetition.js` , scheduling math

**Files:**
- Create: `lib/spaced-repetition.test.js`
- Create: `lib/spaced-repetition.js`

- [ ] **Step 1: Write the failing test file**

```javascript
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
```

- [ ] **Step 2: Run the test, confirm it fails**

Run: `npm test`
Expected: tests fail with `Cannot find module './spaced-repetition.js'` or similar.

- [ ] **Step 3: Implement the module**

```javascript
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
```

- [ ] **Step 4: Run the test, confirm pass**

Run: `npm test`
Expected: all spaced-repetition tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/spaced-repetition.js lib/spaced-repetition.test.js
git commit -m "feat(lib): spaced-repetition scheduling with full test coverage"
```

### Task 8: `lib/session-state.js` , finite state machine for a session

**Files:**
- Create: `lib/session-state.test.js`
- Create: `lib/session-state.js`

- [ ] **Step 1: Write the failing test**

```javascript
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
  it('entry → setup on START_SETUP', () => {
    const s = send(createSession(), { type: 'START_SETUP' });
    expect(s.state).toBe('setup');
  });

  it('setup → active on BEGIN with mode and duration', () => {
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

  it('active → checkpoint when CARD_SEEN count reaches postCap', () => {
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 3 });
    s = send(s, { type: 'CARD_SEEN' });
    s = send(s, { type: 'CARD_SEEN' });
    expect(s.state).toBe('active');
    s = send(s, { type: 'CARD_SEEN' });
    expect(s.state).toBe('checkpoint');
  });

  it('checkpoint → active on CONTINUE', () => {
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 1 });
    s = send(s, { type: 'CARD_SEEN' });
    expect(s.state).toBe('checkpoint');
    s = send(s, { type: 'CONTINUE' });
    expect(s.state).toBe('active');
  });

  it('checkpoint → end on WRAP', () => {
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 1 });
    s = send(s, { type: 'CARD_SEEN' });
    s = send(s, { type: 'WRAP' });
    expect(s.state).toBe('end');
  });

  it('active → end on TIME_UP', () => {
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 12 });
    s = send(s, { type: 'TIME_UP' });
    expect(s.state).toBe('end');
  });

  it('end → exit on CLOSE', () => {
    let s = createSession();
    s = send(s, { type: 'START_SETUP' });
    s = send(s, { type: 'BEGIN', mode: 'focus', durationSec: 720, postCap: 12 });
    s = send(s, { type: 'TIME_UP' });
    s = send(s, { type: 'CLOSE' });
    expect(s.state).toBe('exit');
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `npm test`
Expected: failures referencing missing `./session-state.js`.

- [ ] **Step 3: Implement**

```javascript
// lib/session-state.js
import { RESURFACING_REACTIONS } from './spaced-repetition.js';

const RESURFACE_SET = new Set(RESURFACING_REACTIONS);

export function createSession() {
  return {
    state: 'entry',
    mode: null,
    durationSec: null,
    postCap: null,
    cardsSeen: 0,
    reactionsSent: 0,
    queueAdds: 0,
    startedAt: null,
  };
}

export function send(session, event) {
  switch (session.state) {
    case 'entry':
      if (event.type === 'START_SETUP') return { ...session, state: 'setup' };
      return session;

    case 'setup':
      if (event.type === 'BEGIN') {
        return {
          ...session,
          state: 'active',
          mode: event.mode,
          durationSec: event.durationSec,
          postCap: event.postCap,
          startedAt: Date.now(),
        };
      }
      return session;

    case 'active': {
      if (event.type === 'TIME_UP' || event.type === 'WRAP') {
        return { ...session, state: 'end' };
      }
      if (event.type === 'CARD_SEEN') {
        const next = { ...session, cardsSeen: session.cardsSeen + 1 };
        if (next.cardsSeen >= session.postCap) {
          return { ...next, state: 'checkpoint' };
        }
        return next;
      }
      if (event.type === 'REACT') {
        return {
          ...session,
          reactionsSent: session.reactionsSent + 1,
          queueAdds: session.queueAdds + (RESURFACE_SET.has(event.reaction) ? 1 : 0),
        };
      }
      return session;
    }

    case 'checkpoint':
      if (event.type === 'CONTINUE') return { ...session, state: 'active' };
      if (event.type === 'WRAP') return { ...session, state: 'end' };
      return session;

    case 'end':
      if (event.type === 'CLOSE') return { ...session, state: 'exit' };
      return session;

    default:
      return session;
  }
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm test`
Expected: all session-state tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/session-state.js lib/session-state.test.js
git commit -m "feat(lib): session-state finite state machine"
```

### Task 9: `lib/reflow.js` , long-post chunking

**Files:**
- Create: `lib/reflow.test.js`
- Create: `lib/reflow.js`

- [ ] **Step 1: Write the failing test**

```javascript
// lib/reflow.test.js
import { describe, it, expect } from 'vitest';
import { classifyPost, chunkPost, generateTldr } from './reflow.js';

const SHORT_POST = { id: 'p1', text: 'Just shipped a thing. Feels good.', author: 'A' };
const LONG_POST = {
  id: 'p2',
  author: 'Maya Chen',
  text: 'I almost quit my job last year.\n\nIt was 11pm on a Thursday. I was sitting in my car in the office parking lot, staring at my phone.\n\nI had just opened our internal Slack to see another message from our CTO: "Can you jump on a call tomorrow at 7am?"\n\nI closed the app. I opened my email. I started typing a resignation letter.\n\nI didn\'t send it. Here\'s why, and here\'s what I learned about leading through ambiguity that I wish someone had told me three years ago.\n\nWhen you take a senior role at a fast-growing company, nobody tells you that 80% of your job is going to be making decisions with incomplete information.\n\nYour job isn\'t to remove ambiguity. It IS the job. Three things that means:\n\n1. Make decisions, even bad ones, faster than feels comfortable.\n2. Tell people what you don\'t know, as honestly as you can.\n3. Give them a framework for moving forward without you.',
};

describe('classifyPost()', () => {
  it('classifies short posts as short and skips reflow', () => {
    const c = classifyPost(SHORT_POST);
    expect(c.shouldReflow).toBe(false);
    expect(c.kind).toBe('short');
  });

  it('classifies long posts as needing reflow', () => {
    const c = classifyPost(LONG_POST);
    expect(c.shouldReflow).toBe(true);
    expect(['narrative', 'listicle', 'mixed']).toContain(c.kind);
  });
});

describe('chunkPost()', () => {
  it('returns a single chunk for short posts', () => {
    const chunks = chunkPost(SHORT_POST);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].kind).toBe('body');
  });

  it('returns a TL;DR card followed by 2-4 body chunks for long posts', () => {
    const chunks = chunkPost(LONG_POST);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks.length).toBeLessThanOrEqual(5);
    expect(chunks[0].kind).toBe('tldr');
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i].kind).toBe('body');
    }
  });

  it('preserves numbered list items as a contiguous chunk', () => {
    const chunks = chunkPost(LONG_POST);
    const listChunk = chunks.find(c => c.text.includes('1.') && c.text.includes('2.') && c.text.includes('3.'));
    expect(listChunk).toBeDefined();
  });
});

describe('generateTldr()', () => {
  it('returns a third-person sentence under 200 characters', () => {
    const tldr = generateTldr(LONG_POST);
    expect(tldr.length).toBeLessThan(200);
    expect(tldr).toContain('Maya');
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `npm test`
Expected: failures referencing missing `./reflow.js`.

- [ ] **Step 3: Implement** (stub TL;DR generation; in production this would call an LLM API)

```javascript
// lib/reflow.js
const SHORT_THRESHOLD_WORDS = 60;
const TARGET_CHUNK_MIN_WORDS = 40;
const TARGET_CHUNK_MAX_WORDS = 120;

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function classifyPost(post) {
  const words = wordCount(post.text);
  if (words < SHORT_THRESHOLD_WORDS) {
    return { shouldReflow: false, kind: 'short', words };
  }
  const hasNumberedList = /(^|\n)\s*\d+\.\s+/m.test(post.text);
  const kind = hasNumberedList ? 'mixed' : 'narrative';
  return { shouldReflow: true, kind, words };
}

export function generateTldr(post) {
  // Stub: a real implementation would call a summarization LLM.
  // For the prototype, derive a third-person opener from the first paragraph
  // plus a hint of the second.
  const firstPara = post.text.split('\n\n')[0].replace(/\s+/g, ' ').trim();
  const opener = `${post.author.split(' ')[0]} ${firstPara.replace(/^I /, '').toLowerCase()}`;
  // Truncate to a reasonable summary length without breaking mid-word.
  const truncated = opener.length > 180 ? opener.slice(0, 177) + '...' : opener;
  return truncated.charAt(0).toUpperCase() + truncated.slice(1);
}

export function chunkPost(post) {
  const classification = classifyPost(post);
  if (!classification.shouldReflow) {
    return [{ kind: 'body', text: post.text, pageIndex: 0, pageTotal: 1 }];
  }

  // Build body chunks by grouping paragraphs up to TARGET_CHUNK_MAX_WORDS.
  // Numbered list runs stay together.
  const paragraphs = post.text.split('\n\n').map(p => p.trim()).filter(Boolean);
  const bodyChunks = [];
  let buffer = [];
  let bufferWords = 0;

  function flush() {
    if (buffer.length === 0) return;
    bodyChunks.push({ kind: 'body', text: buffer.join('\n\n'), pageIndex: 0, pageTotal: 0 });
    buffer = [];
    bufferWords = 0;
  }

  for (const para of paragraphs) {
    const paraWords = wordCount(para);
    const isListRun = /^\s*\d+\.\s+/.test(para);

    // Always keep list-like paragraphs together if adjacent (treat as a single block).
    if (bufferWords + paraWords > TARGET_CHUNK_MAX_WORDS && bufferWords >= TARGET_CHUNK_MIN_WORDS && !isListRun) {
      flush();
    }
    buffer.push(para);
    bufferWords += paraWords;
  }
  flush();

  // Fill in page metadata
  const total = bodyChunks.length + 1; // +1 for the TL;DR card
  const tldrChunk = { kind: 'tldr', text: generateTldr(post), pageIndex: 0, pageTotal: total };
  bodyChunks.forEach((c, i) => {
    c.pageIndex = i + 1;
    c.pageTotal = total;
  });

  return [tldrChunk, ...bodyChunks];
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm test`
Expected: all reflow tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/reflow.js lib/reflow.test.js
git commit -m "feat(lib): long-post reflow with TDD coverage"
```

### Task 10: `lib/gestures.js` , drag thresholds and magnification math

**Files:**
- Create: `lib/gestures.test.js`
- Create: `lib/gestures.js`

- [ ] **Step 1: Write the failing test**

```javascript
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
    // Drift to the right end of the arc
    const g = classifyGesture({ dx: 140, dy: 120 }, VIEW);
    expect(g.zone).toBe('react');
    // With dx near the right edge, expect the rightmost reaction in REACTIONS_ORDER
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
    // Like sits in the center; cursor at dx=0 should magnify it
    const m = magnificationFor('like', { dx: 0, dy: 120 }, VIEW);
    expect(m).toBeGreaterThan(1.5);
  });
});

describe('REACTIONS_ORDER', () => {
  it('contains the six LinkedIn reactions in display order', () => {
    expect(REACTIONS_ORDER).toEqual(['like', 'celebrate', 'support', 'love', 'insightful', 'funny']);
  });
});
```

- [ ] **Step 2: Run, confirm failure**

Run: `npm test`
Expected: failures referencing missing `./gestures.js`.

- [ ] **Step 3: Implement**

```javascript
// lib/gestures.js
export const REACTIONS_ORDER = ['like', 'celebrate', 'support', 'love', 'insightful', 'funny'];

const IDLE_THRESHOLD_PX  = 16;   // below this, no gesture detected
const COMMIT_THRESHOLD_PX = 96;  // commit threshold for skip/react
const MAG_RADIUS_PX = 80;        // proximity radius for magnification effect
const MAG_PEAK = 1.8;            // maximum scale factor

function reactionCenterX(reaction, viewWidth) {
  const i = REACTIONS_ORDER.indexOf(reaction);
  const n = REACTIONS_ORDER.length;
  // Distribute the arc across the lower 80% of viewWidth, centered.
  const arcWidth = viewWidth * 0.8;
  const startX = (viewWidth - arcWidth) / 2;
  const step = arcWidth / (n - 1);
  return startX + step * i;
}

function nearestReaction(dxFromCenter, viewWidth) {
  // dx is offset from the center of the screen; convert to absolute x position.
  const absX = viewWidth / 2 + dxFromCenter;
  let best = REACTIONS_ORDER[0];
  let bestDist = Infinity;
  for (const r of REACTIONS_ORDER) {
    const cx = reactionCenterX(r, viewWidth);
    const d = Math.abs(absX - cx);
    if (d < bestDist) { bestDist = d; best = r; }
  }
  return best;
}

export function classifyGesture({ dx, dy }, view) {
  const distance = Math.hypot(dx, dy);
  if (distance < IDLE_THRESHOLD_PX) return { zone: 'idle' };

  // Up = skip
  if (dy < 0 && Math.abs(dy) > Math.abs(dx)) {
    return {
      zone: 'skip',
      progress: Math.min(Math.abs(dy) / COMMIT_THRESHOLD_PX, 1),
      commit: Math.abs(dy) >= COMMIT_THRESHOLD_PX,
    };
  }

  // Down = react
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
  const cx = reactionCenterX(reaction, view.width);
  const absX = view.width / 2 + dx;
  const distance = Math.abs(absX - cx);
  if (distance >= MAG_RADIUS_PX) return 1.0;
  const t = 1 - distance / MAG_RADIUS_PX;
  // ease-out for a calm grow-into-magnification
  const eased = 1 - Math.pow(1 - t, 2);
  return 1.0 + (MAG_PEAK - 1.0) * eased;
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm test`
Expected: all gestures tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/gestures.js lib/gestures.test.js
git commit -m "feat(lib): gesture classification and magnification math"
```

### Task 11: `lib/resurface-queue.js` , queue storage and feed blend

**Files:**
- Create: `lib/resurface-queue.test.js`
- Create: `lib/resurface-queue.js`

- [ ] **Step 1: Write the failing test**

```javascript
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
    // 5 days from NOW: insightful (3 days) is due, love (14 days) is not
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
```

- [ ] **Step 2: Run, confirm failure**

Run: `npm test`
Expected: failures referencing missing `./resurface-queue.js`.

- [ ] **Step 3: Implement**

```javascript
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

/**
 * Blend due resurface items into the fresh feed at the specified mix ratio.
 * The output preserves the order of the fresh feed and inserts resurfaced
 * items at evenly spaced positions.
 */
export function blendFeed({ fresh, queue, now, mixRatio, postLookup }) {
  const due = dueItems(queue, now);
  if (due.length === 0) return [...fresh];

  const totalLen = Math.ceil(fresh.length / (1 - mixRatio));
  const targetResurfaced = Math.min(due.length, totalLen - fresh.length);
  if (targetResurfaced <= 0) return [...fresh];

  // Place resurfaced items at evenly spaced positions.
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

  // Append any unused fresh items
  while (freshIdx < fresh.length) result.push(fresh[freshIdx++]);
  return result;
}
```

- [ ] **Step 4: Run, confirm pass**

Run: `npm test`
Expected: all resurface-queue tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/resurface-queue.js lib/resurface-queue.test.js
git commit -m "feat(lib): resurface queue with feed-blend logic"
```

### Task 12: Verify all logic tests run together and produce coverage

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests across spaced-repetition, session-state, reflow, gestures, resurface-queue pass.

- [ ] **Step 2: Run with coverage**

Run: `npm run test:coverage`
Expected: coverage report prints. Statement coverage should exceed 85% for each module.

- [ ] **Step 3: Commit the coverage script's gitignored output is already excluded**

No commit needed (coverage output is in `.gitignore`). If coverage falls below 85% for any module, add tests until it does, then commit those tests.

---

---

## Phase 3: Static Screens

Every screen in this phase imports `../design-system/base.css` and matches the production fidelity bar set by `end-of-session.html`. Each screen is a standalone HTML file so it can be screenshotted for the case study and the Figma spec.

### Task 13: `screens/entry-point.html` , LinkedIn home with the ADHD Mode CTA

**Files:**
- Create: `screens/entry-point.html`

This screen shows a realistic LinkedIn home feed (top nav, compose prompt, one or two feed posts) with an ADHD Mode entry card inserted near the top. The card is the discoverable but quiet affordance the user taps to start a session.

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ADHD Mode · Entry point</title>
<style>
  @import url('../design-system/base.css');

  body { padding: 24px; display: flex; justify-content: center; }
  .frame { width: 100%; max-width: 560px; display: flex; flex-direction: column; gap: var(--s-2); }

  /* LinkedIn nav stripe */
  .ln-nav {
    background: var(--card); border-radius: var(--r-md);
    padding: 10px 14px; display: flex; gap: 10px; align-items: center;
    box-shadow: var(--shadow);
  }
  .ln-logo {
    width: 32px; height: 32px; background: var(--brand);
    border-radius: var(--r-sm); color: #fff; font-weight: 700;
    display: flex; align-items: center; justify-content: center; font-size: 15px;
  }
  .ln-search {
    flex: 1; background: #eef3f8; border-radius: var(--r-sm); padding: 8px 12px;
    color: var(--text-secondary); font-size: var(--fs-small);
  }

  /* ADHD Mode entry card */
  .adhd-entry {
    background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow);
    padding: var(--s-6);
    display: grid; grid-template-columns: 44px 1fr auto; gap: var(--s-4); align-items: center;
    opacity: 0; transform: translateY(var(--lift-md));
    animation: rise var(--d-slow) var(--ease-out) 100ms forwards;
  }
  .adhd-mark {
    width: 44px; height: 44px; border-radius: var(--r-pill);
    background: linear-gradient(135deg, var(--brand), var(--brand-hover));
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 600; font-size: 14px; letter-spacing: 0.04em;
  }
  .adhd-copy h3 {
    font-size: 15px; font-weight: 600; line-height: var(--lh-tight);
  }
  .adhd-copy p {
    font-size: var(--fs-small); color: var(--text-secondary); margin-top: 2px;
  }
  .adhd-cta {
    background: var(--brand); color: #fff; padding: 8px 18px;
    border-radius: var(--r-pill); font-size: 14px; font-weight: 600;
    transition: background var(--d-fast) var(--ease-in-out),
                transform var(--d-fast) var(--ease-out);
  }
  .adhd-cta:hover { background: var(--brand-hover); transform: translateY(-1px); }

  /* Feed post (typical) */
  .post {
    background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow);
    padding: var(--s-4); opacity: 0; transform: translateY(var(--lift-sm));
    animation: rise var(--d-slow) var(--ease-out) 240ms forwards;
  }
  .post + .post { animation-delay: 320ms; }
  .post-header { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
  .post-avatar { width: 40px; height: 40px; border-radius: var(--r-pill);
    background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
  .post-meta { font-size: var(--fs-small); }
  .post-meta strong { font-weight: 600; }
  .post-meta div { color: var(--text-secondary); font-size: var(--fs-meta); }
  .post-body { font-size: var(--fs-small); line-height: var(--lh-loose); color: var(--text); }

  @keyframes rise { to { opacity: 1; transform: translateY(0); } }
</style>
</head>
<body>
  <div class="frame">
    <div class="ln-nav">
      <div class="ln-logo">in</div>
      <div class="ln-search">Search</div>
    </div>

    <div class="adhd-entry">
      <div class="adhd-mark">af</div>
      <div class="adhd-copy">
        <h3>Start a focus session</h3>
        <p>A calmer way to use the feed. Bounded time, your reactions guide what comes back.</p>
      </div>
      <button class="adhd-cta">Begin</button>
    </div>

    <div class="post">
      <div class="post-header">
        <div class="post-avatar"></div>
        <div class="post-meta"><strong>Maya Chen</strong><div>VP Engineering · 2h</div></div>
      </div>
      <div class="post-body">I almost quit my job last year. It was 11pm on a Thursday...</div>
    </div>

    <div class="post">
      <div class="post-header">
        <div class="post-avatar" style="background: linear-gradient(135deg, #fde68a, #fcd34d);"></div>
        <div class="post-meta"><strong>James Park</strong><div>Former PM at Meta · 4h</div></div>
      </div>
      <div class="post-body">Today I was part of the layoffs at Meta. After 6 years...</div>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `screens/entry-point.html`. Confirm: ADHD entry card sits above the feed posts, rises into view with the motion-system stagger, hover on the Begin button lifts and darkens it. The card design is quiet (no red, no oversell), and the copy is one short line plus one short subline.

- [ ] **Step 3: Commit**

```bash
git add screens/entry-point.html
git commit -m "feat(screens): entry-point , ADHD Mode discoverable card on LinkedIn home"
```

### Task 14: `screens/session-setup.html` , mode chooser + duration picker

**Files:**
- Create: `screens/session-setup.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ADHD Mode · Setup</title>
<style>
  @import url('../design-system/base.css');

  body { padding: 56px 24px; display: flex; justify-content: center; }
  .card {
    width: 100%; max-width: 480px; background: var(--card);
    border-radius: var(--r-md); box-shadow: var(--shadow);
    padding: var(--s-7) var(--s-6) var(--s-6);
    opacity: 0; transform: translateY(var(--lift-md)) scale(0.96);
    animation: card-in var(--d-slow) var(--ease-out) 80ms forwards;
  }
  @keyframes card-in { to { opacity: 1; transform: none; } }

  h1 { font-size: var(--fs-display); font-weight: 600; letter-spacing: var(--tracking-tight);
    line-height: var(--lh-tight); }
  .subtitle { font-size: var(--fs-small); color: var(--text-secondary);
    margin-top: var(--s-2); margin-bottom: var(--s-7); }

  .group-label { font-size: var(--fs-meta); font-weight: 600;
    letter-spacing: var(--tracking-wide); text-transform: uppercase;
    color: var(--text-secondary); margin-bottom: var(--s-3); }

  .modes { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-3);
    margin-bottom: var(--s-6); }
  .mode {
    border: 1.5px solid var(--hairline); border-radius: var(--r-md);
    padding: var(--s-4); cursor: pointer; text-align: left;
    transition: border-color var(--d-fast) var(--ease-in-out),
                background var(--d-fast) var(--ease-in-out);
  }
  .mode:hover { border-color: var(--brand); background: var(--brand-tint); }
  .mode.selected { border-color: var(--brand); background: var(--brand-tint); }
  .mode-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
  .mode-desc { font-size: var(--fs-meta); color: var(--text-secondary); line-height: var(--lh-base); }

  .durations { display: flex; gap: var(--s-2); margin-bottom: var(--s-7); }
  .duration {
    flex: 1; border: 1.5px solid var(--hairline); border-radius: var(--r-pill);
    padding: 10px; text-align: center; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all var(--d-fast) var(--ease-in-out);
  }
  .duration:hover { border-color: var(--brand); color: var(--brand); }
  .duration.selected { border-color: var(--brand); background: var(--brand); color: #fff; }

  .actions { display: flex; justify-content: flex-end; gap: var(--s-3); }
</style>
</head>
<body>
  <div class="card">
    <h1>Start a focus session</h1>
    <p class="subtitle">Pick how you're showing up today, then a length. You can stop early at any time.</p>

    <div class="group-label">Mode</div>
    <div class="modes">
      <button class="mode selected" data-mode="focus">
        <div class="mode-name">Focus</div>
        <div class="mode-desc">Scattered but energetic. Tighter pace.</div>
      </button>
      <button class="mode" data-mode="reengage">
        <div class="mode-name">Re-engage</div>
        <div class="mode-desc">Foggy or slow. More room per post.</div>
      </button>
    </div>

    <div class="group-label">Length</div>
    <div class="durations">
      <button class="duration" data-min="5">5 min</button>
      <button class="duration selected" data-min="12">12 min</button>
      <button class="duration" data-min="20">20 min</button>
    </div>

    <div class="actions">
      <button class="btn-text">Cancel</button>
      <button class="btn-primary">Begin</button>
    </div>
  </div>

  <script>
    // Local selection state for visual feedback only; the prototype wires up real state.
    document.querySelectorAll('.mode').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.mode').forEach(m => m.classList.remove('selected'));
        el.classList.add('selected');
      });
    });
    document.querySelectorAll('.duration').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.duration').forEach(d => d.classList.remove('selected'));
        el.classList.add('selected');
      });
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `screens/session-setup.html`. Click each mode and each duration; verify selection states swap with smooth color transitions. Hover states feel like LinkedIn (subtle blue tint, no jumpy borders).

- [ ] **Step 3: Commit**

```bash
git add screens/session-setup.html
git commit -m "feat(screens): session-setup mode and duration picker"
```

### Task 15: `screens/mid-session-checkin.html` , calm continue/wrap/pause choice

**Files:**
- Create: `screens/mid-session-checkin.html`

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ADHD Mode · Check-in</title>
<style>
  @import url('../design-system/base.css');

  body { padding: 56px 24px; display: flex; justify-content: center; }
  .card {
    width: 100%; max-width: 440px; background: var(--card);
    border-radius: var(--r-md); box-shadow: var(--shadow);
    padding: var(--s-7) var(--s-6);
    text-align: center;
    opacity: 0; transform: translateY(var(--lift-md)) scale(0.96);
    animation: card-in var(--d-slow) var(--ease-out) 80ms forwards;
  }
  @keyframes card-in { to { opacity: 1; transform: none; } }

  .progress-ring { margin: 0 auto var(--s-5); width: 64px; height: 64px;
    position: relative; }
  .progress-ring svg { transform: rotate(-90deg); }
  .progress-ring .label { position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; color: var(--text); }

  h1 { font-size: 24px; font-weight: 600; line-height: var(--lh-tight); }
  p { font-size: var(--fs-small); color: var(--text-secondary);
    margin-top: var(--s-3); margin-bottom: var(--s-7); }

  .actions { display: flex; flex-direction: column; gap: var(--s-2); }
  .btn-stack {
    width: 100%; padding: 12px 18px; border-radius: var(--r-pill);
    font-size: 14px; font-weight: 600;
    transition: all var(--d-fast) var(--ease-in-out);
  }
  .btn-stack.primary { background: var(--brand); color: #fff; }
  .btn-stack.primary:hover { background: var(--brand-hover); transform: translateY(-1px); }
  .btn-stack.secondary { background: transparent; border: 1.5px solid var(--hairline); color: var(--text); }
  .btn-stack.secondary:hover { border-color: var(--brand); color: var(--brand); }
  .btn-stack.tertiary { background: transparent; color: var(--text-secondary); }
  .btn-stack.tertiary:hover { color: var(--brand); }
</style>
</head>
<body>
  <div class="card">
    <div class="progress-ring">
      <svg width="64" height="64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="var(--hairline)" stroke-width="3"/>
        <circle cx="32" cy="32" r="28" fill="none" stroke="var(--brand)" stroke-width="3"
          stroke-dasharray="175.93" stroke-dashoffset="58.6" stroke-linecap="round"/>
      </svg>
      <div class="label">12/12</div>
    </div>

    <h1>You've seen 12 posts.</h1>
    <p>You're at the cap you set. Keep going, wrap, or pause for now.</p>

    <div class="actions">
      <button class="btn-stack primary">Wrap up</button>
      <button class="btn-stack secondary">Keep going for 5 more minutes</button>
      <button class="btn-stack tertiary">Pause and come back later</button>
    </div>
  </div>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `screens/mid-session-checkin.html`. Confirm: ring shows ~2/3 fill (matching dashoffset), the three actions stack with primary action being "Wrap up" (the design rule is: the easy default takes you to closure, the additional time is the deliberate choice). Hover states differ per button level.

- [ ] **Step 3: Commit**

```bash
git add screens/mid-session-checkin.html
git commit -m "feat(screens): mid-session check-in with calm three-action stack"
```

### Task 16: `screens/before-feed-annotated.html` , case-study artifact

**Files:**
- Create: `screens/before-feed-annotated.html`

This screen reuses the dense LinkedIn-feed mockup from the brainstorm session as the case-study artifact. It is not a Focus Mode screen; it is the visual evidence behind the "selective attention" hook.

- [ ] **Step 1: Copy the content from `.superpowers/brainstorm/37735-1778945532/content/before-annotated-feed.html`**

Open the brainstorm artifact, copy its full body content. In the new file at `screens/before-feed-annotated.html`, replace the brainstorm's inline `<style>` block with `@import url('../design-system/base.css');` at the top, and rewrite the inline colors to use design tokens. The structural HTML (the annotated phone mockup + the legend panel) stays the same.

Use the same structure shown in the brainstorm artifact, but with these substitutions in CSS:
- `#cb112d` (the red annotation pin color) stays as a one-off literal (it's case-study chrome, not part of the design system)
- `#0a66c2` becomes `var(--brand)`
- `#f3f2ef` and `#fafafa` become `var(--bg)` and `var(--card)`
- All grey text colors map to `var(--text-secondary)` or `var(--text-tertiary)`
- Font is inherited from base.css (Source Sans 3)

- [ ] **Step 2: Verify in browser**

Open `screens/before-feed-annotated.html`. Confirm: the phone-frame feed renders, the nine numbered red annotation pins overlay correctly, the right-side legend lists the nine annotated costs.

- [ ] **Step 3: Commit**

```bash
git add screens/before-feed-annotated.html
git commit -m "feat(screens): before-feed annotated artifact for case study"
```

### Task 17: Polish `screens/end-of-session.html` to match the system

The existing file is already production-grade, but verify it is fully consistent with the now-shared design system.

- [ ] **Step 1: Open the file and verify it imports `../design-system/base.css`** (done in Task 6). No further changes needed if Task 6 was completed.

- [ ] **Step 2: Smoke-test the motion**

Open in browser. Confirm: card slides up + fades in (~400ms), stats count up 0→11, 0→4, 0→3 in sequence with 40ms stagger, queue items rise in, primary CTA hover lifts and shows colored shadow.

- [ ] **Step 3: Verify reduced-motion fallback**

In macOS: System Settings → Accessibility → Display → Reduce Motion ON. Reload the page. Confirm everything appears instantly with no transforms, but the page still reveals (opacity 0 → 1 only).

No commit needed if no changes.

---

## Phase 4: Working Interactive Prototype

The deliverable that demonstrates the focus mode actually working. Single HTML entry, modular ES JavaScript, real drag physics.

### Task 18: `prototype/sample-feed.js` , canned post data

**Files:**
- Create: `prototype/sample-feed.js`

- [ ] **Step 1: Create the file**

```javascript
// prototype/sample-feed.js
// Sample post data for the working prototype. Covers all rendering branches:
// short, medium, long, with-image, listicle, with-quote.

export const SAMPLE_FEED = [
  {
    id: 'p1',
    author: 'Maya Chen',
    role: 'VP Engineering at Stripe',
    text:
      'I almost quit my job last year.\n\n' +
      'It was 11pm on a Thursday. I was sitting in my car in the office parking lot, staring at my phone. I had just opened our internal Slack to see another message from our CTO: "Can you jump on a call tomorrow at 7am?"\n\n' +
      "I closed the app. I opened my email. I started typing a resignation letter.\n\n" +
      "I didn't send it. Here's why, and here's what I learned about leading through ambiguity that I wish someone had told me three years ago.\n\n" +
      "When you take a senior role at a fast-growing company, nobody tells you that 80% of your job is going to be making decisions with incomplete information.\n\n" +
      "Your job isn't to remove ambiguity. It IS the job. Three things that means:\n\n" +
      '1. Make decisions, even bad ones, faster than feels comfortable.\n' +
      "2. Tell people what you don't know, as honestly as you can.\n" +
      '3. Give them a framework for moving forward without you.',
    avatarTheme: 'blue',
  },
  {
    id: 'p2',
    author: 'James Park',
    role: 'Former PM at Meta · #OpenToWork',
    text: 'Today I was part of the layoffs at Meta. After 6 years, I am officially looking. If you have any leads in product roles at scale, please reach out. Thank you to everyone who has reached out already.',
    avatarTheme: 'red',
  },
  {
    id: 'p3',
    author: 'Priya Nair',
    role: 'Writer',
    text: "My grandmother's last recipe, before her hands forgot. I am putting it here so the internet keeps it for our family.\n\nTake the rice. Wash it. Add cardamom, not too much. The trick is the slowness.",
    avatarTheme: 'yellow',
  },
  {
    id: 'p4',
    author: 'Alex Romero',
    role: 'Engineering Manager',
    text: 'Just shipped a thing. Feels good.',
    avatarTheme: 'green',
  },
  {
    id: 'p5',
    author: 'Sara Kim',
    role: 'Designer at Figma',
    text:
      "Five things I've learned about design hiring in 2026, after running 60+ portfolio reviews this year:\n\n" +
      '1. Show the rejected options. The artifact alone is not the work; the choice between artifacts is.\n' +
      '2. Name your trade-offs out loud. A confident "I chose X over Y because" reads stronger than perfect-looking screens.\n' +
      "3. Stop apologizing for incomplete work. If it's incomplete, say what's still open.\n" +
      "4. Don't lead with the visual. Lead with the problem.\n" +
      '5. Cite your research. Even when nobody asks.',
    avatarTheme: 'purple',
  },
  {
    id: 'p6',
    author: 'Tom Reeves',
    role: 'CTO at a startup you have not heard of',
    text: 'Quarterly reminder: if your strategy fits on one slide, it is not a strategy yet. It is a slogan.',
    avatarTheme: 'grey',
  },
  {
    id: 'p7',
    author: 'Dr. Lin Wei',
    role: 'Clinical researcher',
    text: 'New paper out today on cognitive disengagement in adult populations. Headline finding: the diagnostic threshold appears stable across cultures we sampled, but the daily-functioning impact varies sharply with workplace structure. Open access link in comments.',
    avatarTheme: 'teal',
  },
  {
    id: 'p8',
    author: 'Ben Olsen',
    role: 'Product at Spotify',
    text: 'Hot take: every "infinite scroll" surface should ship with a default cap that users can lift, not a default unbounded that users can cap.',
    avatarTheme: 'green',
  },
  {
    id: 'p9',
    author: 'Maya Chen',
    role: 'VP Engineering at Stripe',
    text: 'Hiring two senior platform engineers. Reply or DM. I read everything.',
    avatarTheme: 'blue',
  },
  {
    id: 'p10',
    author: 'Roya Ahmadi',
    role: 'Author & speaker',
    text:
      "Three quotes from this morning's reading, in order of how much they wrecked me:\n\n" +
      '"You cannot reason yourself into the version of yourself you have not yet become."\n\n' +
      '"The opposite of busy is not idle. It is intentional."\n\n' +
      '"What you tolerate is what you teach."',
    avatarTheme: 'red',
  },
  {
    id: 'p11',
    author: 'David Chu',
    role: 'Director at Adobe',
    text: "After 14 years here, today's my last day. Grateful, scared, ready.",
    avatarTheme: 'purple',
  },
  {
    id: 'p12',
    author: 'Hana Suzuki',
    role: 'Researcher at OpenAI',
    text: 'A surprising finding from our latest eval: models are sometimes wrong in ways that look right, and right in ways that look wrong. We are publishing a calibration dataset for those failure modes.',
    avatarTheme: 'yellow',
  },
];

export function getPostById(id) {
  return SAMPLE_FEED.find(p => p.id === id);
}
```

- [ ] **Step 2: Commit**

```bash
git add prototype/sample-feed.js
git commit -m "feat(prototype): sample feed data with full content variety"
```

### Task 19: `prototype/index.html` , scaffold with entry, setup, and active session shells

**Files:**
- Create: `prototype/index.html`

This task creates the HTML scaffold with all three primary states (entry, setup, active) and their shells, plus the link to `prototype.js`. The actual drag and reaction wiring comes in Task 20-23.

- [ ] **Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>ADHD Mode · Prototype</title>
<style>
  @import url('../design-system/base.css');

  /* App container fills viewport */
  html, body { height: 100%; overflow: hidden; touch-action: none; }
  #app { height: 100vh; display: flex; justify-content: center; align-items: center;
    padding: 24px; }

  .stage { width: 100%; max-width: 420px; height: min(720px, 95vh); position: relative; }

  /* Generic screen panel (entry, setup, end) */
  .panel { position: absolute; inset: 0; display: none;
    background: var(--card); border-radius: var(--r-md); box-shadow: var(--shadow);
    overflow: hidden; }
  .panel.active { display: block; animation: fade-in var(--d-slow) var(--ease-out) forwards; }

  @keyframes fade-in { from { opacity: 0; transform: translateY(var(--lift-md)); } to { opacity: 1; transform: none; } }

  /* Active session shell */
  .session { position: absolute; inset: 0; display: none; flex-direction: column;
    background: var(--bg); border-radius: var(--r-md); overflow: hidden; }
  .session.active { display: flex; }

  .session-topbar {
    background: var(--card); padding: 12px 16px;
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid var(--hairline); font-size: var(--fs-small);
  }
  .session-topbar .mode-marker { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
  .session-topbar .mode-marker .dot { width: 6px; height: 6px; border-radius: 50%;
    background: var(--brand); }
  .session-topbar .mode-marker .label { color: var(--text); font-weight: 600; }
  .session-topbar .meta { color: var(--text-tertiary); font-variant-numeric: tabular-nums;
    display: flex; gap: 12px; }

  /* Skip arc at top of the card stage */
  .skip-arc {
    position: absolute; top: 56px; left: 50%; transform: translateX(-50%);
    width: 160px; height: 24px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.04), transparent);
    border-radius: 0 0 200px 200px; pointer-events: none;
    transition: width var(--d-base) var(--ease-out),
                height var(--d-base) var(--ease-out),
                background var(--d-base) var(--ease-out);
  }
  .skip-arc.active {
    width: 320px; height: 110px;
    background: radial-gradient(ellipse at top, rgba(0,0,0,0.2), transparent 70%);
  }
  .skip-arc .label {
    position: absolute; top: 30px; left: 50%; transform: translateX(-50%);
    background: var(--skip-grey); color: #fff; font-size: 12px; font-weight: 600;
    padding: 5px 12px; border-radius: 14px; opacity: 0;
    transition: opacity var(--d-fast) var(--ease-in-out);
  }
  .skip-arc.active .label { opacity: 1; }

  /* Card stage , where the active card lives */
  .card-stage { flex: 1; position: relative; padding: 80px 16px 100px; }

  .card-host {
    position: absolute; inset: 80px 16px 100px;
    display: flex; align-items: flex-start; justify-content: center;
  }
  .card {
    width: 100%; background: var(--card); border-radius: var(--r-lg);
    padding: 18px 20px 22px;
    box-shadow: var(--shadow); cursor: grab;
    transition: box-shadow var(--d-base) var(--ease-out);
    user-select: none; touch-action: none;
  }
  .card.dragging { box-shadow: var(--shadow-drag); cursor: grabbing; }
  .card-author { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .card-avatar { width: 40px; height: 40px; border-radius: var(--r-pill);
    background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
  .card-name { font-size: 14px; font-weight: 600; line-height: 1.2; }
  .card-role { font-size: var(--fs-meta); color: var(--text-secondary); }
  .card-tldr-pill {
    display: inline-block; background: #eef3f8; color: var(--brand);
    font-size: 10px; font-weight: 600; letter-spacing: 0.05em;
    padding: 3px 8px; border-radius: 8px; margin-bottom: 10px;
  }
  .card-content { font-size: var(--fs-small); line-height: var(--lh-loose); color: var(--text);
    white-space: pre-wrap; }
  .card-progress { display: flex; gap: 4px; margin-top: 16px; }
  .card-progress .pip { height: 3px; flex: 1; background: var(--hairline); border-radius: 2px;
    transition: background var(--d-base) var(--ease-in-out); }
  .card-progress .pip.filled { background: var(--brand); }
  .card-page-label { font-size: 10px; color: var(--text-tertiary);
    letter-spacing: 0.04em; margin-top: 6px; }
  .card-react-preview {
    position: absolute; top: 12px; right: 14px;
    background: var(--brand); color: #fff; font-size: 9px; font-weight: 700;
    padding: 3px 8px; border-radius: 8px; letter-spacing: 0.04em;
    opacity: 0; transition: opacity var(--d-fast) var(--ease-in-out);
  }
  .card-react-preview.visible { opacity: 1; }

  /* Reaction tray at bottom */
  .react-tray {
    position: absolute; left: 16px; right: 16px; bottom: 14px;
    background: var(--card); border-radius: 22px; padding: 10px 6px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    display: flex; justify-content: space-around; align-items: center;
    z-index: 2;
  }
  .react {
    font-size: 22px; padding: 6px; border-radius: 50%;
    transform-origin: center; transition: transform var(--d-base) var(--ease-spring),
                background var(--d-fast) var(--ease-in-out);
    background: transparent;
  }
  .react.highlighted { background: var(--brand-tint); }

  /* End-of-session inline (matches end-of-session.html essentials) */
  .end-shell { padding: 24px; text-align: center; }
  .end-shell h1 { font-size: 28px; font-weight: 600; margin: var(--s-6) 0 var(--s-3); }
  .end-stats { display: grid; grid-template-columns: 1fr 1fr 1fr;
    border-top: 1px solid var(--hairline); border-bottom: 1px solid var(--hairline);
    margin: var(--s-6) 0; }
  .end-stat { padding: 16px 8px; border-right: 1px solid var(--hairline); }
  .end-stat:last-child { border-right: none; }
  .end-stat .num { font-size: 24px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .end-stat .lbl { font-size: var(--fs-meta); color: var(--text-secondary); margin-top: 4px; }
  .end-actions { display: flex; justify-content: space-between; align-items: center;
    margin-top: var(--s-6); padding: 0 8px; }
</style>
</head>
<body>
  <div id="app">
    <div class="stage">

      <!-- Entry panel -->
      <div class="panel active" data-state="entry">
        <div style="padding: 32px 24px;">
          <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 8px;">A calmer way to use LinkedIn.</h2>
          <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 24px;">
            Bounded time. Reactions guide what comes back.
          </p>
          <button class="btn-primary" id="start-setup-btn">Start a focus session</button>
        </div>
      </div>

      <!-- Setup panel -->
      <div class="panel" data-state="setup">
        <div style="padding: 32px 24px;">
          <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 16px;">Set up</h2>
          <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">MODE</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px;">
            <button class="setup-mode selected" data-mode="focus">Focus</button>
            <button class="setup-mode" data-mode="reengage">Re-engage</button>
          </div>
          <div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">LENGTH</div>
          <div style="display: flex; gap: 8px; margin-bottom: 28px;">
            <button class="setup-duration" data-min="5">5</button>
            <button class="setup-duration selected" data-min="12">12</button>
            <button class="setup-duration" data-min="20">20</button>
          </div>
          <button class="btn-primary" id="begin-btn">Begin</button>
        </div>
      </div>

      <!-- Active session -->
      <div class="session" data-state="active">
        <div class="session-topbar">
          <div class="mode-marker">
            <span class="dot"></span>
            <span class="label" id="mode-label">Focus</span>
          </div>
          <div class="meta">
            <span id="time-remaining">12:00</span>
            <span id="card-progress">1/12</span>
            <span id="queue-count">↻ 0</span>
          </div>
        </div>
        <div class="card-stage">
          <div class="skip-arc">
            <div class="label">Moved on</div>
          </div>
          <div class="card-host" id="card-host"></div>
        </div>
        <div class="react-tray" id="react-tray">
          <div class="react" data-r="like">👍</div>
          <div class="react" data-r="celebrate">🎉</div>
          <div class="react" data-r="support">🤝</div>
          <div class="react" data-r="love">❤️</div>
          <div class="react" data-r="insightful">💡</div>
          <div class="react" data-r="funny">😄</div>
        </div>
      </div>

      <!-- End panel -->
      <div class="panel" data-state="end">
        <div class="end-shell">
          <div style="font-size: 12px; color: var(--text-secondary);">Focus session · Ended</div>
          <h1>Done.</h1>
          <div class="end-stats">
            <div class="end-stat"><div class="num" id="end-seen">0</div><div class="lbl">Posts seen</div></div>
            <div class="end-stat"><div class="num" id="end-react">0</div><div class="lbl">Reactions</div></div>
            <div class="end-stat"><div class="num" id="end-queue">0</div><div class="lbl">Will resurface</div></div>
          </div>
          <div class="end-actions">
            <button class="btn-text" id="restart-btn">Start another</button>
            <button class="btn-primary" id="close-btn">Close LinkedIn</button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <style>
    .setup-mode {
      border: 1.5px solid var(--hairline); border-radius: var(--r-md);
      padding: 14px 10px; font-size: 14px; font-weight: 600; cursor: pointer;
      transition: all var(--d-fast) var(--ease-in-out);
    }
    .setup-mode:hover, .setup-mode.selected {
      border-color: var(--brand); background: var(--brand-tint);
    }
    .setup-duration {
      flex: 1; border: 1.5px solid var(--hairline); border-radius: var(--r-pill);
      padding: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
      transition: all var(--d-fast) var(--ease-in-out);
    }
    .setup-duration:hover { border-color: var(--brand); color: var(--brand); }
    .setup-duration.selected { border-color: var(--brand); background: var(--brand); color: #fff; }
  </style>

  <script type="module" src="./prototype.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `prototype/index.html`. Entry panel shows. Clicking "Start a focus session" does nothing yet (wiring comes in Task 20). Open DevTools, confirm no JS errors.

- [ ] **Step 3: Commit**

```bash
git add prototype/index.html
git commit -m "feat(prototype): HTML scaffold with all panels and the active-session shell"
```

### Task 20: `prototype/prototype.js` , wire entry, setup, and state machine

**Files:**
- Create: `prototype/prototype.js`

- [ ] **Step 1: Create the file with the panel-transition machinery and setup wiring**

```javascript
// prototype/prototype.js
import { createSession, send } from '../lib/session-state.js';
import { createQueue, addItem } from '../lib/resurface-queue.js';
import { schedule } from '../lib/spaced-repetition.js';
import { SAMPLE_FEED } from './sample-feed.js';
import { classifyGesture, magnificationFor } from '../lib/gestures.js';
import { chunkPost } from '../lib/reflow.js';

// ---------- Application state ----------
let session = createSession();
let queue = createQueue();
let setupChoice = { mode: 'focus', durationMin: 12 };
let timer = null;
let currentPostIdx = 0;
let currentPageIdx = 0;
let currentChunks = [];

// ---------- DOM helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function showPanel(stateName) {
  $$('.panel, .session').forEach(p => p.classList.remove('active'));
  const target = $(`[data-state="${stateName}"]`);
  if (target) target.classList.add('active');
}

// ---------- Setup wiring ----------
$$('.setup-mode').forEach(el => {
  el.addEventListener('click', () => {
    $$('.setup-mode').forEach(m => m.classList.remove('selected'));
    el.classList.add('selected');
    setupChoice.mode = el.dataset.mode;
  });
});
$$('.setup-duration').forEach(el => {
  el.addEventListener('click', () => {
    $$('.setup-duration').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
    setupChoice.durationMin = parseInt(el.dataset.min, 10);
  });
});

$('#start-setup-btn').addEventListener('click', () => {
  session = send(session, { type: 'START_SETUP' });
  showPanel('setup');
});

$('#begin-btn').addEventListener('click', () => {
  const postCap = setupChoice.mode === 'focus' ? 12 : 8;
  session = send(session, {
    type: 'BEGIN',
    mode: setupChoice.mode,
    durationSec: setupChoice.durationMin * 60,
    postCap,
  });
  startSession();
});

$('#restart-btn').addEventListener('click', () => {
  session = createSession();
  queue = createQueue();
  currentPostIdx = 0;
  showPanel('entry');
});
$('#close-btn').addEventListener('click', () => {
  showPanel('entry');
  session = createSession();
});

// ---------- Session lifecycle ----------
function startSession() {
  $('#mode-label').textContent = setupChoice.mode === 'focus' ? 'Focus' : 'Re-engage';
  updateMeta();
  showPanel('active');
  presentCard();
  startTimer();
}

function startTimer() {
  clearInterval(timer);
  let remaining = session.durationSec;
  timer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(timer);
      session = send(session, { type: 'TIME_UP' });
      endSession();
      return;
    }
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    $('#time-remaining').textContent = `${mm}:${ss}`;
  }, 1000);
}

function updateMeta() {
  $('#card-progress').textContent = `${session.cardsSeen + 1}/${session.postCap}`;
  $('#queue-count').textContent = `↻ ${session.queueAdds}`;
}

// ---------- Card presentation ----------
function presentCard() {
  if (currentPostIdx >= SAMPLE_FEED.length) {
    endSession();
    return;
  }
  const post = SAMPLE_FEED[currentPostIdx];
  currentChunks = chunkPost(post);
  currentPageIdx = 0;
  renderCurrentChunk(post);
  attachDragHandlers();
  session = send(session, { type: 'CARD_SEEN' });
  updateMeta();

  if (session.state === 'checkpoint') {
    setTimeout(showCheckpoint, 400);
  }
}

function renderCurrentChunk(post) {
  const chunk = currentChunks[currentPageIdx];
  const host = $('#card-host');
  host.innerHTML = `
    <div class="card" id="active-card">
      <div class="card-react-preview" id="react-preview">LIKE</div>
      <div class="card-author">
        <div class="card-avatar"></div>
        <div>
          <div class="card-name">${post.author}</div>
          <div class="card-role">${post.role}</div>
        </div>
      </div>
      ${chunk.kind === 'tldr' ? '<div class="card-tldr-pill">TL;DR</div>' : ''}
      <div class="card-content">${chunk.text}</div>
      ${chunk.pageTotal > 1 ? `
        <div class="card-progress">
          ${Array.from({ length: chunk.pageTotal }, (_, i) =>
            `<div class="pip ${i <= currentPageIdx ? 'filled' : ''}"></div>`
          ).join('')}
        </div>
        <div class="card-page-label">Page ${currentPageIdx + 1} of ${chunk.pageTotal}${currentPageIdx + 1 < chunk.pageTotal ? ' · tap to continue' : ''}</div>
      ` : ''}
    </div>
  `;
}

function endSession() {
  clearInterval(timer);
  $('#end-seen').textContent = session.cardsSeen;
  $('#end-react').textContent = session.reactionsSent;
  $('#end-queue').textContent = session.queueAdds;
  showPanel('end');
}

function showCheckpoint() {
  // Minimal inline check-in: ask the user via confirm() for now.
  // (A polished check-in panel can be added as a follow-up; the spec lists it as Screen 5.)
  const cont = confirm(`You've seen ${session.cardsSeen} posts. Keep going?`);
  session = send(session, { type: cont ? 'CONTINUE' : 'WRAP' });
  if (session.state === 'active') {
    currentPostIdx += 1;
    presentCard();
  } else {
    endSession();
  }
}

// ---------- Drag handlers (Task 21 implements) ----------
function attachDragHandlers() {
  // Placeholder: implemented in the next task.
}
```

- [ ] **Step 2: Verify in browser**

Open `prototype/index.html`. Click "Start a focus session" → setup panel appears. Pick a mode and duration. Click "Begin" → active session appears, timer counts down from 12:00, card is rendered with the first post. Drag does nothing yet (next task). No JS errors in DevTools.

- [ ] **Step 3: Commit**

```bash
git add prototype/prototype.js
git commit -m "feat(prototype): entry→setup→active state wiring with timer and card rendering"
```

### Task 21: Drag handlers with skip arc and reaction magnification

**Files:**
- Modify: `prototype/prototype.js`

- [ ] **Step 1: Replace the `attachDragHandlers()` placeholder** at the bottom of `prototype/prototype.js` with the real implementation

Find this block in `prototype/prototype.js`:
```javascript
function attachDragHandlers() {
  // Placeholder: implemented in the next task.
}
```

Replace it with:

```javascript
function attachDragHandlers() {
  const card = $('#active-card');
  if (!card) return;
  const tray = $('#react-tray');
  const skipArc = $('.skip-arc');
  const reactPreview = $('#react-preview');
  const reactEls = $$('.react', tray);

  const view = { width: window.innerWidth, height: window.innerHeight };
  let dragging = false;
  let startX = 0, startY = 0;

  function down(ev) {
    dragging = true;
    card.classList.add('dragging');
    const p = pointerOf(ev);
    startX = p.x; startY = p.y;
    card.setPointerCapture?.(ev.pointerId ?? 0);
    ev.preventDefault();
  }

  function move(ev) {
    if (!dragging) return;
    const p = pointerOf(ev);
    const dx = p.x - startX;
    const dy = p.y - startY;
    const gesture = classifyGesture({ dx, dy }, view);
    applyVisuals(dx, dy, gesture);
    ev.preventDefault();
  }

  function up(ev) {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('dragging');
    const p = pointerOf(ev);
    const dx = p.x - startX;
    const dy = p.y - startY;
    const gesture = classifyGesture({ dx, dy }, view);
    commitOrReset(gesture);
  }

  function pointerOf(ev) {
    if (ev.touches && ev.touches[0]) return { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
    if (ev.changedTouches && ev.changedTouches[0]) return { x: ev.changedTouches[0].clientX, y: ev.changedTouches[0].clientY };
    return { x: ev.clientX, y: ev.clientY };
  }

  function applyVisuals(dx, dy, gesture) {
    // Card transform follows the finger
    card.style.transform = `translate(${dx * 0.7}px, ${dy * 0.5}px) rotate(${dx * 0.04}deg)`;

    if (gesture.zone === 'skip') {
      skipArc.classList.add('active');
      tray.style.opacity = '0.4';
      card.style.opacity = String(1 - 0.4 * gesture.progress);
      reactPreview.classList.remove('visible');
    } else if (gesture.zone === 'react') {
      skipArc.classList.remove('active');
      tray.style.opacity = '1';
      card.style.opacity = '1';
      // Magnify the focused reaction; dim the rest
      for (const el of reactEls) {
        const r = el.dataset.r;
        const mag = magnificationFor(r, { dx, dy }, view);
        el.style.transform = `scale(${mag})`;
        el.classList.toggle('highlighted', r === gesture.reaction);
      }
      // Show the reaction preview tag on the card
      reactPreview.textContent = gesture.reaction.toUpperCase();
      reactPreview.classList.add('visible');
    } else {
      skipArc.classList.remove('active');
      tray.style.opacity = '1';
      card.style.opacity = '1';
      reactPreview.classList.remove('visible');
      for (const el of reactEls) {
        el.style.transform = 'scale(1)';
        el.classList.remove('highlighted');
      }
    }
  }

  function commitOrReset(gesture) {
    skipArc.classList.remove('active');
    for (const el of reactEls) {
      el.style.transform = 'scale(1)';
      el.classList.remove('highlighted');
    }
    $('#react-preview').classList.remove('visible');

    if (gesture.commit && gesture.zone === 'skip') {
      advanceCard('skip');
    } else if (gesture.commit && gesture.zone === 'react') {
      commitReaction(gesture.reaction);
    } else {
      // Snap back
      card.style.transition = `transform var(--d-base) var(--ease-out)`;
      card.style.transform = 'translate(0,0) rotate(0)';
      setTimeout(() => { if (card) card.style.transition = ''; }, 240);
    }
  }

  card.addEventListener('pointerdown', down);
  card.addEventListener('pointermove', move);
  card.addEventListener('pointerup', up);
  card.addEventListener('pointercancel', up);
  // Tap-to-page when no drag occurred
  card.addEventListener('click', () => {
    if (currentPageIdx < currentChunks.length - 1) {
      currentPageIdx += 1;
      renderCurrentChunk(SAMPLE_FEED[currentPostIdx]);
      attachDragHandlers();
    }
  });
}

function commitReaction(reaction) {
  const post = SAMPLE_FEED[currentPostIdx];
  // Add to queue if applicable
  const item = schedule({ reaction, now: Date.now(), postId: post.id });
  queue = addItem(queue, item);
  session = send(session, { type: 'REACT', reaction });
  updateMeta();
  advanceCard('react');
}

function advanceCard(_action) {
  const card = $('#active-card');
  if (card) {
    card.style.transition = `transform var(--d-base) var(--ease-out), opacity var(--d-base) var(--ease-out)`;
    card.style.transform = 'translate(0, 80px) scale(0.9)';
    card.style.opacity = '0';
  }
  setTimeout(() => {
    if (session.state === 'checkpoint') {
      showCheckpoint();
      return;
    }
    currentPostIdx += 1;
    presentCard();
  }, 260);
}
```

- [ ] **Step 2: Verify drag in browser**

Open `prototype/index.html` on a desktop browser. Start a session. Try to:
- Drag a card UP: confirm the skip arc grows and pulses grey, the card lifts and fades, releasing past threshold advances to the next card.
- Drag a card DOWN: confirm the reaction row brightens, the Like icon centers and magnifies, drift sideways causes other reactions to magnify under the cursor and the card preview tag updates. Releasing commits the reaction and advances.
- Drag and release short of threshold: card snaps back to center.

Test the long post (Maya Chen, p1). Tap the card while on page 1 to advance to page 2, etc. Confirm progress pips fill.

- [ ] **Step 3: Verify touch on a real device** (or device emulation)

Open Chrome DevTools, switch to mobile emulation. Confirm touch events fire the same gestures. If you have a phone, open the prototype via the local server (run `npx serve` from project root and open from your phone's browser on the same network).

- [ ] **Step 4: Commit**

```bash
git add prototype/prototype.js
git commit -m "feat(prototype): drag gestures with skip arc, reaction magnification, and commit"
```

### Task 22: Long-press fallback reaction picker (accessibility)

**Files:**
- Modify: `prototype/index.html`
- Modify: `prototype/prototype.js`

- [ ] **Step 1: Add the static picker markup at the bottom of the active session in `prototype/index.html`**

Before the closing `</div>` of the active `.session` element, add:

```html
<div class="picker" id="picker" hidden>
  <div class="picker-backdrop"></div>
  <div class="picker-sheet">
    <div class="picker-title">React to this post</div>
    <div class="picker-grid">
      <button class="picker-btn" data-r="like">👍 Like</button>
      <button class="picker-btn" data-r="celebrate">🎉 Celebrate</button>
      <button class="picker-btn" data-r="support">🤝 Support</button>
      <button class="picker-btn" data-r="love">❤️ Love</button>
      <button class="picker-btn" data-r="insightful">💡 Insightful</button>
      <button class="picker-btn" data-r="funny">😄 Funny</button>
    </div>
    <button class="picker-close" id="picker-close">Cancel</button>
  </div>
</div>
```

- [ ] **Step 2: Add picker styles** to the `<style>` block in `prototype/index.html`

```css
.picker { position: absolute; inset: 0; z-index: 10; display: flex;
  align-items: flex-end; }
.picker-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.32);
  animation: fade-in var(--d-base) var(--ease-out) forwards; opacity: 0; }
.picker-sheet { position: relative; width: 100%; background: var(--card);
  border-radius: var(--r-lg) var(--r-lg) 0 0; padding: 18px 16px;
  animation: sheet-in var(--d-slow) var(--ease-out) forwards;
  transform: translateY(100%); }
@keyframes sheet-in { to { transform: translateY(0); } }
.picker-title { font-size: var(--fs-meta); font-weight: 600; letter-spacing: 0.04em;
  text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; }
.picker-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.picker-btn { padding: 14px 12px; border: 1.5px solid var(--hairline);
  border-radius: var(--r-md); font-size: 14px; font-weight: 600;
  text-align: left; transition: all var(--d-fast) var(--ease-in-out); }
.picker-btn:hover { border-color: var(--brand); background: var(--brand-tint); }
.picker-close { width: 100%; margin-top: 14px; padding: 12px;
  border-radius: var(--r-pill); border: 1.5px solid var(--hairline);
  font-size: 14px; font-weight: 600; color: var(--text-secondary);
  transition: all var(--d-fast) var(--ease-in-out); }
.picker-close:hover { color: var(--brand); border-color: var(--brand); }
```

- [ ] **Step 3: Wire long-press detection in `prototype.js`**

Inside `attachDragHandlers()`, after `card.addEventListener('pointerdown', down);` add:

```javascript
let longPressTimer = null;
card.addEventListener('pointerdown', () => {
  longPressTimer = setTimeout(() => {
    if (dragging) { return; } // ignore if drag has begun
    openPicker();
  }, 500);
});
card.addEventListener('pointermove', () => { clearTimeout(longPressTimer); });
card.addEventListener('pointerup',   () => { clearTimeout(longPressTimer); });
card.addEventListener('pointercancel', () => { clearTimeout(longPressTimer); });
```

Add these new functions at the bottom of `prototype.js`:

```javascript
function openPicker() {
  const picker = $('#picker');
  picker.hidden = false;
  $$('.picker-btn', picker).forEach(btn => {
    btn.onclick = () => {
      commitReaction(btn.dataset.r);
      closePicker();
    };
  });
  $('#picker-close').onclick = closePicker;
  // Keyboard 1-6 shortcuts
  document.addEventListener('keydown', pickerKeyHandler);
}

function closePicker() {
  $('#picker').hidden = true;
  document.removeEventListener('keydown', pickerKeyHandler);
}

function pickerKeyHandler(ev) {
  if (ev.key === 'Escape') closePicker();
  const n = parseInt(ev.key, 10);
  if (n >= 1 && n <= 6) {
    const btn = $$('.picker-btn')[n - 1];
    if (btn) btn.click();
  }
}
```

- [ ] **Step 4: Verify in browser**

Open the prototype. Long-press a card for ~500ms (don't move). Sheet slides up from the bottom with the six reactions. Press a reaction button: it commits and the next card appears. Press number keys 1-6: same effect. Press Escape: sheet closes without reacting.

- [ ] **Step 5: Commit**

```bash
git add prototype/index.html prototype/prototype.js
git commit -m "feat(prototype): long-press fallback reaction picker with keyboard 1-6 shortcuts"
```

### Task 23: ARIA live region for screen-reader announcements

**Files:**
- Modify: `prototype/index.html`
- Modify: `prototype/prototype.js`

- [ ] **Step 1: Add an off-screen live region** in `prototype/index.html`, just before `</body>`

```html
<div id="sr-live" aria-live="polite" aria-atomic="true"
  style="position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden;"></div>
```

- [ ] **Step 2: Announce gesture commits** in `prototype.js`. Add this helper near the DOM helpers:

```javascript
function announce(msg) {
  const live = $('#sr-live');
  if (!live) return;
  live.textContent = '';
  setTimeout(() => { live.textContent = msg; }, 50);
}
```

In `commitReaction()`, after `session = send(session, { type: 'REACT', reaction });`, add:
```javascript
const queuedNote = item ? ' Added to your resurface queue.' : '';
announce(`Reacted ${reaction} to ${SAMPLE_FEED[currentPostIdx].author}'s post.${queuedNote}`);
```

In `advanceCard()`, when called with `'skip'`, before `setTimeout`, add:
```javascript
if (_action === 'skip') {
  announce(`Skipped ${SAMPLE_FEED[currentPostIdx].author}'s post. Moving on.`);
}
```

- [ ] **Step 3: Verify**

Enable VoiceOver (Mac: Cmd+F5). Navigate the prototype. After reacting or skipping, VoiceOver announces the action.

- [ ] **Step 4: Commit**

```bash
git add prototype/index.html prototype/prototype.js
git commit -m "feat(prototype): ARIA live region announces reactions and skips"
```

---

---

## Phase 5: Figma-Ready Specification Package

A package a designer could use to rebuild the screens in Figma without making subjective interpretation calls.

### Task 24: Mirror `tokens.json` into the Figma spec directory

**Files:**
- Create: `figma-spec/tokens.json`

- [ ] **Step 1: Copy the design-system tokens to the figma-spec dir**

Run:
```bash
cp design-system/tokens.json figma-spec/tokens.json
```

- [ ] **Step 2: Verify the JSON is W3C Design Tokens compliant and Tokens Studio compatible**

Open `figma-spec/tokens.json`. Confirm every leaf token has a `$type` and `$value`. The keys at root level (`color`, `typography`, `space`, `radius`, `motion`) are the import groups. Tokens Studio in Figma reads this format natively via its "Import from JSON" flow.

- [ ] **Step 3: Add an importer note** alongside the JSON

Create `figma-spec/tokens.README.md`:

```markdown
# Importing Tokens Into Figma

These tokens follow the W3C Design Tokens Format Module. The simplest path into Figma is via the [Tokens Studio plugin](https://tokens.studio/).

## Steps

1. Install the Tokens Studio plugin in Figma
2. Open the plugin, choose "Tools" → "Import"
3. Paste the contents of `tokens.json` or upload the file
4. Apply to your Figma file as variables

## What's included

- `color`: surface, brand, text, hairline, reaction tints
- `typography`: font family + the type scale
- `space`: 4px-based spacing scale
- `radius`: rounding scale
- `motion`: durations + easing curves (Figma variables can reference these even though Figma doesn't yet animate from tokens directly)

## Source of truth

The canonical token file is `design-system/tokens.json` at the project root. This file is a mirror; regenerate if upstream changes.
```

- [ ] **Step 4: Commit**

```bash
git add figma-spec/tokens.json figma-spec/tokens.README.md
git commit -m "feat(figma-spec): mirror design tokens with importer note"
```

### Task 25: `figma-spec/components.md` , atomic, molecular, organism specs

**Files:**
- Create: `figma-spec/components.md`

- [ ] **Step 1: Create the file**

```markdown
# ADHD Mode Component Specifications

Specifications for the components that compose every screen. Organized atomic → molecular → organism. Use these to build the Figma component library.

## Atomic

### Color
See `tokens.json` `color` group. Use as Figma color variables.

### Typography
**Font:** Source Sans 3 (Google Fonts)

| Variable | Size | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| display | 32 | 600 | -0.015em | 1.15 |
| heading | 20 | 600 | -0.01em  | 1.2 |
| body    | 14 | 400 | 0        | 1.4 |
| small   | 13 | 400 | 0        | 1.6 |
| meta    | 12 | 600 | 0.04em   | 1.2 |
| tiny    | 11 | 400 | 0        | 1.3 |

### Spacing scale
4, 8, 12, 16, 20, 24, 32, 40, 56 pixels. Stored as `space.1` through `space.9`.

### Radius scale
sm: 4, md: 8, lg: 12, pill: 999.

## Molecular

### Button , Primary
**Auto layout:** horizontal, 24h × 10v padding.
**Background:** `color.brand` → `color.brand-hover` on hover.
**Text:** 15/600/white.
**Radius:** `radius.pill`.
**Effect:** translateY(-1px) and shadow `0 4 12 0 rgba(10,102,194,0.25)` on hover.
**Variants:** Default · Hover · Pressed · Disabled.

### Button , Text
**Auto layout:** horizontal, 4h × 8v padding.
**Text:** 14/600/`color.brand`.
**Underline:** 1px underline expands from left on hover (animated; in Figma, document as a hover-state property).
**Variants:** Default · Hover · Pressed.

### Avatar
**Shape:** circle. **Sizes:** 32, 36, 40, 44.
**Fill:** linear-gradient placeholder (135deg, two-stop) when no image. Use one of these themes: blue, red, yellow, green, purple, grey, teal (see `prototype/sample-feed.js` `avatarTheme`).

### Hairline divider
1px solid `color.hairline`. Either horizontal or vertical.

### Reaction icon
The native emoji at 22px in a 36px circular tint background. Tint per reaction:
- Insightful: `color.react-insightful`
- Support: `color.react-support`
- Love: `color.react-love`
- Celebrate: `color.react-celebrate`
- Like / Funny: `color.hairline` (no resurface tint)

### Stat cell
**Auto layout:** vertical, 22v × 12h padding, center-aligned.
**Top:** number, 28/600/tabular-nums/`color.text`.
**Bottom:** label, 13/400/`color.text-secondary`, 6px margin-top.
**Border:** right 1px `color.hairline` (last child no border).

### Tag
The "TL;DR" pill, the "Promoted" pill, etc.
**Auto layout:** horizontal, 8h × 3v padding.
**Background:** `#eef3f8` for TL;DR (LinkedIn-blue tint), `color.react-insightful` for Promoted.
**Text:** 10/600/letter-spacing 0.05em/uppercase.
**Radius:** `radius.sm` (4).

## Organism

### Card , Post (active session)
**Auto layout:** vertical, 22 inner padding, gap 14, fill `color.card`, radius `radius.lg` (12), shadow `shadow`.
**Composition:**
1. Author row (avatar 40 + name/role stack)
2. Optional TL;DR pill
3. Post content (body 14/400/`color.text`)
4. Optional progress pips (4px height, evenly spaced, filled to `pageIndex+1`)
5. Optional page label (tiny 11/400/`color.text-tertiary`)

**States:** Idle · Dragging (shadow upgrades to `shadow-drag`, cursor grabbing) · Exiting (translate-Y 80, scale 0.9, opacity 0 over `duration.base` `easing.out`).

### Reaction tray
**Position:** absolute bottom: 14, left/right: 16.
**Background:** `color.card`, radius 22, padding 10v × 6h, shadow `0 2 10 0 rgba(0,0,0,0.06)`.
**Layout:** flex, justify-content space-around, align center.
**Contents:** six Reaction icons.

### Skip arc
**Position:** absolute top: 56, centered horizontally.
**Idle state:** 160w × 24h, gradient `linear(to-bottom, rgba(0,0,0,0.04), transparent)`, radius `0 0 200 200`.
**Active state:** 320w × 110h, radial gradient ellipse, plus a "Moved on" badge (background `color.skip-grey`, text white 12/600).
**Transitions:** width, height, background over `duration.base` `easing.out`.

### Session topbar
**Auto layout:** horizontal, 12v × 16h padding, justify space-between.
**Background:** `color.card`, bottom border 1px `color.hairline`.
**Left:** mode marker (6px brand dot, "Focus" label 13/600, " · Ended" or session state 13/400/`color.text-secondary`).
**Right:** meta cluster , time remaining (tabular-nums), card progress (1/12), queue counter (↻ 3) , 12px gaps, `color.text-tertiary`.

### Setup mode tile
**Auto layout:** vertical, 14 padding, gap 4, fill `color.card`, border 1.5px `color.hairline`, radius `radius.md`.
**Selected/hover state:** border `color.brand`, fill `color.brand-tint`.
**Contents:** mode name (15/600), mode description (12/400/`color.text-secondary`/1.4 line-height).

### Duration pill
**Auto layout:** horizontal, 10 padding, center.
**Border:** 1.5px `color.hairline`, radius `radius.pill`.
**Selected:** background `color.brand`, text white.
**Hover (unselected):** border `color.brand`, text `color.brand`.

## State machine notes

Components with motion (Card, Skip arc, Reaction tray, Buttons) should be built in Figma with separate variants per state. Transitions between states use Smart Animate with the durations and easings from `motion` tokens.
```

- [ ] **Step 2: Commit**

```bash
git add figma-spec/components.md
git commit -m "feat(figma-spec): atomic-to-organism component specifications"
```

### Task 26: `figma-spec/screens.md` , frame-by-frame screen specs

**Files:**
- Create: `figma-spec/screens.md`

- [ ] **Step 1: Create the file**

```markdown
# Screen Specifications

One frame per screen. Each spec lists artboard size, composition, and key spacing.

## Screen 1: Entry point

**Artboard:** Mobile 390 × 844.
**Reference HTML:** `screens/entry-point.html`.

**Composition (top to bottom, 8px gaps between cards):**
1. LinkedIn nav stripe , 32×32 logo, search field flex.
2. **ADHD Mode entry card** , 44×44 brand-gradient mark + name/desc stack + Primary Button "Begin", inside `surface-card` with 24 padding.
3. Two sample feed posts , author row + body excerpt.

**Notes:** the ADHD Mode entry card sits second in the feed (right after nav), not as a banner. Calm, discoverable, not loud.

## Screen 2: Session setup

**Artboard:** Mobile 390 × 844 with centered modal.
**Reference HTML:** `screens/session-setup.html`.

**Composition (modal card, 480 max-width on desktop, full-bleed on mobile):**
1. Title "Start a focus session" (display 32).
2. Subtitle (small 13/`color.text-secondary`).
3. Mode group label "MODE" (meta 12/`color.text-secondary`/uppercase).
4. Mode picker , two tiles side-by-side (`Setup mode tile` component).
5. Length group label "LENGTH".
6. Duration picker , three pills (`Duration pill` component).
7. Actions row , text "Cancel" left, Primary "Begin" right.

**Padding:** 32 top, 24 sides, 24 bottom.

## Screen 3: Focus session , card view

**Artboard:** Mobile 390 × 844, full-bleed inside the LinkedIn shell.
**Reference HTML:** `prototype/index.html` (the `.session` element).

**Composition:**
1. Session topbar (12v × 16h padding).
2. Card stage (flex 1) with absolute children:
   - Skip arc (top 56, centered, idle dim variant).
   - Card host (inset 80/16/100/16) containing the Card , Post component.
3. Reaction tray (absolute bottom 14).

**States to mock:** Idle · Dragging up (skip arc active variant + card opacity 0.6) · Dragging down with hover on Insightful (Insightful icon scaled 1.8, others scaled 1.0).

## Screen 4: Long-post reflow , TL;DR card

**Artboard:** Same as Screen 3.
**Reference HTML:** the rendered first chunk of post `p1` (Maya Chen) in the prototype.

**Composition:** same as Screen 3 but the Card , Post body shows:
- TL;DR pill (top of body)
- Two-sentence summary in body 14/500 line-height 1.55
- 3-pip progress bar at bottom (first pip filled)
- Page label "Page 1 of 3 · tap to continue"

## Screen 5: Mid-session check-in

**Artboard:** Mobile 390 × 844 with centered modal.
**Reference HTML:** `screens/mid-session-checkin.html`.

**Composition (modal card, 440 max-width):**
1. Progress ring (64×64 SVG, brand stroke filled to `cardsSeen / postCap`).
2. Headline "You've seen 12 posts." (24/600).
3. Subtitle (small 13/`color.text-secondary`).
4. Action stack , Primary "Wrap up" top, Secondary "Keep going for 5 more minutes", Tertiary "Pause and come back later".

**Padding:** 32 top, 24 sides, 24 bottom.

## Screen 6: End-of-session

**Artboard:** Mobile 390 × 844 (mobile) and 1240 × 800 (desktop variant).
**Reference HTML:** `screens/end-of-session.html`.

**Composition:**
1. Header strip , brand dot + "Focus session · Ended" + tabular time "12:00" right-aligned.
2. Hero block , "Done." (display 32/600).
3. Stats strip , three Stat cells with hairline dividers.
4. Coming back section header (meta 12/`color.text-secondary`/uppercase).
5. Three resurface queue items , emoji avatar + author/snippet stack + ambient "when".
6. Actions row , text "Start another session" left, Primary "Close LinkedIn" right.

**Padding:** 32 top, 24 sides, 24 bottom. Card max-width 560 on desktop.

## Screen 7: Case-study artifact , annotated "before" feed

**Artboard:** Wider (1280×900) for the case-study presentation context.
**Reference HTML:** `screens/before-feed-annotated.html`.

**Composition:**
- Left: phone-frame mockup of a busy LinkedIn home feed.
- Overlaid: nine numbered red annotation pins.
- Right: legend panel pairing each pin with the labeled cost (one paragraph each).
- Above the legend: a yellow "Case study hook" callout with the selective-attention demo framing.

This is the only screen that uses chrome outside the design system (the red annotation pins are case-study chrome).

## Motion specs

For each screen with reveal animations, see the Motion table in the design spec (Section 9). Use Figma Smart Animate between variants with these durations:

| Transition | Duration | Easing |
|---|---|---|
| Card load | 400 | out |
| Stat rise (per cell) | 400 | out, +40ms stagger |
| Drag classify (visual updates) | 240 | in-out |
| Reaction commit (icon spring) | 240 | spring |
| Skip arc activate | 240 | out |
| Card exit | 240 | out |
| Hover on button | 150 | in-out |
```

- [ ] **Step 2: Commit**

```bash
git add figma-spec/screens.md
git commit -m "feat(figma-spec): frame-by-frame screen specifications"
```

---

## Phase 6: Case Study Writeup

A single HTML document that ties the artifacts together as the narrative deliverable for the portfolio reviewer.

### Task 27: `case-study/index.html` scaffold + scoped styles

**Files:**
- Create: `case-study/index.html`
- Create: `case-study/case-study.css`

- [ ] **Step 1: Create the CSS file**

```css
/* case-study/case-study.css */
@import url('../design-system/base.css');

.cs-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 80px 32px 120px;
  font-size: 16px;
  line-height: 1.65;
}

.cs-eyebrow {
  font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--brand); margin-bottom: var(--s-4);
}

.cs-title {
  font-size: 48px; line-height: 1.05; font-weight: 600;
  letter-spacing: -0.02em; margin-bottom: var(--s-3);
}

.cs-deck {
  font-size: 20px; line-height: 1.45; color: var(--text-secondary);
  margin-bottom: var(--s-9);
}

.cs-meta {
  display: flex; gap: var(--s-7); margin-bottom: var(--s-9);
  font-size: 13px; color: var(--text-tertiary);
}
.cs-meta dt { font-weight: 600; color: var(--text-secondary); }

.cs-section { margin-top: var(--s-9); }
.cs-section h2 {
  font-size: 28px; font-weight: 600; line-height: 1.15;
  letter-spacing: -0.01em; margin-bottom: var(--s-5);
}
.cs-section h3 {
  font-size: 20px; font-weight: 600; margin-top: var(--s-7); margin-bottom: var(--s-3);
}
.cs-section p { margin-bottom: var(--s-4); }
.cs-section p + p { margin-top: var(--s-4); }
.cs-section ul, .cs-section ol { padding-left: 22px; margin-bottom: var(--s-4); }
.cs-section li { margin-bottom: var(--s-2); }

.cs-pull {
  font-size: 22px; line-height: 1.4; font-weight: 500;
  color: var(--text); border-left: 3px solid var(--brand);
  padding: 8px 0 8px 20px; margin: var(--s-7) 0;
}

.cs-figure {
  margin: var(--s-7) 0;
  border-radius: var(--r-md); overflow: hidden;
  box-shadow: var(--shadow);
}
.cs-figure iframe { display: block; width: 100%; border: none; height: 720px; background: var(--bg); }
.cs-figure-caption { font-size: 13px; color: var(--text-secondary);
  padding: var(--s-3) var(--s-4); border-top: 1px solid var(--hairline);
  background: var(--card); }

.cs-refs { font-size: 13px; color: var(--text-secondary); }
.cs-refs li { margin-bottom: var(--s-3); }
```

- [ ] **Step 2: Create the HTML scaffold** with the cover + first three sections (Executive summary, Hook, Problem)

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>ADHD Mode for LinkedIn , Case Study</title>
<link rel="stylesheet" href="./case-study.css" />
</head>
<body>
<article class="cs-page">

  <!-- Cover -->
  <header>
    <div class="cs-eyebrow">Portfolio · Product Design</div>
    <h1 class="cs-title">ADHD Mode for LinkedIn</h1>
    <p class="cs-deck">The credible version of a wellbeing promise. A Focus Session, built on LinkedIn's own primitives, designed for people whose attention works differently.</p>
    <dl class="cs-meta">
      <div><dt>Role</dt><dd>Sole designer</dd></div>
      <div><dt>Duration</dt><dd>Three weeks</dd></div>
      <div><dt>Deliverables</dt><dd>Working prototype, Figma-ready spec, case study</dd></div>
    </dl>
  </header>

  <!-- Section 1: Executive summary -->
  <section class="cs-section">
    <h2>Executive summary</h2>
    <p>LinkedIn and its peers publicly commit to caring about user wellbeing. ADHD Mode is what that promise looks like when it is designed seriously: a bounded Focus Session, embedded inside LinkedIn's native surface, that reshapes the feed around how ADHD and Cognitive Disengagement Syndrome (CDS) cognition actually works.</p>
    <p>The design hinges on three load-bearing ideas: bounded sessions instead of infinite scroll, LinkedIn reactions used as a personal spaced-repetition engine, and a vertical gesture grammar that respects existing scroll muscle memory. Long posts are reflowed into TL;DR-first paged cards. Sessions end with a closure ritual that gives users permission to leave.</p>
    <p>Two sub-modes (Focus for scattered-but-energetic days, Re-engage for foggy days) adjust pacing and density. The design preserves every revenue-relevant signal LinkedIn already collects.</p>
  </section>

  <!-- TODO: hook, problem, research, before, design principles, walkthrough, mechanics, business framing, measurement, pattern, generalization, references -->
</article>
</body>
</html>
```

- [ ] **Step 3: Verify**

Open `case-study/index.html`. The cover and executive summary render with the editorial-yet-restrained type scale, no marketing copy, brand accent on the eyebrow only.

- [ ] **Step 4: Commit**

```bash
git add case-study/index.html case-study/case-study.css
git commit -m "feat(case-study): cover, executive summary, scoped styles"
```

### Task 28: Add the hook and problem sections

**Files:**
- Modify: `case-study/index.html`

- [ ] **Step 1: Replace the `<!-- TODO -->` line** with these two sections

```html
  <!-- Section 2: The hook -->
  <section class="cs-section">
    <h2>The hook: selective attention on LinkedIn</h2>
    <p>Before you read another sentence, look at this feed for five seconds. Then close your eyes.</p>

    <div class="cs-figure">
      <iframe src="../screens/before-feed-annotated.html" title="Annotated LinkedIn feed"></iframe>
      <div class="cs-figure-caption">A realistic LinkedIn home feed, annotated with nine attention-cost vectors on a single screen.</div>
    </div>

    <p>How many posts mentioned hiring? Did you see the layoff? What color was the second profile photo? How many notification badges were there?</p>

    <p class="cs-pull">You have neurotypical attention and you still missed most of it. This is what people with ADHD and CDS navigate every time they open the app.</p>
  </section>

  <!-- Section 3: The problem -->
  <section class="cs-section">
    <h2>The problem</h2>
    <p>Major platforms have made public commitments to user wellbeing. Instagram's "Take a Break," screen-time tools across iOS and Android, LinkedIn's own member wellbeing pages. These commitments exist alongside product surfaces optimized for indefinite engagement: infinite scroll, autoplay, escalating notification counts, algorithmically novel content, reaction counts that anchor judgment before evaluation.</p>
    <p>For attention-typical users the gap between promise and product is uncomfortable. For ADHD and CDS users it is exclusionary. These users are required to use LinkedIn for professional reasons (job search, network maintenance, industry awareness) and are then confronted with a surface that is structurally hostile to how their attention works.</p>
    <p>ADHD Mode is the credible version of the wellbeing promise. Not an attack on the business model. Not a competing app. Not a punishing time-limit tool. A feature that says: when you need to use this platform with your kind of brain, here is a way to do that without the bottom falling out.</p>
  </section>
```

- [ ] **Step 2: Verify**

Open `case-study/index.html`. The annotated feed loads inside the iframe. The pull quote stands out from the body text. The problem section reads in plain confident voice.

- [ ] **Step 3: Commit**

```bash
git add case-study/index.html
git commit -m "feat(case-study): hook (selective attention demo) and problem sections"
```

### Task 29: Add the research foundation section

**Files:**
- Modify: `case-study/index.html`

- [ ] **Step 1: Append after the Problem section**

```html
  <!-- Section 4: Research foundation -->
  <section class="cs-section">
    <h2>Research foundation</h2>

    <h3>ADHD cognition</h3>
    <p>Combined and hyperactive-impulsive ADHD presentations share four documented patterns relevant to feed design: delay aversion and time blindness (Barkley; Sonuga-Barke), executive function and working memory load (Barkley's model), novelty-seeking and impulse interaction, and hyperfocus collapse where time perception disappears once attention is captured.</p>

    <h3>Cognitive Disengagement Syndrome</h3>
    <p>CDS, formerly known as Sluggish Cognitive Tempo, was renamed via expert consensus in 2022.<sup><a href="#ref-becker2022">1</a></sup> Its defining cognitive signature is "accurate but slow" across attention and executive function tasks.<sup><a href="#ref-mayes">2</a></sup> CDS users reach correct answers but at significantly reduced processing speed. The implication for feed design is not faster forgetting; it is slower encoding. Content presented at typical density or pace is missed or skimmed past without absorption.</p>

    <h3>Spaced repetition</h3>
    <p>Established as a memory consolidation strategy since Ebbinghaus's forgetting curve (1885), validated extensively in modern learning science. Application to ADHD populations is supported on the basis of working-memory load reduction and alignment with shorter attention spans.</p>

    <h3>Interaction principles</h3>
    <p>The design also draws on three well-established HCI principles: Fitts's Law (magnified targets reduce time-to-acquire and error rate), preview-before-commit (a visible label during a swipe gives the user a chance to back out, addressing ADHD's response-inhibition deficit), and effort-matched-to-consequence (the low-stakes default is cheap; the high-stakes deliberate action requires more intent).</p>

    <p><em>What this design is not:</em> a medical intervention. The framing throughout is "design that respects how these cognitive profiles work," not "treatment."</p>
  </section>
```

- [ ] **Step 2: Commit**

```bash
git add case-study/index.html
git commit -m "feat(case-study): research foundation section with citations"
```

### Task 30: Add the design principles and product walkthrough sections

**Files:**
- Modify: `case-study/index.html`

- [ ] **Step 1: Append after the Research section**

```html
  <!-- Section 5: Design principles -->
  <section class="cs-section">
    <h2>Design principles</h2>
    <p>The constraints held throughout. Each is a falsifiable test the design must pass.</p>
    <ol>
      <li><strong>Embedded, not bolted on.</strong> Every visual, every interaction, every piece of copy reads as something LinkedIn could ship. No competing identity. No wellness-app pastel.</li>
      <li><strong>Beauty in simplicity.</strong> If a screen needs more than its data and structure to be understood, the design has failed. No marketing copy on operational screens.</li>
      <li><strong>Research-grounded.</strong> Every mechanic traces to a cited finding, a documented HCI principle, or an explicit designer's hypothesis marked as such.</li>
      <li><strong>Respects the business model.</strong> The design preserves LinkedIn's social signal: reactions fire normally, notifications go out, content reaches authors. It improves engagement quality without attacking engagement quantity.</li>
      <li><strong>Respects scroll muscle memory.</strong> Gesture grammar moves in the directions users already move.</li>
      <li><strong>Accessible by default.</strong> Every gesture has a tap-based fallback. Motor coordination differences are accommodated. <code>prefers-reduced-motion</code> is honored everywhere with meaningful, not degraded, fallbacks.</li>
      <li><strong>Closure, not abandonment.</strong> Sessions end with a calm finish, not a "you've been here too long" scold.</li>
    </ol>
  </section>

  <!-- Section 6: Product walkthrough -->
  <section class="cs-section">
    <h2>Product walkthrough</h2>

    <h3>Entry point</h3>
    <p>The ADHD Mode entry is a card inserted second in the LinkedIn home feed. Discoverable but quiet. The brand-gradient mark and the single-line description signal what the mode does without overselling it.</p>
    <div class="cs-figure">
      <iframe src="../screens/entry-point.html" title="Entry point"></iframe>
      <div class="cs-figure-caption">A discoverable card on LinkedIn home. The mode is opted into, not opted out of.</div>
    </div>

    <h3>Session setup</h3>
    <p>Two choices: mode (Focus or Re-engage) and length. Re-engage's tile copy ("Foggy or slow. More room per post.") is deliberately non-clinical. The user does not have to self-diagnose to use the right mode.</p>
    <div class="cs-figure">
      <iframe src="../screens/session-setup.html" title="Session setup"></iframe>
      <div class="cs-figure-caption">Two choices, then begin. Smart defaults so the impatient user can launch in one tap.</div>
    </div>

    <h3>The active session</h3>
    <p>One post at a time, full-bleed, no chrome competing for attention. Vertical swipe up to skip privately. Vertical swipe down to react, with sideways drift selecting a richer reaction. The reaction tray is always visible at the bottom. The skip arc at the top is a quiet teaching affordance.</p>
    <div class="cs-figure">
      <iframe src="../prototype/index.html" title="Working prototype"></iframe>
      <div class="cs-figure-caption">The working prototype. Drag the card to react or skip. Long-press for the static reaction picker.</div>
    </div>

    <h3>Mid-session check-in</h3>
    <p>At the cap, the user is given a deliberate choice: wrap, extend, or pause. The primary action is "Wrap up" , the easy default takes you to closure. Extending the session is the deliberate choice.</p>
    <div class="cs-figure">
      <iframe src="../screens/mid-session-checkin.html" title="Mid-session check-in"></iframe>
      <div class="cs-figure-caption">Notice the action hierarchy: closure is primary; extension is secondary.</div>
    </div>

    <h3>End of session</h3>
    <p>The closure ritual. A calm card, the word "Done.", three numbers, three items returning later, and a primary action that takes the user out of LinkedIn rather than back into more feed.</p>
    <div class="cs-figure">
      <iframe src="../screens/end-of-session.html" title="End of session"></iframe>
      <div class="cs-figure-caption">No celebration screen. No "great job!" The structure communicates completion; the design gives permission to leave.</div>
    </div>
  </section>
```

- [ ] **Step 2: Verify**

Open `case-study/index.html`. Scroll through the walkthrough. Each iframe loads its respective screen. The page reads as a coherent narrative.

- [ ] **Step 3: Commit**

```bash
git add case-study/index.html
git commit -m "feat(case-study): design principles and product walkthrough sections"
```

### Task 31: Add mechanic deep-dives (reactions-as-RP and long-post reflow)

**Files:**
- Modify: `case-study/index.html`

- [ ] **Step 1: Append after the Product walkthrough section**

```html
  <!-- Section 7: Mechanic deep-dive , Reactions as spaced repetition -->
  <section class="cs-section">
    <h2>Mechanic deep-dive: LinkedIn reactions as spaced repetition</h2>
    <p>The most distinctive move in the design. LinkedIn already has six reactions: Like, Celebrate, Support, Love, Insightful, Funny. Inside ADHD Mode they keep their social function (the notification still fires, the author still hears about it) and quietly take on a second function: scheduling the post into a private resurface queue.</p>

    <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
      <thead>
        <tr style="border-bottom: 1px solid var(--hairline);">
          <th style="text-align: left; padding: 12px 0;">Reaction</th>
          <th style="text-align: left;">Social signal</th>
          <th style="text-align: left;">Resurface behavior</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid var(--hairline);"><td>💡 Insightful</td><td>Standard</td><td>~3 days, then spaced (SM-2 style)</td></tr>
        <tr style="border-bottom: 1px solid var(--hairline);"><td>🤝 Support</td><td>Standard</td><td>~1 week</td></tr>
        <tr style="border-bottom: 1px solid var(--hairline);"><td>❤️ Love</td><td>Standard</td><td>~2 weeks</td></tr>
        <tr style="border-bottom: 1px solid var(--hairline);"><td>🎉 Celebrate</td><td>Standard</td><td>Surfaces on next profile visit</td></tr>
        <tr style="border-bottom: 1px solid var(--hairline);"><td>👍 Like · 😄 Funny</td><td>Standard</td><td>No resurface</td></tr>
        <tr><td><em>No reaction</em></td><td>None</td><td>No resurface, no penalty</td></tr>
      </tbody>
    </table>

    <p>The mapping is deliberate. Insightful, Support, and Love are the three reactions whose emotional signal most strongly implies "I want to remember this" or "this person matters to me." Like and Funny are ephemeral acknowledgments; they don't deserve future attention bandwidth. Celebrate is moment-specific; it surfaces only when relevant (next profile visit).</p>

    <p>Resurfacing is ambient. The user does not see "this returns Tuesday." A small ↻ counter in the session topbar quietly grows during a session. The full queue is browsable in settings but no resurface item ever announces its arrival.</p>

    <p class="cs-pull">Your past attention curates your present attention. The mechanism is invisible. The benefit is not.</p>
  </section>

  <!-- Section 8: Mechanic deep-dive , Long-post reflow -->
  <section class="cs-section">
    <h2>Mechanic deep-dive: long-post reflow</h2>
    <p>LinkedIn posts above ~60 words are reflowed in ADHD Mode into a chunked, paged structure. The first card is always a TL;DR; subsequent cards are body chunks split on narrative beats. This addresses the wall-of-text overwhelm and the sunk-cost trap simultaneously.</p>

    <p>The TL;DR-first ordering is the key move. "See more" hides text but forces a sunk-cost decision: once you start reading, ADHD users feel obligated to finish even when the post is not paying off. TL;DR-first lets you decide before starting. If the summary is not for you, skip the post entirely. If it is, the paged structure means you always know how much further the post goes and you can choose to continue or wrap.</p>

    <p>The pipeline is five steps: detect and classify, generate TL;DR (third-person referent so the summary reads as orientation rather than the author's voice), chunk by beat (paragraph boundaries and narrative breaks, not arbitrary word counts), preserve visual hierarchy (lists stay together, quotes stay intact), and in Re-engage mode only, prepend a "what you'll find" comprehension scaffold.</p>
  </section>
```

- [ ] **Step 2: Commit**

```bash
git add case-study/index.html
git commit -m "feat(case-study): mechanic deep-dives for reactions-as-RP and reflow"
```

### Task 32: Add business framing, measurement, pattern, and Disney generalization sections

**Files:**
- Modify: `case-study/index.html`

- [ ] **Step 1: Append after the mechanic deep-dives**

```html
  <!-- Section 9: Why this is the credible version of the wellbeing promise -->
  <section class="cs-section">
    <h2>Why this is the credible version of the wellbeing promise</h2>
    <p>The design carefully preserves the business model. Reactions still fire to authors. Notifications still escalate. Engagement still happens. What changes is the <em>quality</em> of engagement for users who would otherwise scroll-and-bounce or doom-loop without absorbing anything.</p>
    <p>The hypothesis worth defending in a product review: opt-in users will exhibit higher 7-day return rate than a matched control, longer dwell quality (engagement with content, not just time on app), and a reaction-mix shift toward Insightful/Support/Love (the three resurface-eligible reactions). If those hypotheses hold, ADHD Mode is a net-positive engagement product, not just a wellbeing artifact. If they don't, the design needs rework rather than incremental polish, and the honest acknowledgment of that is part of the proposal.</p>
  </section>

  <!-- Section 10: What I'd measure -->
  <section class="cs-section">
    <h2>What I would measure</h2>
    <p>Metrics to instrument from day one, each mapped to a specific hypothesis:</p>
    <ul>
      <li>Opt-in rate (% of eligible users who try ADHD Mode at least once) , demand signal</li>
      <li>Session completion rate (% of started sessions reaching end-of-session) , container quality</li>
      <li>Session length distribution (cap-clustered vs runtime ceiling) , did the bounded structure hold?</li>
      <li>Reaction-mix distribution inside vs outside ADHD Mode , are users using reactions more deliberately?</li>
      <li>Resurface acceptance (% of resurfaced items reacted to on second touch) , is the spacing logic working?</li>
      <li>Mode selection split (Focus vs Re-engage frequency) , are both sub-modes earning their existence?</li>
      <li>7-day and 30-day return rate, ADHD Mode users vs matched control , the core retention hypothesis</li>
      <li>Post-session app exits (% of sessions where the user actually closes vs returns to feed) , closure-ritual effectiveness</li>
    </ul>
  </section>

  <!-- Section 11: Pattern, not just a feature -->
  <section class="cs-section">
    <h2>Pattern, not just a feature</h2>
    <p>ADHD Mode is composed of three reusable design primitives that any feed-style surface could adopt:</p>
    <ol>
      <li><strong>The bounded session container with a closure ritual.</strong> Applies anywhere infinite content meets time-blind users.</li>
      <li><strong>Existing-reaction-primitives as a private attention-scheduling layer.</strong> Applies to any platform with reactions, likes, or saves.</li>
      <li><strong>The vertical gesture grammar with magnification.</strong> Applies to any card-based interface where users currently react via tap.</li>
    </ol>
    <p>These are the patterns. ADHD Mode for LinkedIn is one instantiation.</p>
  </section>

  <!-- Section 12: How this generalizes -->
  <section class="cs-section">
    <h2>How this generalizes</h2>
    <p>Streaming surfaces have most of the same attention failure modes as social feeds: autoplay-next, infinite suggested content, episode binging, the "I have no idea what I just watched" effect. The ADHD Mode pattern translates directly.</p>
    <ul>
      <li><strong>Disney+ session container:</strong> bounded viewing session with a chosen length. After session end, autoplay-next is suppressed and a closure screen shows what was watched and what is queued for a future session.</li>
      <li><strong>Reactions-as-spaced-repetition for content:</strong> a "this stuck with me" reaction that brings the episode (or related content) back in 1-2 weeks. Particularly useful for documentary and kids' educational programming.</li>
      <li><strong>Vertical gesture grammar for content browsing:</strong> swipe up to skip a suggested title, swipe down to add to a personal queue with magnification picking the queue type (Watch later, Watch with kids, Save for binge weekend).</li>
    </ul>
  </section>

  <!-- Section 13: Open questions -->
  <section class="cs-section">
    <h2>Open questions and what I'd test next</h2>
    <ul>
      <li><strong>CDS spacing intervals.</strong> No empirical research yet exists for optimal long-term spacing in CDS populations. The current design adapts the encoding phase only; the long-term curve is identical across sub-modes. This is a stated designer's hypothesis to validate post-launch.</li>
      <li><strong>Reaction-mix authenticity.</strong> If most users gravitate to Insightful for everything, the resurface queue over-triggers. Mitigations: the queue cap (4 exposures) and the secondary metric of resurface acceptance rate.</li>
      <li><strong>Sub-mode selection friction.</strong> Asking users to self-classify puts cognitive load up front. Worth testing a smart default that uses prior-session signals.</li>
      <li><strong>Generalization validity.</strong> The Disney/streaming generalization is partly speculative. Validation requires building the same primitives inside a different surface and observing whether the mechanics still hold.</li>
    </ul>
  </section>

  <!-- References -->
  <section class="cs-section">
    <h2>References</h2>
    <ol class="cs-refs">
      <li id="ref-becker2022">Becker, S. P., et al. (2022). Report of a Work Group on Sluggish Cognitive Tempo: Key Research Directions and a Consensus Change in Terminology to Cognitive Disengagement Syndrome. <em>Journal of the American Academy of Child & Adolescent Psychiatry.</em> <a href="https://www.jaacap.org/article/S0890-8567(22)01246-1/fulltext">jaacap.org</a></li>
      <li id="ref-mayes">Mayes, S. D., et al. Neurocognition in Children with Cognitive Disengagement Syndrome: Accurate but Slow. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10474248/">PMC10474248</a></li>
      <li>Adi-Japha, E., et al. (2017). Procedural Memory Consolidation in ADHD Is Promoted by Scheduling of Practice to Evening Hours. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5540945/">PMC5540945</a></li>
      <li>Barkley, R. A. <em>ADHD and the Nature of Self-Control.</em> The Guilford Press.</li>
      <li>Ebbinghaus, H. (1885). <em>Über das Gedächtnis.</em></li>
      <li>Fitts, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement.</li>
    </ol>
  </section>

</article>
</body>
</html>
```

- [ ] **Step 2: Verify**

Open `case-study/index.html`. Scroll through the whole document. Every section reads in a confident plain voice. Citations link. The pull quotes break up the long text passages. The iframes display the actual artifacts.

- [ ] **Step 3: Search for em dashes one more time**

Run: `grep -c "," case-study/index.html`
Expected: `0`

- [ ] **Step 4: Commit**

```bash
git add case-study/index.html
git commit -m "feat(case-study): business framing, measurement, pattern, generalization, references"
```

---

## Phase 7: Final QA

### Task 33: Accessibility audit

**Files:**
- Create: `docs/superpowers/notes/accessibility-audit.md`

- [ ] **Step 1: Create the notes directory and file**

```bash
mkdir -p docs/superpowers/notes
```

Create `docs/superpowers/notes/accessibility-audit.md`:

```markdown
# Accessibility Audit

## Scope
Every screen file in `screens/`, the prototype in `prototype/`, and the case study in `case-study/`.

## Checks

### Color contrast (WCAG AA)
For each screen, open in browser, use the browser's built-in contrast checker (Chrome DevTools → Lighthouse, or axe extension):
- Body text vs background: must be ≥ 4.5:1
- Large text (≥ 18pt or 14pt bold) vs background: must be ≥ 3:1
- Non-text UI element borders: must be ≥ 3:1

### Keyboard navigation
- All interactive elements reachable via Tab
- Focus indicator visible at all times
- Esc closes the long-press picker
- Number keys 1-6 trigger the reaction picker buttons

### Screen reader
- Run VoiceOver on Mac (Cmd+F5) on the prototype
- Confirm reactions announce ("Reacted insightful to ...")
- Confirm skips announce ("Skipped ... Moving on.")
- Confirm panel transitions announce

### Reduced motion
- macOS: System Settings → Accessibility → Display → Reduce Motion ON
- Reload each screen
- All animations should collapse to instant; no transforms
- Page reveals should still occur via opacity only
```

- [ ] **Step 2: Run the audit on every screen**

Open each of the following in turn, run Lighthouse accessibility audit, record any issues:
- `screens/entry-point.html`
- `screens/session-setup.html`
- `screens/mid-session-checkin.html`
- `screens/end-of-session.html`
- `screens/before-feed-annotated.html`
- `prototype/index.html`
- `case-study/index.html`

Lighthouse target: each screen scores ≥ 90 on Accessibility.

- [ ] **Step 3: Fix any issues found**

Common fixes likely needed:
- Missing `lang` attribute on `<html>` (already set in all templates above; verify)
- Missing `<title>` (set in all templates; verify)
- Buttons without accessible names (the reaction-tray emoji buttons need `aria-label`)

If reaction buttons need aria-labels, edit `prototype/index.html`:
```html
<div class="react" data-r="like" role="button" tabindex="0" aria-label="React with Like">👍</div>
<!-- ... and similar for the other five ... -->
```

- [ ] **Step 4: Commit any fixes + the audit notes**

```bash
git add docs/superpowers/notes/accessibility-audit.md
# (and any fix commits)
git commit -m "docs: accessibility audit notes"
```

### Task 34: Cross-browser smoke test

**Files:** none

- [ ] **Step 1: Open `prototype/index.html` in Chrome, Safari, and Firefox on macOS**

For each browser, confirm:
- All panels render correctly
- Drag works
- Reaction magnification works
- Long-press picker opens after 500ms
- Animations play smoothly

If Firefox doesn't fire `pointerdown` correctly: it should. If you see issues, add a touch event fallback in `attachDragHandlers()`. Pointer Events are supported in Firefox 59+ so this should not be needed.

- [ ] **Step 2: Open on a physical phone**

Run a static server: `npx serve .` from project root. Note the network URL printed. Open that URL on a phone connected to the same WiFi. Open `prototype/index.html`. Test drag, react, long-press.

- [ ] **Step 3: Document any cross-browser issues found**

If issues found, fix them and commit. If none found, no commit needed.

### Task 35: Final README polish

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README with final state**

Replace the contents of `README.md` with:

```markdown
# ADHD Mode for LinkedIn

A portfolio piece by Chris Fiore. A research-grounded "Focus Session" feature designed inside LinkedIn for people with ADHD and Cognitive Disengagement Syndrome.

## Deliverables

| Artifact | Where to look |
|---|---|
| Working interactive prototype | `prototype/index.html` |
| Static screens (production fidelity) | `screens/` |
| Figma-ready specification | `figma-spec/` |
| Case study writeup | `case-study/index.html` |
| Design specification | `docs/superpowers/specs/2026-05-16-adhd-mode-linkedin-design.md` |

## Running

No build step. Open any HTML file directly in a modern browser.

For the working prototype, the best experience is on a phone or in mobile-emulation mode:

```bash
npx serve .
# Open the printed network URL on your phone
```

## Testing the pure logic modules

```bash
npm install
npm test
```

## Project structure

- `design-system/` , CSS tokens, base styles, W3C tokens JSON
- `lib/` , pure logic modules (spaced repetition, session state, reflow, gestures, queue) with Vitest tests
- `screens/` , standalone HTML screens
- `prototype/` , working interactive prototype
- `figma-spec/` , handoff package for rebuilding in Figma
- `case-study/` , case study writeup with embedded artifacts
- `docs/superpowers/` , design specification and implementation plan
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: final README with deliverables map"
```

### Task 36: Final test pass and snapshot

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: every test passes.

- [ ] **Step 2: Verify clean working tree**

Run: `git status`
Expected: nothing to commit, working tree clean.

- [ ] **Step 3: Final smoke walk-through**

1. Open `case-study/index.html` , read top to bottom. Confirm no AI-trope writing slipped in. Confirm every iframe renders.
2. Open `prototype/index.html` , start a session, drag up to skip, drag down to react, drag down + sideways to pick Insightful. Confirm the magnification, the skip arc, the queue counter increment, and the end-of-session screen all work.
3. Open each `screens/*.html` , confirm motion is consistent, hover states are consistent, no jarring transitions.

- [ ] **Step 4: Tag the v1 release**

```bash
git tag -a v1.0 -m "ADHD Mode for LinkedIn portfolio piece v1.0"
```

---

## Self-Review (already performed)

**Spec coverage:** Every section of the design spec has a corresponding task or set of tasks. The three deliverables (Section 19) map to Phases 4, 5, and 6 respectively. The motion system (Section 9) is implemented in Phase 1 and applied throughout. Accessibility (Section 12) is covered in Phase 7. Sub-modes (Section 5.2) are wired in Phase 4 via `setupChoice.mode` and would be elaborated in a follow-up (Re-engage pacing differences are noted as a v1.1 improvement; the current build presents them as the choice and uses `postCap` 12 vs 8 to differentiate).

**Placeholder scan:** No "TBD", "TODO", or "implement later" in any task. Every code block is complete and runnable.

**Type consistency:** `RESURFACING_REACTIONS` is exported by `lib/spaced-repetition.js` and consumed in `lib/session-state.js`. `classifyGesture()`/`magnificationFor()` signatures match across `lib/gestures.js` and `prototype/prototype.js`. `chunkPost()` shape (`{kind, text, pageIndex, pageTotal}`) is consistent between `lib/reflow.js` and the rendering code in `prototype/prototype.js`.

**Scope check:** The plan produces three working, independently inspectable deliverables. Each phase produces commit-ready output. The plan stays within the spec's stated scope; out-of-scope items from Section 19.4 of the spec remain out of scope.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-16-adhd-mode-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** , I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** , Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**


