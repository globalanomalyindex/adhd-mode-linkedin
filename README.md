# ADHD Mode for LinkedIn

**[Live case study](https://globalanomalyindex.github.io/adhd-mode-linkedin/)** · **[Action Dock study](https://globalanomalyindex.github.io/adhd-mode-linkedin/prototype/demo.html)** · **[Figma file](https://www.figma.com/design/ZFEmkHeen3nXUy6ogyGQW0)**

An independent product-design concept by Christopher Robin Fiore. ADHD Mode
replaces LinkedIn's infinite feed with a voluntary, bounded session and turns
three existing reactions into a private return queue.

This repository is not affiliated with LinkedIn. It contains a coded portfolio
prototype, tested product logic, static concept screens, and a synthetic
measurement rehearsal. It does not contain a LinkedIn integration or evidence
from a representative-user study.

## Product thesis

Professional access should not require surrendering the stopping point.

- A session has two visible bounds: elapsed time and posts viewed.
- Reaching either bound closes the session.
- A midpoint check-in appears once, then stays out of the way.
- One Action Dock keeps six reactions off the resting screen.
- Insightful, Support, and Love seed a private fixed-interval return queue.
- Like, Celebrate, and Funny remain ephemeral.
- Long posts can reflow into TL;DR-first pages.
- Success means recall, comprehension, intentional completion, and settledness.
  Engagement is only a business guardrail.

The authored 3, 7, and 14-day schedule is a prototype default to test. Spacing
research does not validate those exact intervals for social posts or ADHD.

## Evidence map

| Status | What the repository supports |
| --- | --- |
| Built | Action Dock, gesture classifier, keyboard routes, focus behavior, reduced-motion state parity |
| Tested logic | Session reducer, scheduler, return queue, reflow rules, React component |
| Static concept | Entry, setup, active session, midpoint, and closure screens |
| Synthetic | Fixed-seed events, metric transforms, and generated charts |
| Open | Participant outcomes, LinkedIn integration, privacy review, platform economics |

The flagship `prototype/demo.html` is an **Action Dock interaction study**. The
separate `prototype/index.html` exercises the older full-flow prototype. The two
are kept distinct so the case study does not claim an integration that is not
there yet.

## Start here

| Artifact | Location |
| --- | --- |
| Recruiter-first case study | [`case-study/index.html`](case-study/index.html) |
| Action Dock interaction study | [`prototype/demo.html`](prototype/demo.html) |
| Full-flow prototype | [`prototype/index.html`](prototype/index.html) |
| Typed React component | [`react/ActionDock.tsx`](react/ActionDock.tsx) |
| Product logic | [`lib/`](lib/) |
| Static product screens | [`screens/`](screens/) |
| Design tokens | [`design-system/`](design-system/) |
| Figma handoff package | [`figma-spec/`](figma-spec/) |
| Synthetic measurement rehearsal | [`analytics/`](analytics/) |
| Product contract | [`docs/build-canon.md`](docs/build-canon.md) |
| Accessibility record | [`docs/superpowers/notes/accessibility-audit.md`](docs/superpowers/notes/accessibility-audit.md) |

## Architecture

The repository separates concerns so each public claim is inspectable.

```text
case-study/       portfolio narrative and share card
prototype/        coded interaction study and full-flow prototype
lib/              side-effect-free session, gesture, queue, schedule, and reflow logic
react/            typed, tested Action Dock component
screens/          production-fidelity concept screens
design-system/    DTCG token source and generated CSS/JSON
figma-spec/       component, screen, motion, and token handoff
analytics/        typed synthetic events, transforms, and figures
tests/e2e/        Playwright behavior and axe accessibility checks
docs/             build canon, specification, plan, and audit notes
```

The pure logic uses JSDoc-typed ES modules. The same code runs in the browser,
under Vitest, and through TypeScript's `checkJs` analysis. The Action Dock is a
separate React/TypeScript implementation of the same interaction contract.

## Run locally

Requirements: Node 22.12 or newer and npm.

```bash
npm ci
npm run serve
```

Open `http://127.0.0.1:4173/`. Serve the repository over HTTP because the
prototypes import ES modules.

## Verification

```bash
npm run ci                 # unit tests, types, lint, HTML, local links, voice rule
npm run test:coverage      # V8 coverage report
npm run test:e2e -- --list # enumerate the browser matrix
npm run test:e2e           # Chromium behavior and axe checks
npm audit
```

GitHub Actions installs Chromium and runs the browser suite on pull requests
and pushes to `main`. It also rebuilds design tokens and rendered assets, then
fails if committed generated files are stale.

## Design system

`design-system/tokens.source.json` is the hand-edited DTCG source. Style
Dictionary generates `tokens.css` and `tokens.json`:

```bash
npm run tokens:build
```

The in-app prototype stays LinkedIn-native. The portfolio shell adds a
Marathon-derived Exposed Logic layer whose colors name actual behavior:

- `session-field`: the active bounded session
- `session-bound`: time, post, and saved-attention limits
- `structure`: frames, modules, and seams
- `trace`: the future-return path
- `signal`: a scarce action or committed state

## Synthetic analytics

The analytics directory is an executable measurement rehearsal, not a results
folder. A fixed seed generates inspectable events; the runtime schema rejects
malformed rows; metric transforms and figures verify the proposed pipeline.
The apparent differences are authored into the generator.

```bash
python3 analytics/event_schema.py
MPLCONFIGDIR=/tmp/matplotlib python3 analytics/generate_events.py
MPLCONFIGDIR=/tmp/matplotlib python3 analytics/capability_metrics.py
```

See [`analytics/README.md`](analytics/README.md) for the event contract,
limitations, and proposed study design.

## Accessibility

The interaction contract includes native tap controls, keyboard routes, visible
focus, dialog focus management, reduced-motion state parity, and target sizes.
Automated Playwright and axe checks cover the case study and interaction study.
Manual VoiceOver, TalkBack, zoom, forced-colors, and switch-control checks are
tracked as open work rather than reported as completed.

## Project status and next work

1. Unify the Action Dock with the complete bounded-session flow.
2. Run and document the manual assistive-technology matrix.
3. Test reaction meaning, perceived control, and closure with representative
   participants.
4. Define consent, retention, deletion, and pause behavior before any platform
   integration.
5. Specify platform economics only after the capability thesis survives user
   research.

## License

Code and documentation are available under the [MIT License](LICENSE).
LinkedIn is a trademark of LinkedIn Corporation. This is an independent
portfolio concept and does not imply endorsement.
