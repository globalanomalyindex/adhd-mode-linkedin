# Build Canon (single source of truth)

This file is the canonical reference for the portfolio upgrade. Every workstream reads
from it so the artifacts stay internally consistent. If a fact about the product is not
here, decide it, then add it here. Do not invent persona names, numbers, units, metrics,
or copy that contradict this file.

Hard constraints (apply everywhere, including this file):
- No em dashes, no en dashes, no double hyphen used as a dash. Use commas, colons,
  semicolons, periods, or parentheses.
- No generic AI-slop lexicon: seamless, elevate, delve, leverage, game changer, unlock,
  in today's world, dive in, robust, supercharge, effortless, at the end of the day.
- In-app surfaces (prototype, screens) are LinkedIn-native: Source Sans 3, brand blue
  #0a66c2, feed grey #f4f2ee, white cards, no marketing voice.
- The case study is the only brand-register surface (its own editorial identity).

---

## 1. Product one-liner

A bounded Focus Session over the LinkedIn feed for people whose attention works
differently (ADHD and Cognitive Disengagement Syndrome). It is the credible version of
the wellbeing promise platforms already make: it optimizes for capability and recall,
not time on app.

## 2. Session-unit model (canonical, resolved)

A Focus Session is bounded by BOTH a time box AND a soft post cap. It ends when either
bound is reached, whichever comes first. The user can also end it any time via the
closure ritual.

- Presets (the three setup pills): 5 minutes, 12 minutes, 20 minutes.
- Each preset carries a soft post cap: 5 min -> 8 posts, 12 min -> 15 posts, 20 min -> 25 posts.
- Rationale to state once: time blindness argues for a visible time box; volume
  doomscroll argues for a post cap. Both, whichever hits first.
- NEVER show a bare "12" that could mean minutes or posts. Always report actuals as
  "N posts in M minutes."

Canonical depicted session (use these exact numbers everywhere a finished session is shown):
- Chosen preset: 12 minutes (post cap 15).
- Ended because: the 12 minutes elapsed.
- Posts seen: 11 (under the cap).
- Reactions given: 2, both resurfacing (Insightful on Maya, Support on Priya).
- Saved to resurface: 2.
- End-of-session headline reads: "11 posts. 12 minutes. 2 saved to revisit."
- Mid-session check-in fires at the halfway point: "6 posts in. About 6 minutes left."
  The check-in also carries the grounding prompt (see section 6).

## 3. Canonical feed (post authors, titles, bodies)

Six canonical posts. The prototype and the screens draw from this set. Authors keep the
same name, title, and body across every artifact. Copy is specific and human; no
influencer bait, no "this hits", no "crying at my desk".

1. Priya Nair, Engineering Manager (formerly Cobalt Robotics). LAYOFF reflection.
   Reaction that resurfaces it: Support (about one week).
   Body: "Friday was my last day at Cobalt. My whole team was cut in the restructure. I
   am not going to pretend it does not sting. What I keep coming back to: the best work I
   did there was the reliability work nobody noticed until it stopped breaking. If you
   are hiring an EM who cares more about a humane on-call rotation than about the org
   chart, I would love to talk."

2. James Park, Product Manager at Atlas Health. HIRING post.
   Body: "We are hiring two product designers on the Atlas Health platform team. The work
   is unglamorous and it matters: we are rebuilding the intake flow every patient touches
   before they ever see a doctor. If you have shipped healthcare or other high-stakes
   workflows, my messages are open."

3. Maya Chen, Staff Engineer at Northwind Logistics. TECHNICAL reflection.
   Reaction that resurfaces it: Insightful (about three days).
   Body: "We finally retired the cron job that ran our billing pipeline. It had thirty
   seven downstream consumers and a single point of failure that took us down twice last
   quarter. Moving to an event log was not the hard part. The hard part was convincing
   six teams that 'it has always worked' is not the same as 'it works.' Migration notes
   in the comments."

4. Acme Cloud (company page). PRODUCT announcement. Skippable, does not resurface.
   Body: "Acme Cloud now supports point in time recovery on every plan, including the
   free tier. Because losing data should not be a premium feature."

5. Daniel Okafor, UX Researcher at Meridian Bank. RESEARCH observation.
   Body: "Watched twelve people use our new dashboard this week. Eleven of them ignored
   the feature we spent a quarter building and went straight for the export button. The
   export button took an afternoon. There is a lesson in that I am still sitting with."

6. Lena Fischer, Logistics Analyst at Northwind. MILESTONE. Celebrate-worthy, ephemeral,
   does not resurface.
   Body: "Five years at Northwind today. Grateful for the people who answered my
   questions back when I was the most junior person in the room."

Recall-hook coverage: the case study hook asks the reader about hiring and a layoff.
James (hiring) and Priya (layoff) satisfy that. Keep them in any feed used for the hook.

