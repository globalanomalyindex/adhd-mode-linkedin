# ADHD Mode Component Specifications

Handoff specifications for the current bounded-session concept. The product UI stays LinkedIn-native while Exposed Logic makes its real mechanics visible: time and post bounds, the current action zone, an on-demand reaction module, and explicit state transitions.

## Artifact status

| Status | What the handoff may claim |
|---|---|
| Built Action Dock study | The interaction in `prototype/demo.html`: Action Dock, real Move on button, tap/keyboard alternatives, drag classification, reaction magnification, and local feedback |
| Tested standalone logic | Reducer, duration and post bounds, gesture rules, scheduler, queue advancement, and reflow in `lib/`; these are not all connected to the study |
| Static concept | Setup, midpoint, closure, and annotated feed frames in `screens/`; they communicate intent but are not a working flow |
| Proposed production behavior | Queue opt-in, pause/delete controls, persistence, retention, duplicate handling, recovery, permissions, and LinkedIn integration |

## Foundations

### Color

Use the variables in `tokens.json`. Reserve cobalt for the active session and current selection, near-black for structure, and muted trace colors for boundaries and history. Reaction color must communicate a real state or destination, not decorate the frame.

### Typography

**Font:** Source Sans 3

| Variable | Size | Weight | Letter spacing | Line height |
|---|---:|---:|---:|---:|
| display | 32px | 600 | -0.015em | 1.15 |
| heading | 20px | 600 | -0.01em | 1.2 |
| body | 14px | 400 | 0 | 1.4 |
| small | 13px | 400 | 0 | 1.6 |
| meta | 12px | 600 | 0.04em | 1.2 |
| tiny | 11px | 400 | 0 | 1.3 |

Use tabular numerals only for the real timer, post count, and queue count. Avoid filler microtype.

### Spacing

4, 8, 12, 16, 20, 24, 32, 40, and 56px, stored as `space.1` through `space.9`.

### Radius

- `sm`: 4px
- `md`: 8px
- `lg`: 12px
- `pill`: 999px

## Molecular components

### Button · Primary

**Layout:** horizontal auto layout, 24px horizontal and 10px vertical padding.

**Background:** `color.brand`, changing to `color.brand-hover` on hover.

**Text:** 15px/600/white.

**Radius:** `radius.pill`.

Variants: default, hover, pressed, disabled, and focus-visible. Motion is limited to direct feedback; no idle animation.

### Button · Text

**Layout:** horizontal auto layout, 4px horizontal and 8px vertical padding.

**Text:** 14px/600/`color.brand`.

**Focus:** visible outline independent of color.

Variants: default, hover, pressed, and focus-visible.

### Avatar

Circle at 32, 36, 40, or 44px. Use the theme placeholders from `prototype/sample-feed.js` when no image exists.

### Hairline divider

1px solid `color.hairline`, horizontal or vertical.

### Reaction slot

A native button with a target of at least 40×40px and a 22px native emoji. Visual order is fixed, left to right:

1. Insightful 💡
2. Support 🤝
3. Love ❤️
4. Celebrate 🎉
5. Like 👍
6. Funny 😄

Insightful, Support, and Love seed the tested standalone resurface scheduler. Celebrate, Like, and Funny remain ephemeral in the current rules. Do not infer queue behavior from tint alone.

### Stat cell

**Layout:** vertical, 22px vertical and 12px horizontal padding, centered.

**Value:** 28px/600/tabular numerals/`color.text`.

**Label:** 13px/400/`color.text-secondary`, 6px below.

**Border:** 1px right hairline except on the final cell.

### Tag

Used for TL;DR and other real content states. Horizontal auto layout, 8px horizontal and 3px vertical padding; 10px/600 uppercase text; `radius.sm`. Do not use a tag as decorative technical chrome.

### Move on button

**Element:** native `<button>`.

**Position:** top center of the card stage.

**Target:** 56×56px.

**Contents:** 24px upward chevron with accessible name “Move on to the next post.”

Tap, click, Enter, and Space advance the post. An upward drag may arm and commit the same action. The visible button is the non-gesture equivalent and remains present at rest.

### Comment preview

The comment preview is user-controlled. Pagination dots are buttons with an accessible group label. Selecting a dot changes the preview; comments do not rotate automatically.

## Organisms

### Card · Post

**Layout:** vertical, 22px inner padding, 14px gap, `color.card` fill, `radius.lg`, `shadow`.

**Composition:** author row, optional TL;DR tag, post content, optional chunk progress, optional page label.

| State | Presentation |
|---|---|
| Resting | stable, no wobble or pulse |
| Dragging | `shadow-drag`, grabbing cursor, follows pointer |
| Exiting | direction follows committed input; settles on next card |

### Action Dock

See `action-dock.md` for detailed behavior.

**Resting composition:** Comment button at left, React button at right.

**Expanded composition:** Comment stays fixed; React grows leftward to show Insightful, Support, Love, Celebrate, Like, Funny, then Close.

**Open triggers:** React button or a downward drag entering the react zone.

**Close triggers:** Close, Escape, outside tap, post change, or committed reaction.

There is no always-visible six-reaction control.

### Session bounds

The frame exposes two limits at once: remaining time and posts seen against the selected cap. The first limit reached ends the session.

| Preset | Timer | Post cap | Single midpoint checkpoint |
|---|---:|---:|---:|
| Short | 5 minutes | 8 | after post 4 |
| Standard | 12 minutes | 15 | after post 8 |
| Extended | 20 minutes | 25 | after post 13 |

The midpoint checkpoint is shown at most once. Selecting Continue returns to the active session without changing the cap or immediately reopening the checkpoint.

### Session topbar

**Layout:** horizontal, 12px vertical and 16px horizontal padding, space between.

**Surface:** `color.card` with a 1px bottom hairline.

**Left:** 6px brand marker, mode label, and state.

**Right:** remaining time, post progress such as `6/15`, and local saved count.

The brand marker is static. It does not pulse. The topbar makes both bounds legible rather than suggesting an unbounded feed.

### Midpoint checkpoint

Centered modal with the real midpoint count for the selected preset, optional grounding prompt, and three explicit choices: Keep going, Wrap up now, or Pause and come back later. It appears once per session.

### Setup mode tile

Vertical auto layout with 14px padding and 4px gap. Selected state uses `color.brand` border and `color.brand-tint` fill. Focus and Re-engage are product hypotheses; do not claim validated pacing effects.

### Duration control

Each choice displays both bounds:

- 5 min · up to 8 posts
- 12 min · up to 15 posts
- 20 min · up to 25 posts

Use native buttons with selected state communicated visually and programmatically.

### Closure summary

Shows the end reason, posts seen, elapsed time, reactions, and items saved to revisit. Any “Coming back” list is a static concept backed by standalone scheduler rules, not a production queue manager. Queue controls are proposed and must be labeled as such.

## Quiet motion rules

Motion belongs to a user-triggered transition:

- card drag and commit
- Action Dock expansion and collapse
- reaction proximity magnification
- button press and focus response
- checkpoint or closure entering after a state change

Do not add ambient status pulses, idle card wobble, auto-rotating comments, looping end-state effects, or decorative HUD motion. With reduced motion enabled, remove transforms and stagger while preserving visible state, focus, and live-region announcements.

## Figma state notes

Build components with explicit variants for resting, focus-visible, pressed, expanded, dragging, committing, checkpoint, and ended states. Smart Animate may illustrate direct transitions, but prototype playback must settle after the destination state. Keep built, tested, static, and proposed behaviors labeled in the frame notes.
