# Action Dock · Component Specification

The bottom UI of the focus session card view. Replaces the previous "full reaction tray" pattern with two focused FABs that preserve gesture interactions while making tap interactions discoverable and standard.

## Why the redesign

The previous tray (six emoji icons always visible at the bottom) was always-on visual noise that only made sense during the rare moment when the user wanted to react. The new model: two circular FABs at the corners ("Comment" left, "React" right) keep the bottom clean. Tapping the React FAB expands a tray leftward to reveal the six reactions. Dragging the card down still auto-expands the tray for the gestural path. Tap-friendly AND gesture-friendly.

## Atoms

### Icon · Comment
- Source: speech-bubble (Lucide `message-circle`)
- Stroke width: 2.0px
- Size: 24×24

### Icon · Smile
- Source: smile (Lucide `smile`)
- Stroke width: 2.0px
- Size: 24×24
- Used in the React FAB's collapsed state

### Icon · Close
- Source: × (Lucide `x`)
- Stroke width: 2.4px
- Size: 22×22
- Used in the React FAB's expanded state (replaces the Smile)

### Reaction Emoji
- Source: native emoji
- Six variants: Insightful 💡, Support 🤝, Love ❤️, Celebrate 🎉, Like 👍, Funny 😄
- Rendered at 22px in resting, 36px when magnified

## Molecules

### FAB · Round (base)
The shared base for both Comment FAB and React FAB.

**Size:** 52×52 (collapsed)
**Shape:** `border-radius: 999` (pill, infinite radius)
**Background:** liquid glass
```
fill:           rgba(255, 255, 255, 0.62)
backdrop-blur:  40px
backdrop-saturate: 180%
border:         1px solid rgba(255, 255, 255, 0.45)
shadow-outer:   0 14px 36px rgba(0, 0, 0, 0.12)
shadow-inner:   inset 0 1px 0 rgba(255, 255, 255, 0.6)
```

**States**

| State | Transform | Background | Notes |
|---|---|---|---|
| Resting | none | base glass | default |
| Hover | translateY(-1px) | brighter (0.78 alpha) | desktop only |
| Pressed | scale(0.96) | base | tap feedback |
| Disabled | none, 38% opacity | base | rare |

### FAB · Comment
**Composition:** FAB Round base + `Icon / Comment` centered, ink color `rgba(0,0,0,0.85)`.
**Behavior:** tap → opens compose bottom sheet for a top-level reply to the post.

### FAB · React (collapsed)
**Composition:** FAB Round base + `Icon / Smile` centered, ink color `rgba(0,0,0,0.85)`.
**Behavior:** tap → expands the dock to reveal the reaction tray.

### FAB · React (expanded)
**Width:** 264 (was 52). Animates via width transition.
**Composition (right to left):**
1. `Icon / Close` in the same position the Smile occupied (right edge)
2. Six `Reaction Slot` molecules, evenly distributed across the remaining width

**Behavior:** Smile icon morphs to Close icon. Reaction slots stagger in from right to left at 40ms intervals. Each slot is tappable to commit.

### Reaction Slot
**Size:** 40×40 tap target (visual emoji 22px)
**States**

| State | Emoji scale | Background | Trigger |
|---|---|---|---|
| Resting | 1.0 | transparent | default in expanded tray |
| Magnified | 2.0 (peak) | brand-tint at 6% | thumb proximity ≤50px AND card in react zone |
| Pressed | 0.94 | brand-tint at 8% | tap-down |
| Committing | 1.04 → 1.0 spring | transparent | release on slot |

### Comment Chip (cycling)
Above the action dock. Unchanged from prior pass. Cycles 3 comments per post with 280ms crossfade.

## Organism

### Action Dock
**Position:** absolute, `bottom: 26px`, `left: 18px`, `right: 18px`
**Layout:** auto-layout horizontal, justify space-between, align center
**Height:** 52

**Composition**
- LEFT: FAB · Comment (52)
- (flex gap: auto)
- RIGHT: FAB · React (52 collapsed / 264 expanded)

