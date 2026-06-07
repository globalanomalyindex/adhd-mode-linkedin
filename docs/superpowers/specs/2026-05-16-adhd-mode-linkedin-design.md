# ADHD Mode for LinkedIn

A research-grounded Focus Session experience embedded inside LinkedIn's existing surface, designed for people with ADHD and Cognitive Disengagement Syndrome (CDS).

**Designer:** Chris Fiore
**Date:** 2026-05-16
**Status:** Design specification, ready for implementation planning
**Audience for this document:** the designer (review), and through them, future hiring reviewers (Disney Streaming Principal Product Designer track and equivalent FAANG roles)

---

## 0. Executive summary

LinkedIn and its peers publicly commit to caring about user wellbeing. ADHD Mode is what that promise looks like when it is designed seriously: a bounded Focus Session, embedded inside LinkedIn's native surface, that reshapes the feed around how ADHD and CDS cognition actually works.

The mode is built around three load-bearing ideas:

1. **Bounded sessions instead of infinite scroll.** The user enters a Focus Session of a chosen length. The session has a post cap, a visible time box, and ends with a closure ritual. Time blindness, hyperfocus collapse, and the "where did 45 minutes go" failure mode are addressed by external structure rather than user willpower.

2. **LinkedIn reactions as a personal spaced-repetition layer.** Three of LinkedIn's six native reactions (Insightful, Support, Love) schedule the post into a private resurface queue that brings it back at research-supported intervals. The same tap that fires the normal LinkedIn social signal also routes the user's future attention. The shipped mechanic is reaction-seeded fixed spaced intervals: a qualifying reaction seeds the post and the scheduler advances it on a fixed widening curve, deterministically and inspectably. The research build evolves that scheduler toward SM-2 (grade-driven ease factors adjusted by a recall probe at the second touch); see Section 11. Spaced learning built from primitives users already know.

