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

For the working prototype, the best experience is on a phone or in mobile-emulation mode. From project root:

`npx serve .`

Then open the printed network URL on your phone.

## Testing the pure logic modules

`npm install` then `npm test`. Tests cover spaced-repetition scheduling, session state machine, long-post reflow, gesture classification, and the resurface queue. 38 tests across 5 modules, all passing.

## Project structure

- `design-system/` - CSS tokens, base styles, W3C tokens JSON
- `lib/` - pure logic modules (spaced repetition, session state, reflow, gestures, queue) with Vitest tests
- `screens/` - standalone HTML screens
- `prototype/` - working interactive prototype
- `figma-spec/` - handoff package for rebuilding in Figma
- `case-study/` - case study writeup with embedded artifacts
- `docs/superpowers/` - design specification, implementation plan, audit notes