**Variants**

| Variant | When | Visible |
|---|---|---|
| `state = collapsed` | default + idle | Both FABs as circles |
| `state = expanded` | tap React FAB OR card drag enters react zone | Comment FAB unchanged, React FAB widened with slots visible |

The dock width budget when expanded:
- Comment FAB: 52 (left:18 → right edge at 70)
- Gap: 12
- React FAB expanded: extends right edge at right:18, grows leftward to x ≈ 82
- Width = 396 − 18 − 18 − 52 − 12 (gap to comment FAB) = ~296 max
- Actual width used: 264 (leaves room to spare)

### Skip Target (unchanged)
Top-center circle. Liquid glass. Scales + activates with upward drag proximity. Documented in prior pass.

## State Machine (Action Dock)

```
[collapsed]
  │
  ├──tap React FAB──> [expanded · tap-source]
  ├──drag enters react zone──> [expanded · drag-source]
  ├──tap Comment FAB──> opens compose sheet (dock stays collapsed)
  └──card swipe up──> commits skip (dock stays collapsed)

[expanded · tap-source]
  │
  ├──tap React FAB (now Close)──> [collapsed]
  ├──tap outside dock──> [collapsed]
  ├──tap a slot──> commit reaction → [collapsed]
  └──post advances / sheet opens / compose opens──> [collapsed]

[expanded · drag-source]
  │
  ├──drag exits react zone──> [collapsed]
  ├──release on a slot──> commit reaction → [collapsed]
  └──drag converts to skip (dy < 0)──> [collapsed], skip system takes over
```

## Motion specifications

| Transition | Duration | Easing | Notes |
|---|---|---|---|
| Dock width expand | 400ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` (gentle spring) | exit is the same direction reversed |
| Dock width collapse | 280ms | `ease-out-expo` | per `exit-faster-than-enter` |
| Smile→Close icon morph | 240ms | `ease-out-expo` | crossfade + 90° rotation |
| Reaction Slot reveal | 240ms each | spring | stagger 40ms right→left when expanding, 30ms left→right when collapsing |
| Reaction Slot hover magnify | 180ms | spring | radius 50px (existing) |
| Tap feedback (any FAB) | 120ms | ease-out | scale 0.96 on press |

## Accessibility

- Comment FAB: `role="button"`, `aria-label="Write a comment"`, hitSlop 8px
- React FAB: `role="button"`, `aria-label="Add a reaction"`, `aria-expanded` syncs with state
- Reaction Slots: each gets `role="button"` + `aria-label` (e.g. "React with Insightful")
- Keyboard: Tab focuses FABs; Enter/Space activates; when React FAB is expanded, Arrow keys move focus across reaction slots, Escape collapses
- `prefers-reduced-motion`: collapse animations to 0.01ms; opacity-only transitions on icon morph and slot reveal

## Anti-patterns avoided

- **No always-visible tray of six emojis** taking up bottom real estate when 95% of the time the user doesn't react. The dock now serves both common (skip / swipe by) and rare (react / comment) actions without visual noise.
- **No hidden-only-gesture interactions.** Both Comment and React have visible standard tap affordances at the corners; the gesture is a power-user enhancement, not the only path.
- **No fake-input compose prompt** stretching across the bottom. That pattern is honest only if it does what it looks like (an input). A FAB is a more accurate signal: tap to enter compose mode.
- **Symmetric thumb ergonomics.** Both FABs at the corners are reachable on either hand; the React FAB sits on the right where most right-handed users' thumbs naturally rest.

## Notes for the Figma build

Build as a single component set `Action Dock / state` with Boolean property `expanded`. Inside, use auto-layout horizontal with two children:
1. A `FAB / Comment` instance (fixed width 52)
2. A `FAB / React` component-set with its own `state` variant (collapsed = 52, expanded = 264)

Use Smart Animate between dock variants to get the width transition for free. Each Reaction Slot is its own component with `state` variant for magnified previews; instances reference it inside the expanded React FAB.
