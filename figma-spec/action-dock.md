# Action Dock · Component Specification

The Action Dock is the built interaction study for the focus-session card. It keeps comment and reaction actions visible without leaving six reactions on screen at all times. Gesture input is an accelerator; every commit also has a standard button path.

## Evidence boundary

- **Built in `prototype/demo.html`:** collapsed and expanded Action Dock, tap and drag reaction paths, visual magnification, a real tap-to-skip button, keyboard access, manual comment selection, and in-session saved count feedback.
- **Tested as standalone logic:** gesture classification, reaction-to-resurface rules, scheduling, queue advancement, session bounds, and long-post reflow live in `lib/` and are not all wired into this interaction study.
- **Static concepts:** setup, midpoint, and closure screens illustrate the intended end-to-end session around the study.
- **Proposed production behavior:** queue opt-in, pause, delete, retention, duplicate handling, recovery, persistence, and LinkedIn integration are not built.

Do not present the Action Dock study as evidence that the complete product, a production resurface queue, or LinkedIn integration exists.

## Why this model

The earlier permanent tray made a low-frequency choice consume the full bottom edge. The Action Dock reduces the resting interface to two 52px controls: Comment on the left and React on the right. Tapping React expands the reactions leftward; dragging the card into the react zone opens the same destination set. A separate top-center Move on button makes skip discoverable without removing the upward-swipe shortcut.

## Atoms

### Icon · Comment

- Source: speech bubble (Lucide `message-circle`)
- Stroke width: 2px
- Size: 24×24

### Icon · Smile

- Source: smile (Lucide `smile`)
- Stroke width: 2px
- Size: 24×24
- Used in the React FAB's collapsed state

### Icon · Close

- Source: × (Lucide `x`)
- Stroke width: 2.4px
- Size: 22×22
- Used in the React FAB's expanded state

### Icon · Move on

- Source: upward chevron
- Stroke width: 2.4px
- Size: 24×24
- Used inside a native button at the top center of the stage

### Reaction emoji

- Source: native emoji
- Visual order, **left to right:** Insightful 💡, Support 🤝, Love ❤️, Celebrate 🎉, Like 👍, Funny 😄
- Resting size: 22px
- Magnified size: up to 36px during a user-controlled drag

The first three reactions seed the tested standalone resurface scheduler. Celebrate, Like, and Funny are ephemeral in the current rules. The visual order is deliberate and must be passed explicitly anywhere the data order differs.

## Molecules

### FAB · Round

The shared base for Comment and React.

**Size:** 52×52

**Shape:** `border-radius: 999px`

**Background:** translucent session surface with an opaque fallback at narrow widths

```text
fill:           rgba(255, 255, 255, 0.62)
backdrop-blur:  40px
border:         1px solid rgba(255, 255, 255, 0.45)
shadow-outer:   0 14px 36px rgba(0, 0, 0, 0.12)
shadow-inner:   inset 0 1px 0 rgba(255, 255, 255, 0.6)
```

| State | Transform | Background | Notes |
|---|---|---|---|
| Resting | none | base surface | default |
| Hover | translateY(-1px) | brighter surface | pointer hover only |
| Pressed | scale(0.96) | base surface | direct response to input |
| Disabled | none, 38% opacity | base surface | uncommon |

### FAB · Comment

**Composition:** FAB Round + Comment icon.

**Behavior:** tap opens the compose sheet. The dock stays collapsed.

### FAB · React, collapsed

**Composition:** FAB Round + Smile icon.

**Behavior:** tap expands the dock and sets `aria-expanded="true"`.

### FAB · React, expanded

**Width:** 264px, grown leftward from the fixed right edge.

**Composition, left to right:** Insightful, Support, Love, Celebrate, Like, Funny, then Close in the trigger position.

**Behavior:** each reaction is a button. Selecting one commits the reaction and collapses the dock.

### Reaction slot

**Target:** 40×40px minimum; visual emoji is 22px.

| State | Emoji scale | Background | Trigger |
|---|---|---|---|
| Resting | 1 | transparent | dock expanded |
| Magnified | up to 2 | brand tint at 6% | pointer proximity within 50px during drag |
| Pressed | 0.94 | brand tint at 8% | pointer down |
| Committing | 1.04 → 1 | transparent | successful user selection |

