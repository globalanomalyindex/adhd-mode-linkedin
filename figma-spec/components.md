# ADHD Mode Component Specifications

Specifications for the components that compose every screen. Organized atomic to molecular to organism. Use these to build the Figma component library.

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

### Button, Primary
**Auto layout:** horizontal, 24h x 10v padding.
**Background:** `color.brand` to `color.brand-hover` on hover.
**Text:** 15/600/white.
**Radius:** `radius.pill`.
**Effect:** translateY(-1px) and shadow `0 4 12 0 rgba(10,102,194,0.25)` on hover.
**Variants:** Default, Hover, Pressed, Disabled.

### Button, Text
**Auto layout:** horizontal, 4h x 8v padding.
**Text:** 14/600/`color.brand`.
**Underline:** 1px underline expands from left on hover (animated; in Figma, document as a hover-state property).
**Variants:** Default, Hover, Pressed.

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
- Like and Funny: `color.hairline` (no resurface tint)

### Stat cell
**Auto layout:** vertical, 22v x 12h padding, center-aligned.
**Top:** number, 28/600/tabular-nums/`color.text`.
**Bottom:** label, 13/400/`color.text-secondary`, 6px margin-top.
**Border:** right 1px `color.hairline` (last child no border).

### Tag
The "TL;DR" pill, the "Promoted" pill, etc.
**Auto layout:** horizontal, 8h x 3v padding.
**Background:** `#eef3f8` for TL;DR (LinkedIn-blue tint), `color.react-insightful` for Promoted.
**Text:** 10/600/letter-spacing 0.05em/uppercase.
**Radius:** `radius.sm` (4).

## Organism

### Card, Post (active session)
**Auto layout:** vertical, 22 inner padding, gap 14, fill `color.card`, radius `radius.lg` (12), shadow `shadow`.
**Composition:**
1. Author row (avatar 40 + name/role stack)
2. Optional TL;DR pill
3. Post content (body 14/400/`color.text`)
4. Optional progress pips (4px height, evenly spaced, filled to `pageIndex+1`)
5. Optional page label (tiny 11/400/`color.text-tertiary`)

**States:** Idle, Dragging (shadow upgrades to `shadow-drag`, cursor grabbing), Exiting (translate-Y 80, scale 0.9, opacity 0 over `duration.base` `easing.out`).

### Reaction tray
**Position:** absolute bottom: 14, left/right: 16.
**Background:** `color.card`, radius 22, padding 10v x 6h, shadow `0 2 10 0 rgba(0,0,0,0.06)`.
**Layout:** flex, justify-content space-around, align center.
**Contents:** six Reaction icons.

### Skip arc
**Position:** absolute top: 56, centered horizontally.
**Idle state:** 160w x 24h, gradient `linear(to-bottom, rgba(0,0,0,0.04), transparent)`, radius `0 0 200 200`.
**Active state:** 320w x 110h, radial gradient ellipse, plus a "Moved on" badge (background `color.skip-grey`, text white 12/600).
**Transitions:** width, height, background over `duration.base` `easing.out`.

### Session topbar
**Auto layout:** horizontal, 12v x 16h padding, justify space-between.
**Background:** `color.card`, bottom border 1px `color.hairline`.
**Left:** mode marker (6px brand dot, "Focus" label 13/600, " · Ended" or session state 13/400/`color.text-secondary`).
**Right:** meta cluster, time remaining (tabular-nums), card progress (1/12), queue counter (↻ 3), 12px gaps, `color.text-tertiary`.

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
