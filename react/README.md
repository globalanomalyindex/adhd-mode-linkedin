# Action Dock (React)

The bottom UI of the focus session card view: a **Comment FAB** on the left and
a **React FAB** on the right that expands a reaction tray leftward. This is the
React-stack implementation of the interaction specified in
[`figma-spec/action-dock.md`](../figma-spec/action-dock.md). It exists to make
the spec's accessibility contract real, executable code instead of prose.

The zero-dependency vanilla prototype in
[`prototype/demo.html`](../prototype/demo.html) is the zero-dependency variant of
the same interaction; both it and this component share the `Reaction` type from
[`lib/types`](../lib/types.d.ts), so the dock order stays in lockstep with
`lib/gestures.js` `REACTIONS_ORDER`.

## Usage

```tsx
import { useState } from 'react';
import { ActionDock, type Reaction } from './react';

// Canonical dock VISUAL order, left to right (build-canon.md section 4):
// resurfacing reactions sit on the deliberate-reach left, Like near the
// right thumb. Pass this to match every other surface.
const VISUAL_ORDER: Reaction[] = [
  'insightful',
  'support',
  'love',
  'celebrate',
  'like',
  'funny',
];

function SessionCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {/* ...the post card... */}
      <ActionDock
        reactions={VISUAL_ORDER}
        expanded={expanded}
        onExpandedChange={setExpanded}
        onReact={(r: Reaction) => commitReaction(r)}
        onComment={() => openComposeSheet()}
      />
    </div>
  );
}
```

Uncontrolled is just as valid; drop the `expanded` / `onExpandedChange` pair:

```tsx
<ActionDock
  reactions={VISUAL_ORDER}
  onReact={commitReaction}
  onComment={openComposeSheet}
/>
```

The dock is `position: absolute`, anchored to `bottom: 26px` with `left`/`right`
insets of `18px`, so place it inside a positioned container (the session card).

## Props

| Prop               | Type                        | Default            | Notes                                                                                  |
| ------------------ | --------------------------- | ------------------ | -------------------------------------------------------------------------------------- |
| `reactions`        | `Reaction[]`                | lib data order     | Slots render in this exact order. Defaults to `lib/gestures.js` `REACTIONS_ORDER` (the DATA order). Pass the VISUAL order (`insightful, support, love, celebrate, like, funny`, canon section 4) to match every other surface. |
| `onReact`          | `(r: Reaction) => void`     | required           | Called when a slot is activated (click, Enter, or Space). The dock then collapses.      |
| `onComment`        | `() => void`                | required           | Called when the Comment FAB is activated. The dock stays collapsed.                     |
| `expanded`         | `boolean`                   | undefined          | Controlled expanded state. When set, the component is controlled.                       |
| `defaultExpanded`  | `boolean`                   | `false`            | Initial expanded state for the uncontrolled component.                                  |
| `onExpandedChange` | `(b: boolean) => void`      | undefined          | Fires on every expand/collapse request, for both controlled and uncontrolled use.      |
| `className`        | `string`                    | undefined          | Extra class on the dock root.                                                           |

## Accessibility contract (implemented, not aspirational)

- **Comment FAB**: `role=button` (native `<button>`), `aria-label="Write a comment"`.
- **React FAB**: `role=button`, `aria-label` flips between `"Add a reaction"` and
  `"Close reactions"`, with `aria-expanded` synced to dock state.
- **Reaction slots**: each is a `role=button` with `aria-label` like
  `"React with Insightful"`. While collapsed they are `aria-hidden` and removed
  from the tab order.
- **Tab** reaches the two FABs. When expanded, **ArrowLeft / ArrowRight** move a
  single roving focus across the slots (roving `tabindex`, wrapping at the ends);
  **Home / End** jump to the first / last slot.
- **Enter / Space** activates the focused slot, fires `onReact`, and collapses.
- **Escape** collapses the dock and returns focus to the React FAB.
- **focus-visible** rings on every interactive element; all targets are at least
  44x44 CSS px (the FABs are 52, the slots 44).

## Motion

All motion lives in [`ActionDock.css`](./ActionDock.css) and follows the canon
motion table (`docs/build-canon.md` section 8):

- Only `transform`, `opacity`, and `clip-path` are animated; width is never
  animated. The leftward reveal is a `clip-path` inset on the glass shell off
  the compositor (parity with `prototype/demo.html`), which does not distort
  the shell or its contents.
- Canon easings: `--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)` for the clip
  enter/exit and for slot opacity, `--ease-spring`
  `cubic-bezier(0.34, 1.56, 0.64, 1)` for the expand and slot transform/scale
  (overshoot belongs on physical motion, not on opacity).
- **Exit is faster than enter** (collapse and slot-out use the fast duration).
- Slots **stagger** in right to left (40ms steps) and out left to right (30ms).
- Press feedback is `scale(0.97)` on `:active` (never `scale(0)`).
- `prefers-reduced-motion: reduce` drops all transform travel and the clip
  reveal; the shell and slots fade in on opacity instead of snapping from a
  circle to a bar in one frame.

The component reads its tokens from `design-system/tokens.css` when present and
falls back to inlined canon values otherwise, so it is drop-in without the global
stylesheet.

## State machine (simplification noted)

The full spec models three states: `collapsed`, `expanded (tap-source)`, and
`expanded (drag-source)`. This React component simplifies to **`collapsed` /
`expanded`** because the *source* of the expansion (tap vs drag) changes nothing
about the rendered output or the a11y behavior; it only matters to the gesture
engine, which is out of scope for this component. The reducer
(`dockReducer` in `ActionDock.tsx`) is small and explicit so the transitions map
onto the spec's diagram.

## Tests

```sh
npx vitest run react
```

21 tests cover rendering and roles, `aria-expanded` sync, roving focus across
slots, keyboard activation (Enter / Space), Escape collapse with focus
restoration, the Comment FAB callback, controlled vs uncontrolled behavior, and
the reduced-motion path.