### Move on button

**Position:** top center of the card stage.

**Target:** 56×56px native `<button>`.

**Behavior:** tap, click, Enter, or Space advances the post. An upward card drag arms and commits the same action. Proximity growth is feedback for the drag path, not the only way to skip.

### Comment preview

The preview changes only when the user selects a pagination dot. It does not auto-rotate. Opening it leads to the comment thread; it is not an ambient carousel.

## Organism · Action Dock

**Position:** absolute, `bottom: 26px`, `left: 18px`, `right: 18px`

**Layout:** horizontal auto layout, space between, center aligned

**Height:** 52px

- Left: Comment FAB, fixed 52px
- Right: React FAB, 52px collapsed or 264px expanded
- Expanded reaction order: Insightful, Support, Love, Celebrate, Like, Funny

| Variant | Trigger | Visible state |
|---|---|---|
| `collapsed` | default | Comment and React circles |
| `expanded · tap` | React button | six reaction buttons and Close |
| `expanded · drag` | downward drag enters react zone | same six destinations with proximity feedback |

At 396px wide, the maximum right-side budget is approximately 296px after the outer insets, Comment FAB, and 12px gap. The 264px expanded control stays within that budget.

## Session frame and dual bounds

The dock sits inside a bounded session, not an infinite feed. The topbar must expose both active limits at the same time:

| Time choice | Post cap | Midpoint shown once |
|---|---:|---:|
| 5 minutes | 8 posts | after post 4 |
| 12 minutes | 15 posts | after post 8 |
| 20 minutes | 25 posts | after post 13 |

The session closes when either the timer or the post cap is reached. The midpoint checkpoint appears once per session; continuing must not create a checkpoint loop.

## Interaction states

```text
[collapsed]
  ├── React button ───────────────> [expanded · tap]
  ├── drag enters react zone ─────> [expanded · drag]
  ├── Comment button ─────────────> compose sheet
  ├── Move on button ─────────────> next post
  └── upward drag ────────────────> next post

[expanded · tap]
  ├── Close / Escape / outside ───> [collapsed]
  └── reaction button ────────────> commit → [collapsed]

[expanded · drag]
  ├── drag exits react zone ──────> [collapsed]
  ├── release on a slot ──────────> commit → [collapsed]
  └── drag changes to skip ───────> [collapsed] → Move on
```

## Quiet motion

Motion explains a user-triggered state change, then settles. There is no ambient status pulse, idle card wobble, auto-rotating comment preview, or perpetual end-state animation.

| Transition | Duration | Easing | Purpose |
|---|---:|---|---|
| Dock expand | 320 to 400ms | gentle spring | reveal destinations after explicit input |
| Dock collapse | 240 to 280ms | ease out | settle after selection or dismissal |
| Smile → Close | 200 to 240ms | ease out | communicate mode change |
| Reaction reveal | up to 240ms | gentle spring | identify the destination set |
| Proximity magnification | up to 180ms | gentle spring | follow pointer position |
| Press feedback | 120ms | ease out | confirm direct input |

For `prefers-reduced-motion: reduce`, remove transform-based flourishes and stagger delays. State changes and announcements must remain perceivable without movement.

## Accessibility

- Comment, React, Move on, and every reaction use native buttons.
- React has `aria-expanded` synchronized with visual state.
- Each reaction has a specific label, such as “React with Insightful.”
- Tab reaches Comment, React, Move on, and expanded reaction destinations.
- Enter and Space activate buttons; Escape collapses the dock and returns focus to React.
- Number keys 1 through 6 follow the visible order: Insightful, Support, Love, Celebrate, Like, Funny.
- Commit results use an `aria-live` region. Saved feedback must state that the reaction was saved to revisit; it must not imply production persistence.
- The upward drag is optional. The Move on button is the equivalent non-gesture path.

## Figma build notes

Build `Action Dock / state` with `collapsed`, `expanded-tap`, and `expanded-drag` variants. Inside, use horizontal auto layout with:

1. `FAB / Comment`, fixed at 52px
2. `FAB / React`, fixed at 52px or expanded to 264px

Build each reaction as a `Reaction Slot / state` instance. Keep the left-to-right order explicit. Build Move on as a separate button component above the card; do not recreate the removed arc or merge it into the dock.
