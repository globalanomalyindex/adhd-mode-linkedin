# Screen Specifications

One frame per screen. Each spec lists artboard size, composition, and key spacing.

## Screen 1: Entry point

**Artboard:** Mobile 390 x 844.
**Reference HTML:** `screens/entry-point.html`.

**Composition (top to bottom, 8px gaps between cards):**
1. LinkedIn nav stripe, 32x32 logo, search field flex.
2. **ADHD Mode entry card**, 44x44 brand-gradient mark + name/desc stack + Primary Button "Begin", inside `surface-card` with 24 padding.
3. Two sample feed posts, author row + body excerpt.

**Notes:** the ADHD Mode entry card sits second in the feed (right after nav), not as a banner. Calm, discoverable, not loud.

## Screen 2: Session setup

**Artboard:** Mobile 390 x 844 with centered modal.
**Reference HTML:** `screens/session-setup.html`.

**Composition (modal card, 480 max-width on desktop, full-bleed on mobile):**
1. Title "Start a focus session" (display 32).
2. Subtitle (small 13/`color.text-secondary`).
3. Mode group label "MODE" (meta 12/`color.text-secondary`/uppercase).
4. Mode picker, two tiles side-by-side (`Setup mode tile` component).
5. Length group label "LENGTH".
6. Duration picker, three pills (`Duration pill` component).
7. Actions row, text "Cancel" left, Primary "Begin" right.

**Padding:** 32 top, 24 sides, 24 bottom.

## Screen 3: Focus session, card view

**Artboard:** Mobile 390 x 844, full-bleed inside the LinkedIn shell.
**Reference HTML:** `prototype/index.html` (the `.session` element).

**Composition:**
1. Session topbar (12v x 16h padding).
2. Card stage (flex 1) with absolute children:
   - Skip arc (top 56, centered, idle dim variant).
   - Card host (inset 80/16/100/16) containing the Card, Post component.
3. Reaction tray (absolute bottom 14).

**States to mock:** Idle, Dragging up (skip arc active variant + card opacity 0.6), Dragging down with hover on Insightful (Insightful icon scaled 1.8, others scaled 1.0).

## Screen 4: Long-post reflow, TL;DR card

**Artboard:** Same as Screen 3.
**Reference HTML:** the rendered first chunk of post `p1` (Maya Chen) in the prototype.

**Composition:** same as Screen 3 but the Card, Post body shows:
- TL;DR pill (top of body)
- Two-sentence summary in body 14/500 line-height 1.55
- 3-pip progress bar at bottom (first pip filled)
- Page label "Page 1 of 3 · tap to continue"

## Screen 5: Mid-session check-in

**Artboard:** Mobile 390 x 844 with centered modal.
**Reference HTML:** `screens/mid-session-checkin.html`.

**Composition (modal card, 440 max-width):**
1. Progress ring (64x64 SVG, brand stroke filled to `cardsSeen / postCap`).
2. Headline "You've seen 12 posts." (24/600).
3. Subtitle (small 13/`color.text-secondary`).
4. Action stack, Primary "Wrap up" top, Secondary "Keep going for 5 more minutes", Tertiary "Pause and come back later".

**Padding:** 32 top, 24 sides, 24 bottom.

## Screen 6: End-of-session

**Artboard:** Mobile 390 x 844 (mobile) and 1240 x 800 (desktop variant).
**Reference HTML:** `screens/end-of-session.html`.

**Composition:**
1. Header strip, brand dot + "Focus session · Ended" + tabular time "12:00" right-aligned.
2. Hero block, "Done." (display 32/600).
3. Stats strip, three Stat cells with hairline dividers.
4. Coming back section header (meta 12/`color.text-secondary`/uppercase).
5. Three resurface queue items, emoji avatar + author/snippet stack + ambient "when".
6. Actions row, text "Start another session" left, Primary "Close LinkedIn" right.

**Padding:** 32 top, 24 sides, 24 bottom. Card max-width 560 on desktop.

## Screen 7: Case-study artifact, annotated "before" feed

**Artboard:** Wider (1280x900) for the case-study presentation context.
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