3. **A vertical gesture grammar that respects scroll muscle memory.** Swipe up to skip (private, no signal), swipe down to react (default Like), drift sideways to pick a richer reaction with magnification on hover (Fitts's Law applied). Long posts are reflowed into chunked, paged cards with a TL;DR-first opening, defusing the wall-of-text and sunk-cost traps.

Two sub-modes (Focus for ADHD-C/H days, Re-engage for CDS days) adjust pacing, density, and comprehension scaffolds based on the cognitive profile the user is bringing to the session.

**Deliverables for this portfolio piece:**

- A working interactive prototype in HTML/CSS/JS demonstrating the full focus mode end-to-end (real drag physics, magnification, gesture commits)
- A typed React component for the production-track Action Dock (`react/`), with co-located tests, so the interaction reads as buildable rather than as a one-off demo
- A Python capability-analytics pipeline (`analytics/`) that defines the typed event schema, generates a synthetic event stream, and computes the Tier 1 capability metrics from it
- Figma-ready specification (component definitions, design tokens in W3C-compatible JSON, frame-by-frame specs for handoff)
- Case study writeup with cited research, before/after analysis, and a "Pattern, Not Just a Feature" generalization argument extending to streaming surfaces

---

## 1. Problem

### 1.1. The wellbeing-promise gap

Major social platforms have made public commitments to user wellbeing. Instagram's "Take a Break," screen-time tools across iOS and Android, LinkedIn's own member-wellbeing pages. These commitments exist alongside product surfaces optimized for indefinite engagement: infinite scroll, autoplay, notification badges that escalate to "99+", algorithmically novel content, and reaction counts that anchor judgment before evaluation.

For users with attention-typical cognition the gap is uncomfortable. For users with ADHD or CDS it is exclusionary. These users are required to use LinkedIn for professional reasons (job search, network maintenance, industry awareness) and are then confronted with a surface that is structurally hostile to how their attention works.

ADHD Mode is the credible version of the wellbeing promise. Not an attack on the business model, not a competing app, not a punishing time-limit tool. A feature that says: when you need to use this platform with your kind of brain, here is a way to do that without the bottom falling out.

### 1.2. The selective-attention argument

The case study opens with an experiential argument. The reviewer is shown a busy LinkedIn home feed for 5 seconds and then asked targeted recall questions: how many posts mentioned hiring, what color was the second profile photo, did you see the layoff post. Most reviewers, regardless of cognitive profile, fail at most of these questions.

This is not a clever trick. It is a clean demonstration that the cognitive load of a feed surface is high enough that attention-typical users routinely miss what they're looking at. For ADHD and CDS users, that load is the baseline experience every time they open the app. The annotated "before" feed labels nine specific cost vectors on a single screen.

### 1.3. Why LinkedIn specifically

A pointed surface choice for the portfolio piece. LinkedIn is a professional context (users have to use it, raising the wellbeing stakes), it is a feed (so the design pattern generalizes), and it has six reactions plus existing post-NLP infrastructure that the spec leans on. The narrative also resists the easy criticism that this is just designing for casual social media; the work has to function inside professional use.

---

## 2. Goals and success criteria

### 2.1. Primary outcomes

**For the user (ADHD or CDS):**
- Complete intentional, bounded sessions with the app instead of unintentional scroll spirals
- Retain meaningful content (not just engagement metrics) via spaced resurfacing
- Leave LinkedIn at the end of a session without rumination or post-session regret

**For LinkedIn (the imaginary product team):**
- Increase return rate among users who currently overscroll-and-bounce
- Improve dwell quality (engagement with content, not just time on app) within the ADHD Mode segment
- Generate a defensible accessibility and wellbeing artifact

**For the case study (the actual goal):**
- Demonstrate Principal-level product thinking across research, interaction craft, motion, system thinking, and business framing
- Show ability to work within an existing product surface rather than greenfielding a new app

### 2.2. Hypotheses to test (post-launch)

| Hypothesis | Signal |
|---|---|
| ADHD Mode opt-in users will exhibit higher 7-day return rate than a matched control | Cohort retention analysis |
| Resurface queue items will receive higher second-touch engagement than fresh feed items at equivalent positions | A/B comparison of CTR and dwell on resurfaced vs new |
| Session length distributions will cluster near the chosen cap, not at the runtime ceiling | Session-length histogram |
| Re-engage mode (CDS users) will show longer per-card dwell time than Focus mode | Dwell time by sub-mode |
| Reaction distribution will shift toward Insightful/Support/Love (the three resurface-eligible reactions) inside ADHD Mode versus the default LinkedIn feed | Reaction-mix comparison |

These hypotheses are explicit because the design depends on them being directionally true. If post-launch data refuted them, the design would need rework rather than incremental polish.

Note on framing: the engagement-flavored hypotheses above (7-day return, reaction-mix shift) are guardrails, not success criteria. Section 15 restructures measurement into a capability-first model where these sit underneath the outcome metrics whose only job is to confirm the feature is not draining the business while capability moves.

---

## 3. Research foundation

The design responds to specific findings from cognitive science and human-computer interaction. Each finding below traces to one or more mechanics in Section 7. The audience is not small: adult ADHD prevalence is commonly estimated at 4 to 8 percent of working adults (Kessler et al., 2006, National Comorbidity Survey Replication). That figure carries the business case, so it cites a source rather than a round number.

### 3.1. ADHD (Combined and Hyperactive-Impulsive presentations)

**Delay aversion and time blindness.** People with ADHD systematically under-perceive elapsed time and steer away from delayed reward. Sonuga-Barke (2002) models delay aversion as a motivational style in its own right, distinct from a pure attention deficit. *Mechanic:* visible time box, bounded session length, dopamine routed to in-session micro-completions (the gesture-commit feedback).

**Executive function and working memory load.** Holding multiple items in mind while scrolling overwhelms working memory. Barkley's self-regulation model (the executive-function and working-memory framework, Part II of *ADHD and the Nature of Self-Control*) treats ADHD as a deficit in holding and acting on internally represented information. *Mechanic:* per-post TL;DR, single-decision moments, paged long-post reflow.

**Novelty-seeking and impulse interaction.** Infinite scroll functions as a slot machine for ADHD attention. *Mechanic:* capped post count, no autoload, intentional "continue" choice at the cap, preview-before-commit on every gesture.

**Hyperfocus collapse.** Once attention is captured, time perception disappears entirely. *Mechanic:* end-of-session closure ritual, mid-session check-in at the cap.

### 3.2. Cognitive Disengagement Syndrome (CDS)

CDS, formerly known as Sluggish Cognitive Tempo (SCT), was renamed via expert consensus in 2022 ([Becker et al., JAACAP 2022](https://www.jaacap.org/article/S0890-8567(22)01246-1/fulltext)). It is characterized by excessive daydreaming, mental fog, slowed processing, and hypoactivity, with neurocognitive research showing CDS individuals are "accurate but slow" across attention and executive function tasks ([Mayes et al., PMC10474248](https://pmc.ncbi.nlm.nih.gov/articles/PMC10474248/)).

A marked hypothesis, stated plainly so it is not mistaken for a finding: the Mayes study measured children, not adults. Applying its "accurate but slow" profile to the working adults this design serves is a deliberate generalization, not established science, and it belongs on the list of things to validate (Section 18) before any strong claim rests on it.

**Slowed processing speed.** Content presented at typical density and pace is missed or skimmed past without absorption. *Mechanic:* longer in-card dwell defaults in Re-engage mode, lower visual density, one-post focus.

**Daydreaming and mind-wandering (passive disengagement).** Distinct from active distraction. *Mechanic:* gentle "still with us?" re-engagement prompt after extended dwell-without-action, not a punishing one.

**Comprehension scaffolding helps absorption.** Surfacing the "what is this post saying" question before the content improves retention. *Mechanic:* optional "what you'll find" framer above long posts in Re-engage mode.

### 3.3. Spaced repetition

Established as a memory consolidation strategy since Ebbinghaus mapped the forgetting curve in 1885 ([Ebbinghaus, *Über das Gedächtnis*](https://archive.org/details/berdasgedchtni00ebbiuoft)) and validated extensively in modern learning science. Application to ADHD populations rests on working-memory-load reduction and alignment with shorter attention spans; one of the few ADHD-specific consolidation studies found that scheduling practice well supports procedural memory in this group ([Adi-Japha et al., PMC5540945](https://pmc.ncbi.nlm.nih.gov/articles/PMC5540945/)).

CDS-specific spacing research does not yet exist. The current consensus paper lists ten priority research domains; optimal learning-interval design is not among the active studies. ADHD Mode's Re-engage adaptations therefore target the *encoding phase* (longer dwell, optional in-session re-exposure, pre-card framers) rather than the long-term retention curve. This is marked explicitly as a designer's hypothesis to test, not as established science.

### 3.4. HCI principles applied

**Fitts's Law.** Magnified targets reduce time-to-acquire and error rate (Fitts, 1954). Applied directly to the reaction-tray magnification.

**Hick's Law.** Choice time grows with the number of options (Hick, 1952; extended by Hyman, 1953). This is why the common path carries no decisions and the richer reaction set opens only on demand, rather than presenting all six reactions on every card.

**Preview before commit.** Visible reaction-label preview during swipe gives the user a chance to back out. Addresses ADHD's documented response-inhibition deficit (Barkley, *ADHD and the Nature of Self-Control*, the behavioral-inhibition chapter, Part I, cited separately from the executive-function model in 3.1).

**Effort matched to consequence.** Low-stakes Like is one cheap motion; higher-stakes Insightful (which schedules resurfacing) requires hover and drop. Deliberate cognition is aligned with weightier choices.

**Default-easy, deliberate-rich.** A progressive-disclosure pattern: the common path has no decisions, the rich path opens on demand. Reduces decision-load (Hick's Law, above) without removing capability.

### 3.5. What we are NOT claiming

ADHD Mode is not a medical intervention. It is design that respects how these cognitive profiles work. The framing matters for both the research integrity of the case study and for how the design would need to be positioned legally inside a real platform.

---

## 4. Design principles

The constraints held throughout. Each is a falsifiable test the design must pass.

1. **Embedded, not bolted on.** Every visual, every interaction, every piece of copy reads as something LinkedIn could ship. No competing visual identity. No "wellness app" pastel. LinkedIn-native typography, palette, radius, shadow.
2. **Beauty in simplicity.** If a screen needs more than its data and structure to be understood, the design has failed. No marketing copy on operational screens. Trust the user.
3. **Research-grounded.** Every mechanic traces to either a cited finding, a documented HCI principle, or an explicit designer's hypothesis marked as such. No hand-waving.
4. **Respects the business model.** The design preserves LinkedIn's social signal (reactions fire normally, notifications go out, content reaches authors). It improves engagement quality without attacking engagement quantity.
5. **Respects scroll muscle memory.** Gesture grammar moves in the directions users already move. We do not retrain the body to advance our cause.
6. **Accessible by default.** Every gesture has a tap-based fallback. Motor coordination differences are accommodated. `prefers-reduced-motion` is honored everywhere with meaningful, not degraded, fallbacks.
7. **Closure, not abandonment.** Sessions end with a calm finish, not a "you've been here too long" scold.

---

## 5. Product concept

### 5.1. Focus Session

A bounded interaction container the user enters from LinkedIn's home surface. A session is bounded by BOTH a time box AND a soft post cap, and ends when either bound is reached, whichever comes first. A session has:

- A **chosen length**, set from three setup presets: 5 minutes, 12 minutes, or 20 minutes (user-adjustable)
- A **soft post cap** carried by the chosen preset: 5 minutes caps at 8 posts, 12 minutes caps at 15 posts, 20 minutes caps at 25 posts. Time and post count are independent bounds, not a one-to-one coupling
- A **single visible feed**; messages, notifications, jobs, the right rail, and pull-to-refresh are suppressed
- An **end state** triggered by whichever bound comes first: time, post cap, or user-initiated wrap
- A **closure screen** showing what happened in the session

The session is the unit of intentional engagement. Inside the session, the feed is restructured. Outside the session, LinkedIn behaves normally.

### 5.2. Two sub-modes

Selected at session start.

**Focus** (for ADHD-C/H presentations): tighter pacing, more posts per session, the full gesture grammar with default-easy/deliberate-rich routing. Designed for the "I have energy but it's scattered" state.

**Re-engage** (for CDS presentations): longer per-card dwell, slower paced reveal between cards, optional "what you'll find" framer on long posts, an in-session re-exposure of items the user marked Insightful (one repeat before session end while content is still in working memory), and gentle "still with us?" prompt after extended no-interaction dwell. Designed for the "I'm here but I'm foggy" state.

Sub-modes share the same gesture grammar and the same resurface engine. They differ in pacing parameters, density, and the presence of comprehension scaffolds.

### 5.3. The closure ritual

Every session ends with an end-of-session screen showing:
- Posts seen
- Reactions sent
- Items entering the resurface queue
- Time used
- A primary action that takes the user *out* of LinkedIn, not back into more feed
- A secondary action to start another session if the user genuinely wants more

This screen is the wellbeing artifact. Its restraint and its CTA hierarchy are deliberate design moves grounded in the research on hyperfocus collapse and post-session regret.

---

## 6. System architecture

### 6.1. Screens

1. **Entry point.** A native card on LinkedIn home. Not a hidden setting. Discoverable but not loud. Includes a one-line description and the "Start a focus session" CTA.
2. **Session setup.** Mode chooser (Focus / Re-engage), duration picker with smart default, brief mode descriptions. Minimal chrome.
3. **Focus session card view.** Single-post card. Top bar with mode marker, time remaining, post counter, and resurface counter. Reaction row always visible at bottom. Grey peek-arc at top hints the skip gesture.
4. **Long-post reflow card view.** Same shell, but content is paged with progress dots and a TL;DR opening card. Tap to page.
5. **Mid-session check-in.** Triggered at the cap or midpoint. A calm choice: keep going, wrap early, or pause. The first explicit consent moment to extend the session.
6. **End-of-session summary.** The closure ritual. (Reference implementation: `end-of-session.html` in the project root.)

### 6.2. States and transitions

Session state machine: `entry → setup → active(card→card→...) → checkpoint → active → end → exit`. The user can wrap from any point during `active` or `checkpoint`. The `checkpoint` state only triggers at the cap or midpoint; it never interrupts mid-card.

Per-card state: `presenting → committed (reaction or skip) → exiting → next card presenting`. Per-card animation duration is `var(--d-base)` for the exit and `var(--d-slow)` for the next card's entrance, with a small overlap.

### 6.3. Surfaces in scope

For the portfolio prototype: mobile-first phone-frame demonstration of the active session, end-of-session summary, and entry point. Desktop is a stated scaling target with mockups but is not built interactively.

For LinkedIn proper (if this shipped): web, iOS, Android. The gesture grammar adapts to pointer events on web and touch events on mobile. The reaction row and tap-fallback exist on all surfaces.

---

## 7. Interaction grammar

### 7.1. Gesture mapping (vertical)

The grammar respects scroll muscle memory. Up advances the feed (skip); down is the more deliberate direction (react).

| Input | Action | Visual feedback |
|---|---|---|
| Swipe up | Skip (private, no signal) | Grey peek-arc at top grows, soft pulses, haptic tick at threshold. Card shrinks to ~85% and goes translucent as it lifts. |
| Swipe down | Like (default) | Reaction row brightens; Like icon is pre-magnified in the center. Card descends. |
| Swipe down + drift sideways | Pick richer reaction | Hovered reaction magnifies (Fitts), other reactions dim. Card preview tag updates to show the reaction that will commit. |
| Tap card | Next page of long post | Page advances; progress dot fills. |
| Long-press card | Open static reaction picker (accessibility fallback) | Modal-style picker with all six reactions; no swipe needed. |
| Pull-to-refresh | Disabled in Focus Mode | The cap is the cap; refresh has no semantic. |

### 7.2. The reaction-as-spaced-repetition mapping

Each LinkedIn reaction has dual function inside ADHD Mode: it still fires the normal social signal to the author, and it independently schedules (or doesn't) the post for personal resurfacing.

| Reaction | Social signal | Resurface behavior |
|---|---|---|
| 💡 Insightful | Standard | About 3 days, then a fixed widening interval |
| 🤝 Support | Standard | About 1 week |
| ❤️ Love | Standard | About 2 weeks |
| 🎉 Celebrate | Standard | No feed resurface; surfaces on the user's next visit to that author's profile |
| 👍 Like | Standard | No resurface |
| 😄 Funny | Standard | No resurface |
| *(no reaction / swipe past)* | Nothing | No resurface, no penalty |

Three of the six reactions (Insightful, Support, Love) carry resurfacing weight. The mapping is deliberate: these are the three reactions whose emotional signal most strongly implies "I want to remember this" or "this person matters to me." The shipped scheduler that turns these reactions into intervals is described in Section 11; the short name for it is reaction-seeded fixed spaced intervals, and it is not the SM-2 algorithm.

Resurfacing is **ambient**, not scheduled-visible. The user does not see "this returns Tuesday." A small `↻ 2` indicator in the session top bar quietly grows during a session to show the queue is building (the canonical depicted session ends with 2). The full queue is shown at session end and is browsable from a settings surface, but no resurface item ever announces its arrival.

### 7.3. Reaction commit feedback

Per-reaction micro-animation, each with distinct character. All respect `prefers-reduced-motion` (replaced with a brief opacity flash).

| Reaction | Animation |
|---|---|
| 👍 Like | Bounce + subtle radial pulse |
| 🎉 Celebrate | One-frame confetti micro-burst |
| 🤝 Support | Warm glow + soft rotation |
| ❤️ Love | Heartbeat pulse |
| 💡 Insightful | Lightbulb glow + faint twinkle |
| 😄 Funny | Wiggle + bounce |

---

## 8. Visual language

LinkedIn-native. The design lives inside LinkedIn and reads as something that platform could ship.

### 8.1. Color tokens

```
--bg:             #f4f2ee   /* LinkedIn feed grey */
--card:           #ffffff
--brand:          #0a66c2   /* LinkedIn blue */
--brand-hover:    #004182
--brand-tint:     rgba(10, 102, 194, 0.04)
--text:           rgba(0, 0, 0, 0.9)
--text-secondary: rgba(0, 0, 0, 0.6)
--text-tertiary:  rgba(0, 0, 0, 0.45)
--hairline:       rgba(0, 0, 0, 0.06)
--shadow:         0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)
--shadow-hover:   0 0 0 1px rgba(0,0,0,0.1), 0 6px 16px rgba(0,0,0,0.06)
```

One brand accent, no secondary colors. Every additional color is a tint or alpha of black on the cream background. Reaction emoji carry their inherent color but are the only chromatic elements.

### 8.2. Typography

Primary: **Source Sans 3**, LinkedIn's historical typeface (open source via Google Fonts). Distinctive without being trend-chasing, demonstrably LinkedIn-correct rather than generic.

Headings: 32px / 600 / -0.015em letter-spacing for screen titles. 14-15px / 600 for inline labels and authors. 13px / 400 for body. 12px / 600 / 0.04em letter-spacing / uppercase for small labels.

Numerals: tabular figures for timers and stat counts (avoids width jitter during count-up).

### 8.3. Spacing scale

Base unit: 4px. Common values: 4, 8, 12, 14, 16, 20, 22, 24, 28, 32, 40, 48, 56.

Card padding: 24px horizontal, 14-24px vertical depending on density. Card radius: 8px (matches LinkedIn's current radius). Hairline rules at 1px solid rgba(0,0,0,0.06) for internal divisions.

### 8.4. Iconography

LinkedIn's existing reaction emoji as the primary iconography in the session. No custom icon system introduced; this keeps the design embedded.

---

## 9. Motion system

The motion system applies to every screen. Tokens are defined once and referenced everywhere.

### 9.1. Tokens

```
/* Durations */
--d-fast:    150ms   /* micro: hover, button color shift */
--d-base:    240ms   /* state transition: card → card, reaction commit */
--d-slow:    400ms   /* entrance: card load, headline rise */
--d-page:    600ms   /* multi-element page load, count-ups */

/* Easings */
--ease-out:     cubic-bezier(0.16, 1, 0.3, 1)        /* confident deceleration */
--ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1)         /* state changes */
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1)    /* micro-interactions ONLY */

/* Distances */
--lift-sm:   4px
--lift-md:   8px
--lift-lg:   16px

/* Stagger */
--stagger-tight:  40ms
--stagger-loose:  80ms
```

### 9.2. Behavior rules

**Entrances** use `ease-out` (confident deceleration). Never bouncy at the system level; bounce is stimulating.

**State transitions** use `ease-in-out`. Symmetric curves for symmetric meaning.

**Spring** (gentle overshoot) is reserved exclusively for reaction micro-interactions (the magnify, the heart-pulse, the lightbulb glow). It is the only place where motion is allowed to be a delight rather than a clarification.

**Stagger** is tight (40ms). The editorial 200ms stagger was wrong for in-app; it makes screens feel slow. 40ms reads as deliberate without dragging.

**Sequencing.** One thing at a time. Never multiple competing animations on the same surface.

**Hover and press.** Hover gets 150ms color/lift transitions. Press momentarily collapses the lift, signaling commit.

**`prefers-reduced-motion`.** Every animation has a fallback. Fallback is opacity-only (no transform), not just shortened. The screen still reveals, but it does not move.

### 9.3. Reference implementations

- End-of-session screen: full motion system applied, including count-up on stat numbers, hover spring on queue emoji, status-dot pulse in header. See `end-of-session.html`.

All other screens (entry point, setup, card view, long-post reflow, mid-session check-in) will use the same tokens and rules.

---

## 10. Long-post reflow pipeline

Posts above ~60 words are reflowed into a multi-card structure inside the session. Posts below the threshold render as a single card with no reflow.

### 10.1. Pipeline steps

1. **Detect and classify.** Length threshold. Identify narrative vs listicle vs announcement structure. Identify image/video anchors.
2. **Generate TL;DR.** Two-sentence summary card. Third-person referent ("Maya almost quit her job...") so the summary reads as orientation, not as the author's voice.
3. **Chunk by beat.** Split on narrative beats and paragraph boundaries, not arbitrary word counts. Aim for 2-4 cards per long post.
4. **Visual hierarchy.** Lists become numbered items. Quotes become block elements. Section breaks are preserved.
5. **Re-engage scaffold.** In Re-engage mode only, prepend a "what you'll find" framer to the TL;DR card.

### 10.2. Edge cases

| Case | Handling |
|---|---|
| Short post (< 60 words) | No reflow. Single card. |
| Image / video post | Media anchored to card 1; text reflows on subsequent cards. |
| Listicle | Chunk by list-item groups, max 3 items per card. |
| Quote / repost | Quoted content as a block element. Never split mid-quote. |
| Multilingual / RTL | Inherits LinkedIn's existing handling. |
| Code blocks or technical content | Preserved as-is on their own card; no summarization of code. |

### 10.3. Implementation note

Server-side LLM pipeline, cached per-post. LinkedIn already runs post-NLP for spam, quality, and topic classification; this is one additional pass. Reflow is one-time, not per-view.

---

## 11. The resurface engine

The private layer that makes reactions function as a personal spaced-repetition system.

### 11.1. Storage

Per-user resurface queue: `{post_id, reaction_type, scheduled_for, exposure_count, last_shown}`.

### 11.2. Scheduling logic: what ships, and what the research build adds

The shipped mechanic is **reaction-seeded fixed spaced intervals**. A qualifying reaction seeds the post into the queue, and the scheduler advances it on a fixed widening curve. The same reaction always produces the same schedule, so the curve is deterministic and inspectable: the user can predict and trust what the queue will do. This is deliberately not the SM-2 algorithm; it is the simplest scheduler that does the job.

```
Insightful: initial_interval = 3 days, multiplier = 2.5
Support:    initial_interval = 7 days, multiplier = 2.0
Love:       initial_interval = 14 days, multiplier = 1.5
Celebrate:  no feed schedule; surfaces in profile-visit context
```

After each resurface exposure, the next interval is `last_interval × multiplier`. Items reaching `exposure_count = 4` are retired from the queue.

The **research build** evolves the scheduler toward **SM-2**, where grade-driven ease factors stretch or compress each interval instead of applying a fixed multiplier. The grade comes from a short recall probe at the second touch: the user states the post's core claim before it is re-shown. That probe does double duty. It tunes the spacing, and it yields a capability signal (recall accuracy on resurfaced posts versus a non-resurfaced control, the Tier 1 metric in Section 15). The shipped version trades that signal away for simplicity and trust; the research version buys it back. The honest framing throughout is that the shipped mechanic is reaction-seeded fixed spaced intervals and SM-2 is the evolution, not the thing that ships.

### 11.3. Surfacing

During a future session, the feed source is a blend of:
- Fresh posts from the user's normal LinkedIn feed
- Due resurface items (posts where `scheduled_for <= now`)

Mix ratio defaults to 70% fresh / 30% resurface, adjustable. The user cannot distinguish in the moment which is which; that's the point. Past attention curates present attention.

### 11.4. User control

A settings surface (outside the session) exposes:
- The current queue with author, post, scheduled date (here visible to the user, unlike in-session where it is ambient)
- Pause / clear queue
- Adjust mix ratio
- Opt out of resurface entirely (Reactions still fire normally; nothing schedules)

### 11.5. The AI boundary

The mode uses a model in a few narrow places, and the line around it is drawn on purpose. The stance, stated once:

> AI orients and scaffolds. It does not decide what you re-see, and it never optimizes for time on app.

The scheduling that gives the feature its point stays deterministic and user-owned, so the parts a person needs to trust are the parts a person can inspect.

**AI may:**
- Generate the per-post TL;DR for long posts (an LLM call in production; an honest stub in the prototype's `lib/reflow.js`).
- Power the optional recall and comprehension probes in the research build, writing the question and grading the free-text answer.
- Draft an optional reflection prompt at closure, which the user can ignore or edit.

**AI must not:**
- Choose what resurfaces. That is driven by the user's own reactions, deterministically and transparently (Section 11.2), and the queue is always visible and editable.
- Rank or curate the feed for engagement. The session keeps native chronological or the user's existing feed order and adds no engagement-optimizing ranker.
- Set or nudge session length. The user sets the bound.

This is not an AI persona bolted onto the product; it is the same honest-judgment framing that runs through the rest of the design, applied to the one place where a model touches the experience.

---

## 12. Accessibility

Beyond the gesture fallback already specified.

### 12.1. Motor accommodations

ADHD has documented comorbidity with motor coordination differences including DCD/dyspraxia. The long-press fallback to a static reaction picker exists for this. The picker is keyboard-navigable; reactions can be triggered by 1-6 number keys when the picker is open.

### 12.2. Visual accommodations

Contrast meets WCAG AA at all type sizes used (body text against cream background at >7:1, secondary text >4.5:1). The grey peek-arc for the skip gesture has a stronger high-contrast mode variant that increases opacity from 12% to 24%.

### 12.3. Screen readers

Card content is read in linear order: author, role, post content, page-of-pages indicator, available actions. Gesture state changes are announced via ARIA live regions ("Marked Maya Chen's post Insightful. Saved to resurface."). The resurface confirmation is count-agnostic by design, so the announcement never contradicts the live queue total.

### 12.4. Motion

`prefers-reduced-motion` collapses all animation duration to 0.01ms but preserves the meaningful structural reveals via opacity-only transitions. Reactions still confirm; they just confirm via instant color shift instead of bounce.

### 12.5. Cognitive accommodations

The entire design is itself a cognitive accommodation. Specifically: TL;DR-first reading, paged chunking, decision-point reduction, external time structure, closure rituals, and the Re-engage sub-mode's slower defaults and comprehension scaffolds.

---

## 13. Decisions and trade-offs

The major design moves, each as a decision with the alternatives considered and why they were rejected.

### 13.1. Why a session container instead of an always-on mode

**Considered:** an "ADHD-aware feed" toggle that, when enabled, reshapes every feed view continuously. No session boundary.

**Rejected because:** the closure ritual is the wellbeing payload. Without a session boundary there is no end-of-session screen, no "you spent your attention intentionally" affordance, no defense against hyperfocus collapse. The always-on version solves sensory load but not time blindness.

### 13.2. Why vertical gesture grammar instead of horizontal (Tinder-style)

**Considered:** horizontal swipe (right = react, left = skip). Cleaner physical metaphor in isolation.

**Rejected because:** horizontal breaks scroll muscle memory. Every LinkedIn user, Instagram user, X user, TikTok user moves their thumb vertically through feeds. Overriding that motion taxes the exact executive function we're trying to preserve. Vertical preserves the automatized motor pattern.

### 13.3. Why reactions-as-spaced-repetition instead of a separate "save for later" button

**Considered:** keep reactions as social signal only; add a separate bookmark/save action that builds the resurface queue.

**Rejected because:** a separate action doubles the cognitive load of every post (react AND bookmark separately). The integrated mapping uses the user's existing emotional response as the scheduling signal, which is both more natural and more accurate (Insightful is a better predictor of "I want to remember this" than a deliberate bookmark tap).

### 13.4. Why a fixed reaction arc instead of a rotating wheel

**Considered:** a rotating/cycling reaction picker that spins to bring different reactions under the thumb.

**Rejected because:** a wheel hides options (poor discoverability) and adds a learned skill (how to spin it) that breaks the muscle-memory principle. A fixed visible arc keeps all six reactions on display, and the magnification animation provides the alive, kinetic feeling without sacrificing learnability.

### 13.5. Why "ambient" resurfacing instead of scheduled-visible

**Considered:** show users "this comes back Tuesday" with countdowns, calendar integration, etc.

**Rejected because:** the visible schedule turns the queue into a to-do list, which is exactly the cognitive load this design is trying to reduce. Ambient resurfacing trusts the system; the user notices "oh, this is back" with mild surprise. The full queue is browsable in settings for users who want explicit control.

### 13.6. Why "Done." instead of a longer celebration

**Considered:** "Great session!", "You did it!", a checkmark animation, a confetti burst.

**Rejected because:** the closure ritual's job is to give permission to leave, not to celebrate engagement. A celebration screen reproduces the engagement-loop psychology the rest of the design is structured against. "Done." is declarative, complete, and exits the user gracefully.

---

## 14. Stakeholder framing

How this is pitched internally to a product team for buy-in.

**To product leadership:** ADHD Mode is an accessibility and wellbeing artifact that opens a new segment of professional users (adult ADHD prevalence is estimated at 4 to 8 percent of working adults, per Kessler et al., 2006; CDS prevalence estimates are still emerging but appear comparable). It strengthens LinkedIn's wellbeing posture against regulatory and PR pressure without changing the underlying business model.

**To engineering:** the bulk of the work is a session-state machine, a server-side reflow LLM pass (additive to existing post-NLP), and a private resurface queue. No changes to the core feed-ranking algorithm. Reaction infrastructure is unchanged; we add a parallel scheduling table.

**To business:** the design *preserves* every revenue-relevant signal. Reactions still fire. Notifications still go out. Authors still receive engagement. The hypothesis is that engagement quality (return rate, dwell quality) goes up among the ADHD Mode cohort, with no degradation among users who do not opt in.

**To legal:** the design carefully avoids medical-intervention framing. Internal copy and external communications describe it as "designed for users with attention differences" rather than as treatment.

**To accessibility leadership:** the design ships with screen-reader support, motor accommodations, contrast at WCAG AA, and `prefers-reduced-motion` compliance. The case study includes the WCAG audit.

---

## 15. What we'd measure

Most feed features get this backwards: they pick an engagement number as the success metric, then call any lift a win. Here the order is inverted on purpose. Capability and outcome come first; engagement sits underneath as a guardrail; three counter-metrics are wired to fail loudly if the design is doing harm.

State it plainly: engagement metrics here are guardrails, not success criteria. They confirm the feature is not draining the business while capability moves; they do not get to declare it a success. The typed event schema and the metric computations live in `analytics/` (Section 19.3).

### 15.1. Tier 1, capability and outcome (PRIMARY, the success criteria)

These define what "working" means. If they do not move, the feature has not earned its place, however good the engagement chart looks.

| Metric | Instrument | Build |
|---|---|---|
| **Resurfaced-content recall.** When a saved post resurfaces, an optional unprompted recall probe asks the user to state its core claim before it is re-shown. Recall accuracy on resurfaced posts versus a non-resurfaced control. | `recall_probe.correct` against a control cohort | Research build |
| **Comprehension after reflow.** A one-question comprehension probe after a long post shown TL;DR-first versus the same post shown full-text-first. Comprehension-accuracy delta between the two orderings. | probe result keyed on reflow ordering | Research build |
| **Intentional completion rate.** Share of sessions ended by the user's closure ritual or by the time or post bound, versus sessions abandoned by leaving the app mid-session. A proxy for agency and self-regulation. | `session_wrapped.reason` (`user_closed` / `timebox` / `postcap` versus `abandoned`) | Ships |
| **Settledness delta.** A single self-report item before and after the session, "Right now I feel scattered" to "Right now I feel settled", on a 1-to-5 scale. Mean shift across the session. | `session_wrapped.settledness_delta` | Ships |

### 15.2. Tier 2, engagement (GUARDRAILS, must not be the success criteria)

Opt-in rate, 7-day return, reaction-mix shift, and resurface acceptance rate. Their only job is to confirm the capability metrics are not moving at the cost of the business. They are watched, not optimized. If they stay flat or improve while capability moves, the mode pays for itself; if capability does not move, the design needs rework rather than incremental polish.

### 15.3. Harm counter-metrics (these must fail loudly)

If any of these rises, the design is doing damage and needs rework, not polish.

- **Compulsive re-entry.** Rate of starting another session within two minutes of a closure. Signals the bound became a binge enabler rather than a stop.
- **Resurface anxiety.** Resurface-queue opt-out rate plus dismiss-without-view rate on resurfaced items. Signals the queue became a guilt backlog.
- **Rumination increase.** Share of users whose settledness delta runs the wrong way, more scattered after the session than before. Signals the session is leaving people worse than it found them.

Each Tier 1 and Tier 2 metric still maps to a hypothesis from Section 2.2. If a hypothesis is refuted, the corresponding design move is reconsidered.

---

## 16. Pattern, not just a feature

The deeper claim worth making in the case study. ADHD Mode is composed of three reusable design primitives that any feed-style surface could adopt:

1. **The bounded session container with a closure ritual.** Applies anywhere infinite content meets time-blind users.
2. **Existing-reaction-primitives as a private attention-scheduling layer.** Applies to any platform with reactions, likes, or saves.
3. **The vertical gesture grammar with magnification.** Applies to any card-based interface where users currently react via tap.

These are the *patterns*. ADHD Mode for LinkedIn is one instantiation. The case study's "Pattern, Not Just a Feature" section argues for treating these as portable design primitives.

---

## 17. How this generalizes (Disney Streaming relevance)

Streaming surfaces have most of the same attention failure modes as social feeds: autoplay-next, infinite suggested content, episode binging, the "I have no idea what I just watched" effect. The ADHD Mode pattern translates directly.

**Disney+ session container:** bounded viewing session with a chosen length. After session end, autoplay-next is suppressed and a closure screen shows what was watched and what's queued for a future session.

**Reactions-as-spaced-repetition for content:** a "this stuck with me" reaction on Disney+ episodes that brings the episode (or related content) back in 1-2 weeks. Applies particularly well to documentary content and to kids' educational programming.

**Vertical gesture grammar for content browsing:** swipe up to skip a suggested title, swipe down to add to a personal queue with magnification picking the queue type (Watch later, Watch with kids, Save for binge weekend, etc.).

The case study includes a short "How This Generalizes" beat naming these adaptations. This is the move that converts "LinkedIn case study" into "I think about platform-level attention problems."

---

## 18. Open questions and limitations

Honest acknowledgments.

- **CDS spacing intervals.** No empirical research exists for optimal long-term spacing in CDS populations. The current design uses the same long-term curve as Focus mode and adapts only the encoding phase. This is a stated designer's hypothesis.
- **Reaction-mix authenticity.** If most ADHD Mode users gravitate to Insightful for everything (because it's the most rewarding visually), the resurface queue would over-trigger and lose its spacing benefit. Mitigations: the queue cap (4 exposures) and the secondary metric of resurface acceptance rate. Worth A/B testing the mix-ratio defaults.
- **Sub-mode selection friction.** Asking users to self-classify ("am I Focus today, or Re-engage?") puts cognitive load up front. Worth testing a "smart default" that uses prior-session signals to suggest a mode.
- **LinkedIn-only validity.** The design is sharp for LinkedIn specifically. The "Pattern, Not Just a Feature" generalization argument is partly speculative. Validation would require building the same primitives inside a different surface (one of the Disney generalizations) and observing whether the same mechanics still hold.
- **Cultural variation.** ADHD/CDS diagnostic patterns, working-norm expectations, and reaction semantics vary by culture. The design has been spec'd for a US-English LinkedIn experience. Localization work is out of scope for this portfolio piece.

---

## 19. Deliverables scope

The artifacts that ship together.

### 19.1. Working interactive prototype (HTML/CSS/JS)

A single-file or small multi-file project demonstrating the actual focus mode end-to-end:

- Mock LinkedIn home with ADHD Mode entry point
- Session setup screen
- Active session with real drag physics (vertical swipe up to skip, swipe down to react, drift sideways for richer reactions with hover magnification)
- Long-post reflow with paged TL;DR
- Mid-session check-in
- End-of-session summary

Touch events on mobile, pointer events on desktop. Single page, no build step required. Opens in a browser, works immediately. Demonstrates Principal-level interaction craft in a way Figma cannot.

### 19.2. Typed React component (`react/`)

The Action Dock rebuilt as a production-track, typed React component (`react/ActionDock.tsx`) with its own stylesheet, a barrel export, and co-located tests (`react/ActionDock.test.tsx`). It takes the dock from "a vanilla-JS demo" to "a component an engineer could drop into a real codebase," with typed props, the reaction union from the shared lib contract, and the accessibility behavior (tap fallback, `aria-live` resurface announcement) covered by tests. This is the artifact that proves the interaction is buildable, not only demonstrable.

### 19.3. Python capability-analytics pipeline (`analytics/`)

A small Python pipeline that makes the Section 15 measurement model concrete:

- `event_schema.py`: the typed event taxonomy (the discriminated union of `session_started`, `card_seen`, `reaction_committed`, `checkpoint_shown`, `recall_probe`, `session_wrapped`, and the rest), matching the TypeScript types field-for-field.
- `generate_events.py`: a synthetic event-stream generator that emits a labelled JSONL log for a population of sessions.
- `capability_metrics.py`: computes the Tier 1 capability metrics (resurfaced-content recall, comprehension-after-reflow delta, intentional completion rate, settledness delta) and the harm counter-metrics from the event stream, with figures written to `analytics/figures/`.

Every number this pipeline produces is from synthetic data and is labelled as such; the pipeline exists to show the measurement is wired end-to-end, not to assert a result.

### 19.4. Figma-ready specification

A package suitable for handing off to a designer who would build the Figma file:

- Design tokens in W3C Design Tokens Format Module JSON, importable into Figma via the Tokens Studio plugin
- Component specifications (atomic, molecular, organism) for every reusable UI element
- Frame-by-frame screen specs for the six screens in Section 6.1
- Motion specifications (the table from Section 9, with state diagrams for the key transitions)
- The token CSS file as a parallel reference

The designer rebuilding this in Figma should be able to do so without making subjective interpretation calls.

### 19.5. Case study writeup

The narrative artifact that ties everything together for the portfolio reviewer:

1. Executive summary (one page)
2. The hook (selective-attention demo embedded interactively)
3. The problem (wellbeing-promise gap)
4. The research (ADHD vs CDS, with citations)
5. The before (annotated feed with nine cost vectors)
6. The design principles (the seven from Section 4)
7. The product walkthrough (six screens with rationale)
8. Sub-modes side-by-side (Focus vs Re-engage on the same post)
9. The long-post reflow mechanic deep-dive
10. The reactions-as-spaced-repetition deep-dive
11. The credible-version-of-the-wellbeing-promise argument
12. What I'd measure
13. Pattern, not just a feature
14. How this generalizes (Disney Streaming applicability)
15. Open questions and limitations
16. References

Written in the same plain, confident voice as this spec. No marketing copy. No em dashes. Cited where citable.

### 19.6. Out of scope for this portfolio piece

- Real LinkedIn engineering integration (this is a designer's prototype, not a real implementation)
- The settings surface for the resurface queue (described but not built)
- The opted-out / queue-paused states (described but not built)
- Localization, RTL adaptations, internationalization
- A11y audit beyond WCAG 2.1 AA spot-checks
- Performance testing of the LLM reflow pipeline
- Native mobile builds (iOS/Android Figma frames noted but not produced)

---

## 20. Implementation phasing (high-level; full plan via writing-plans skill)

The implementation plan, produced separately, will phase the work as roughly:

1. **Design system foundation.** Tokens in CSS and W3C JSON. Type/color/spacing/motion as reusable variables. The end-of-session screen as the canonical reference.
2. **Component scaffolding.** Card, reaction row, button system, modal, top bar. Built once, reused across screens.
3. **Static screens (production fidelity).** Entry point, setup, mid-session check-in. Each gets the same motion-system treatment as end-of-session.
4. **Working interactive prototype.** Card view with real drag physics. Long-post reflow. Session state machine. Stub-data feed.
5. **Polished case-study artifacts.** Re-render the gesture-grammar, long-post reflow, and before-feed pieces at the production-fidelity bar set by end-of-session.
6. **Figma-ready specification package.** Token JSON export. Component spec doc. Frame-by-frame screen specs.
7. **Case study writeup.** The narrative document.
8. **Final QA.** Accessibility check, motion check, cross-browser, mobile-touch.

---

## References

Citations are split per distinct claim, so the Barkley work appears twice (once for the executive-function model, once for response inhibition) rather than once as a blanket reference.

- Kessler, R. C., et al. (2006). The Prevalence and Correlates of Adult ADHD in the United States: Results From the National Comorbidity Survey Replication. *American Journal of Psychiatry,* 163(4), 716 to 723. PMC2859678. [Link](https://pmc.ncbi.nlm.nih.gov/articles/PMC2859678/) (adult ADHD prevalence, 4 to 8 percent of working adults).
- Sonuga-Barke, E. J. S. (2002). Psychological heterogeneity in ADHD: a dual pathway model of behaviour and cognition, including the delay-aversion account. *Behavioural Brain Research,* 130(1 to 2), 29 to 36.
- Barkley, R. A. *ADHD and the Nature of Self-Control.* The Guilford Press. Executive-function and working-memory model (the self-regulation framework, Part II).
- Barkley, R. A. *ADHD and the Nature of Self-Control.* The Guilford Press. Response-inhibition deficit (the behavioral-inhibition chapter, Part I).
- Becker, S. P., et al. (2022). Report of a Work Group on Sluggish Cognitive Tempo: Key Research Directions and a Consensus Change in Terminology to Cognitive Disengagement Syndrome. *Journal of the American Academy of Child & Adolescent Psychiatry.* [Link](https://www.jaacap.org/article/S0890-8567(22)01246-1/fulltext)
- Mayes, S. D., et al. Neurocognition in Children with Cognitive Disengagement Syndrome: Accurate but Slow. PMC10474248. Pediatric sample; generalization to adults is flagged in Section 3.2 as a hypothesis. [Link](https://pmc.ncbi.nlm.nih.gov/articles/PMC10474248/)
- Adi-Japha, E., et al. (2017). Procedural Memory Consolidation in Attention-Deficit/Hyperactivity Disorder Is Promoted by Scheduling of Practice to Evening Hours. PMC5540945. [Link](https://pmc.ncbi.nlm.nih.gov/articles/PMC5540945/)
- Ebbinghaus, H. (1885). *Über das Gedächtnis.* The original forgetting-curve work.
- Fitts, P. M. (1954). The information capacity of the human motor system in controlling the amplitude of movement. *Journal of Experimental Psychology,* 47(6), 381 to 391.
- Hick, W. E. (1952). On the rate of gain of information. *Quarterly Journal of Experimental Psychology,* 4(1), 11 to 26. (Hyman, R. (1953) extends the result.)
- LinkedIn Help Center: Reactions on posts (for the six-reaction palette).

---

*End of design specification. Next step: review and approval, then handoff to the writing-plans skill for the detailed phased implementation plan.*