Canonical comments (for the cycling comment chip and the thread on Maya's post):
- "The line about 'it has always worked' is going on our team wiki."
- "How did you handle the backfill for the existing consumers?"
- "We are mid migration on something similar. This is the reassurance I needed."

## 4. Reaction-to-resurface mapping (shipped mechanic)

The mechanic name, stated honestly: "reaction-seeded fixed spaced intervals." Do NOT call
the shipped version the SM-2 algorithm. SM-2 (grade driven ease factors) is the
research-build evolution where a recall probe at the second touch adjusts the interval,
which doubles as a capability signal. Name it that way wherever the algorithm is discussed.

| Reaction   | Resurfaces? | First interval |
|------------|-------------|----------------|
| Insightful | yes         | about 3 days   |
| Support    | yes         | about 1 week   |
| Love       | yes         | about 2 weeks  |
| Celebrate  | no          | ephemeral      |
| Like       | no          | ephemeral      |
| Funny      | no          | ephemeral      |

(These match lib/spaced-repetition.js. Reaction order in the dock matches
lib/gestures.js REACTIONS_ORDER: like, celebrate, support, love, insightful, funny.)

## 5. Measurement model (capability first, engagement as guardrail)

State plainly in the spec and case study: engagement metrics are guardrails, not goals.

Tier 1, capability and outcome metrics (PRIMARY, what success means):
- Resurfaced-content recall: at the second touch (when a saved post resurfaces), an
  optional unprompted recall probe asks the user to state the post's core claim before
  re-showing it. Metric: recall accuracy on resurfaced posts vs a non-resurfaced control.
  (Research build only.)
- Comprehension after reflow: a one-question comprehension probe after a long post shown
  TL;DR-first vs the same post shown full-text-first. Metric: comprehension accuracy
  delta. (Research build only.)
- Intentional completion rate: share of sessions ended by the user's closure ritual or by
  the time or post bound, vs sessions abandoned by leaving the app mid-session. Proxy for
  agency and self-regulation.
- Settledness delta: a single self-report item before and after the session ("Right now I
  feel scattered" to "Right now I feel settled", 1 to 5). Metric: mean shift.

Tier 2, engagement metrics (GUARDRAILS, must not be the success criteria):
- Opt-in rate, 7-day return, reaction-mix shift, resurface acceptance rate.
- Their only job is to confirm the feature is not quietly tanking the business while the
  capability metrics move.

Harm counter-metrics (these must fail loudly; if any rises, the design is hurting):
- Compulsive re-entry: rate of starting another session within two minutes of a closure.
  Signals the bound became a binge enabler rather than a stop.
- Resurface anxiety: resurface-queue opt-out rate, plus dismiss-without-view rate on
  resurfaced items. Signals the queue became a guilt backlog.
- Rumination increase: share of users whose settledness delta goes the wrong way
  (more scattered after the session than before).

## 6. Grounding prompt (mid-session check-in)

A short sensory grounding moment, optional and skippable, shown once at the halfway check-in:
"Look up from the screen. Name five things you can see that are green." This is a
documented attention-reset technique, framed as optional, never forced, never gamified.

## 7. AI boundary (the honest stance)

One short, restrained section in the case study. The stance, verbatim spine:
"AI orients and scaffolds. It does not decide what you re-see, and it never optimizes for
time on app."

AI MAY:
- Generate the per-post TL;DR for long posts (already an honest stub in lib/reflow.js
  generateTldr; describe it as an LLM call in production).
- Power the optional recall and comprehension probes in the research build (generate the
  question, grade the free-text answer).
- Draft an optional reflection prompt at closure (the user can ignore or edit it).

AI MUST NOT:
- Choose what resurfaces. That is driven by the user's own reactions, deterministically
  and transparently (section 4). The user can always see and edit the queue.
- Rank or curate the feed for engagement. Focus Session preserves native chronological or
  the user's existing feed order; it does not introduce an engagement-optimizing ranker.
- Set or nudge session length. The user sets the bound.

Why this belongs (for the writer): it answers Role B's conviction that technology should
enhance human capability rather than diminish it, and Role A's mandate to invent patterns
native to AI while questioning assumptions. It extends the existing honest-judgment
framing rather than bolting on an AI persona. Do not re-center the piece on AI.

## 8. Motion tokens (name the real numbers)

These already live implicitly in the prototype. Name them so the tuning is legible as
craft. Mirror in design-system/tokens.css and document in the demo.

Springs (stiffness, damping), semi-implicit Euler:
- position x and y: 260, 24
- rotation: 220, 18
- scale: 280, 22
- opacity: 200, 24

Gesture thresholds:
- ACTIVATION_DIST: 60 px (drag distance where the react zone arms)
- COMMIT_DIST: 130 px (drag distance that commits skip or react)
- REACT_RADIUS: 50 px (thumb-to-emoji proximity for magnification)
- TAP_MOVE_MAX: 8 px, TAP_DUR_MAX: 280 ms (tap vs drag disambiguation)
- COMMIT_VEL: velocity threshold for flick commit
- throw injection clamp: 1400 (min outgoing spring velocity on commit)

Durations and easings (already in tokens.css, keep):
- --d-fast 150ms, --d-base 240ms, --d-slow 400ms, --d-page 600ms
- --ease-out cubic-bezier(0.16, 1, 0.3, 1)
- --ease-spring cubic-bezier(0.34, 1.56, 0.64, 1)
- --ease-in-out cubic-bezier(0.4, 0, 0.2, 1)

Layout-property bans to fix in the demo:
- The React FAB must not animate width. Use a transform-based reveal (scaleX with an
  inverse-scaled content wrapper, or transform/clip-path) off the compositor.
- The floating reaction preview must not animate font-size. Use transform: scale on a
  fixed-size node.

## 9. Event taxonomy (typed, for analytics)

Discriminated union, emitted from the session reducer via an injected sink. Field names
are canonical; the Python pipeline and the TS types must match exactly.

- session_started: { mode: 'focus' | 'reengage', time_box_s: number, post_cap: number, ts: number }
- card_seen: { post_id: string, dwell_ms: number, is_resurfaced: boolean, ts: number }
- long_post_reflowed: { post_id: string, expanded: boolean, ts: number }
- reaction_committed: { post_id: string, reaction: Reaction, seeds_resurface: boolean, via: 'tap' | 'drag', ts: number }
- post_skipped: { post_id: string, via: 'swipe' | 'key', ts: number }
- checkpoint_shown: { posts_seen: number, elapsed_s: number, ts: number }
- recall_probe: { post_id: string, correct: boolean, ts: number }   (research build)
- session_wrapped: { reason: 'timebox' | 'postcap' | 'user_closed' | 'abandoned', posts_seen: number, elapsed_s: number, resurfaced_count: number, settledness_delta: number | null, ts: number }

Reaction union (canonical): 'like' | 'celebrate' | 'support' | 'love' | 'insightful' | 'funny'.

## 10. lib export contract (do not rename; add types only)

The demo and the React component import these exact names. Adding types via JSDoc plus a
lib/types.d.ts is fine; renaming or changing signatures is not.

- gestures.js: REACTIONS_ORDER, classifyGesture({dx,dy}, view), magnificationFor(reaction, {dx,dy}, view)
- reflow.js: classifyPost(post), generateTldr(post), chunkPost(post)
- session-state.js: createSession(), send(session, event)   (add optional sink param to send)
- resurface-queue.js: createQueue(), addItem(queue, item), dueItems(queue, now), blendFeed({...})
- spaced-repetition.js: RESURFACING_REACTIONS, schedule({reaction, now, postId}), advance(item, shownAt)
- prototype/sample-feed.js: SAMPLE_FEED, getPostById(id)   (update SAMPLE_FEED bodies to section 3)

## 11. Tokens to add (kill stray hex)

Add to tokens.css and tokens.json, then replace raw hex in screens:
- --notify-red: #cb112d   (LinkedIn notification badge red)
- --field-grey: #eef3f8   (input field fill)
- --success-green: #128161 (used at end-of-session)
- --hairline-2: #e0dfdc, --surface-2: #f9fafb (neutral fills used in before-feed)
Add typography sub-tokens referenced by components.md if missing: font weights
(--fw-regular 400, --fw-medium 500, --fw-semibold 600, --fw-bold 700).
Color note: when adding or adjusting, keep neutrals tinted (never pure #000 or #fff in new
work); existing LinkedIn-native values stay as is for fidelity.

## 12. npm scripts and deps manifest (owned by the engineering foundation lane)

The foundation lane is the ONLY lane that edits package.json and runs npm install. It must
add everything the other lanes need so no one else installs:
- devDeps: typescript, @types/node, eslint, prettier, eslint-config-prettier,
  style-dictionary, @testing-library/react, @testing-library/jest-dom,
  @vitejs/plugin-react, @types/react, @types/react-dom
- deps: react, react-dom
- scripts: "typecheck": "tsc --noEmit", "lint": "eslint .", "format": "prettier --check .",
  "tokens:build": "style-dictionary build" (or the documented sync), "test": existing,
  "check:dashes": "node scripts/check-dashes.mjs", "ci": runs test + typecheck + lint + check:dashes

## 13. Voice rules (for prose lanes)

- Vary the repeated cluster "quietly / ambient / invisible" (it recurs enough to become a
  tic). Vary the "Not X. Not Y. Not Z." cadence; keep at most one instance.
- Replace one use of the phrase "gesture grammar" with a plain description.
- Every projected or synthetic number carries an explicit label in the visual layer:
  "TARGET" or "HYPOTHESIS, not measured" or "SYNTHETIC, illustrative". Never present a
  projected multiplier as an achieved result.
