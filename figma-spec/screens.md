# Screen Specifications

One frame per screen. Each frame must carry an evidence note so a static concept cannot be mistaken for a built or validated behavior.

## Evidence labels

- **Built interaction study:** usable in `prototype/demo.html`.
- **Tested standalone logic:** covered in `lib/`, but not necessarily connected to the study.
- **Static concept:** a presentation screen in `screens/`, not a working flow.
- **Proposed production behavior:** not implemented, persisted, or integrated with LinkedIn.

No frame represents participant validation. The analytics artifacts are synthetic measurement rehearsal, not observed outcomes.

## Screen 1 · Entry point

**Status:** Static concept

**Artboard:** Mobile 390×844

**Reference:** `screens/entry-point.html`

### Composition

1. LinkedIn navigation stripe with 32×32 logo and flexible search field.
2. ADHD Mode entry card with 44×44 mark, name and description, and Begin button.
3. Two sample feed posts.

The entry sits after navigation as a calm feed card, not a takeover banner. Label it as an independent product concept rather than a production LinkedIn feature.

## Screen 2 · Session setup

**Status:** Static concept; duration and cap mapping is tested standalone logic

**Artboard:** Mobile 390×844 with centered modal

**Reference:** `screens/session-setup.html`

### Composition

1. “Start a focus session” title.
2. One-sentence explanation that the session ends at the first bound reached.
3. Mode label and Focus/Re-engage tiles.
4. Length label and three duration controls.
5. Explicit dual-bound note.
6. Cancel and Begin actions.

### Duration choices

| Visible label | Time bound | Post cap |
|---|---:|---:|
| 5 min · up to 8 posts | 5 minutes | 8 |
| 12 min · up to 15 posts | 12 minutes | 15 |
| 20 min · up to 25 posts | 20 minutes | 25 |

Both limits must be visible before Begin. Focus and Re-engage remain hypotheses about pacing and density, not validated outcomes.

**Modal padding:** 32px top, 24px sides, 24px bottom.

## Screen 3 · Action Dock interaction study

**Status:** Built interaction study

**Artboard:** Mobile 390×844, full bleed inside the LinkedIn shell

**Reference:** `prototype/demo.html`

### Composition

1. Static session topbar with mode, sample-post progress, and local saved count.
2. Card stage:
   - real top-center Move on button
   - centered Post card
   - user-selected comment preview
3. Action Dock:
   - Comment button at left
   - React button at right
   - expanded order, left to right: Insightful, Support, Love, Celebrate, Like, Funny

### States to mock

- Resting: Move on, Comment, and React controls visible; no ambient pulse or card wobble.
- React expanded by tap: six reaction buttons visible in the canonical visual order.
- Dragging down: nearest reaction magnifies as pointer proximity changes.
- Dragging up: Move on button arms as feedback for the same action available by tap.
- Comment preview changed through a user-selected dot; never auto-rotating.

This frame demonstrates the Action Dock interaction only. Its sample-post counter is not the bounded-session reducer, and its local saved count is not a persistent production queue.

## Screen 4 · Long-post reflow

**Status:** Tested standalone logic with a concept presentation; not wired into the Action Dock study

**Behavior reference:** `lib/reflow.js`

Use the Screen 3 shell and current Action Dock. Do not copy controls from the older `prototype/index.html` harness.

### Card composition

- TL;DR tag
- first-paragraph summary stub, clearly labeled as prototype behavior
- paged body chunk
- progress pips
- “Page 1 of N · tap to continue” label

The current summary is a deterministic first-paragraph stub, not an LLM summary or evidence of production content processing.

## Screen 5 · Single midpoint checkpoint

**Status:** Static concept; one-checkpoint reducer rule is tested standalone logic

**Artboard:** Mobile 390×844 with centered modal

**Reference:** `screens/mid-session-checkin.html`

### Trigger

The checkpoint appears once, at the rounded-up midpoint of the selected post cap:

| Preset | Checkpoint copy |
|---|---|
| 5 minutes / 8 posts | 4 posts in |
| 12 minutes / 15 posts | 8 posts in |
| 20 minutes / 25 posts | 13 posts in |

For the standard concept frame, use `8/15`. Any earlier `6/15` reference is stale.

### Composition

1. 64×64 progress ring bound to the real midpoint count.
2. Count and approximate time remaining.
3. “Halfway through” explanation.
4. Optional grounding prompt.
5. Keep going, Wrap up now, and Pause and come back later actions.

Continuing returns to the session and cannot immediately show the checkpoint again. The time or post cap still ends the session, whichever comes first.

**Modal padding:** 32px top, 24px sides, 24px bottom.

## Screen 6 · Session closure

**Status:** Static concept backed by tested standalone scheduling rules

**Artboard:** Mobile 390×844 and desktop 1240×800

**Reference:** `screens/end-of-session.html`

### Composition

1. Header strip with mode, Ended state, and elapsed time.
2. Calm summary such as “11 posts. 12 minutes. 2 saved to revisit.”
3. Stats for posts seen, reactions, and saved items.
4. “Coming back” preview with authored 3/7/14-day defaults where applicable.
5. Back to my feed and See what I saved actions.

The closure settles after entry. Do not pulse the ended marker or loop count-up motion. Under reduced motion, values appear immediately.

The Coming back list is a static concept informed by standalone scheduling logic. The following remain proposed production requirements, not built controls:

- explicit opt-in
- pause and resume
- delete one or all saved items
- retention and privacy settings
- duplicate handling and recovery
- persistence and LinkedIn permissions

## Screen 7 · Attention-cost comparison

**Status:** Static case-study artifact

**Artboard:** 1280×900

**Reference:** `screens/before-feed-annotated.html`

### Composition

- Left: phone frame showing the existing-feed condition.
- Overlaid: numbered annotations tied to observable interface costs.
- Right: a concise legend mapping each annotation to the bounded-session response.
- Header: product thesis, not a selective-attention test of the reviewer.

Avoid diagnosing the viewer or treating a visual trick as participant evidence. This frame is product reasoning, not research data.

## Screen 8 · Evidence anatomy

**Status:** Portfolio documentation

Use a four-row modular frame to make the implementation boundary legible:

1. Built Action Dock interaction study
2. Tested standalone session, gesture, scheduler, queue, and reflow logic
3. Static setup, checkpoint, closure, and annotated-feed concepts
4. Proposed production queue controls and integration

This frame is the handoff counterpart to the repository evidence ladder. Keep synthetic analytics in a separate, explicitly labeled module.

## Quiet motion specification

Only user-triggered or state-triggered transitions move:

| Transition | Duration | Easing | Notes |
|---|---:|---|---|
| Card follows drag | direct | pointer-linked | no motion at rest |
| Drag classification feedback | up to 240ms | in-out | follows real threshold change |
| Action Dock expand | 320 to 400ms | gentle spring | starts on tap or react-zone entry |
| Reaction magnification | up to 180ms | gentle spring | follows proximity |
| Reaction or skip commit | up to 240ms | out | ends in a stable next state |
| Checkpoint or closure enter | up to 240ms | out | one-time state transition |
| Button response | 120 to 150ms | out | direct feedback |

Do not specify ambient status pulses, idle wobble, auto-rotating comments, looping end states, or decorative scanning effects. Reduced motion removes transforms and stagger while preserving destination state and meaning.
