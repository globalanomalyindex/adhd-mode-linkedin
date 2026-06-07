# ADHD Mode for LinkedIn

A portfolio piece by Chris Fiore. A research-grounded "Focus Session" inside LinkedIn for
people with ADHD and Cognitive Disengagement Syndrome. The argument: this is the credible
version of the wellbeing promise platforms already make. It optimizes for capability and
recall, not time on app.

## Deliverables

| Artifact | Where to look |
|---|---|
| Case study writeup | `case-study/index.html` |
| Flagship interactive prototype | `prototype/demo.html` (best on a phone or in mobile emulation) |
| Typed, tested React component | `react/ActionDock.tsx` (+ `ActionDock.test.tsx`) |
| Capability-analytics pipeline | `analytics/` (Python, synthetic data) |
| Static screens (production fidelity) | `screens/` (start with `active-session.html`) |
| Design system + tokens | `design-system/` (generated from one source) |
| Figma file | [figma.com/design/ZFEmkHeen3nXUy6ogyGQW0](https://www.figma.com/design/ZFEmkHeen3nXUy6ogyGQW0) |
| Figma-ready specification | `figma-spec/` |
| Design specification | `docs/superpowers/specs/2026-05-16-adhd-mode-linkedin-design.md` |
| Build canon (single source of truth) | `docs/build-canon.md` |

## Running the front end

No build step for the prototype or screens. From the project root:

`npx serve .`

Then open the printed network URL. The flagship demo (`prototype/demo.html`) imports the
typed logic from `lib/` as ES modules, so it needs to be served over HTTP, not opened from
the file system. Best experienced on a phone or in mobile emulation.

## Engineering

The pure logic lives in `lib/` as side-effect-free ES modules, typed with JSDoc and
checked by TypeScript (`tsc --checkJs`) without a build step, so the same files run in the
browser, in tests, and under the type checker.

```
npm install
npm test        # 59 tests (lib logic + React ActionDock)
npm run typecheck   # tsc --noEmit over the JSDoc-typed lib and the React component
npm run lint        # eslint
npm run tokens:build   # regenerate design-system/tokens.css + tokens.json from one source
npm run check:dashes   # enforce the no-em-dash voice rule
npm run ci          # test + typecheck + lint + check:dashes
```

CI runs the same chain plus a token-freshness gate (`.github/workflows/ci.yml`).

## Analytics

`analytics/` makes the capability thesis computable. A typed event taxonomy
(`event_schema.py`) matches the in-app event model; a seeded generator writes a clearly
labeled synthetic event log; and `capability_metrics.py` computes capability-first metrics
(resurfaced-content recall vs control, comprehension after reflow, intentional completion,
settledness delta), engagement guardrails, and harm counter-metrics. All data is synthetic
and illustrative. See `analytics/README.md`.

## Project structure

- `design-system/` tokens generated from `tokens.source.json` (CSS + W3C JSON), base styles
- `lib/` pure logic (spaced repetition, session state, reflow, gestures, queue) with types and Vitest tests
- `react/` typed, tested, accessible React ActionDock built from its own spec
- `analytics/` Python capability-metrics pipeline over synthetic data
- `screens/` standalone LinkedIn-native screens, including the active-session centerpiece
- `prototype/` flagship interactive prototype with a hand-written spring engine
- `figma-spec/` handoff package for rebuilding in Figma
- `case-study/` case study writeup with embedded artifacts
- `docs/` design specification, implementation plan, build canon, audit notes
