# Accessibility Audit Notes

## Scope

- Portfolio case study in `case-study/`
- Built Action Dock interaction study in `prototype/demo.html`
- Older integration harness in `prototype/index.html`
- Static concept screens in `screens/`

This document separates implementation, automated coverage, and manual validation. Automated checks cannot substitute for assistive-technology or cross-browser testing.

## Current status

| Area | Status |
|---|---|
| Accessible implementation paths | Present in the Action Dock study and case study |
| Playwright + axe coverage | Added to the repository |
| Latest local automated result | Not recorded in this note; do not infer a pass |
| VoiceOver validation | Pending |
| TalkBack validation | Pending |
| Manual browser and device matrix | Pending |

## Implemented in source

- Documents declare an English language and descriptive titles.
- Comment, React, Move on, reaction destinations, and compose actions use native buttons in the Action Dock study.
- Move on is available by tap/click and keyboard; upward drag is an optional accelerator.
- React exposes expanded state programmatically.
- Reaction buttons have action-specific accessible names.
- Closed sheets are removed from the focus order, and Escape restores focus to the opening control.
- An `aria-live` region announces skip, reaction, save, and sheet results.
- The case-study sticky navigation uses both `aria-hidden` and `inert` while hidden.
- Focus Read expand controls expose `aria-expanded` state.
- Reduced-motion handling removes ambient movement and preserves destination state.
- Comments in the Action Dock study change through user-selected controls rather than auto-rotation.

These bullets describe source behavior. They are not a record of assistive-technology validation.

## Automated coverage added

The repository includes Playwright projects for desktop and mobile Chromium plus axe-core WCAG A/AA analysis. The added suite covers:

- automated axe analysis of the case study and Action Dock study
- case-study scope messaging and Focus Read state
- sticky-navigation `inert` behavior
- visible tap-to-skip and reaction paths
- Action Dock expanded state
- closed-dialog focus exclusion and Escape focus restoration
- mobile case-study behavior that avoids an embedded prototype scroll trap
- reduced-motion reaction state without ambient comment updates

Relevant commands:

```sh
npm run validate:html
npm run test:e2e
```

The suite is checked in, but this note intentionally does not claim it has passed locally. Record the command, date, browser version, and result here after an observed run.

### Automated run record

Pending.

## Manual keyboard validation · pending

Test the case study and `prototype/demo.html` without a pointer:

- Tab reaches Move on, Comment, React, and every visible reaction destination.
- Focus indicators remain visible against every state and surface.
- Enter and Space activate every button.
- React expansion moves through the visual order: Insightful, Support, Love, Celebrate, Like, Funny.
- Escape collapses reactions or a sheet and returns focus to the opener.
- Number keys 1 through 6 match the visible reaction order when the reaction control is open.
- Hidden navigation, closed sheets, and collapsed reaction buttons never enter the focus order.
- Focus does not become trapped after a post advances.

## Screen-reader validation · pending

### VoiceOver

Run on macOS Safari and iOS Safari.

- Confirm the Move on button is announced as an action, not an image.
- Confirm React announces expanded and collapsed state.
- Confirm reaction names and their visible order.
- React with Insightful, Support, and Love; verify the result is announced as saved to revisit without implying production persistence.
- React with Celebrate, Like, and Funny; verify no saved-to-revisit claim is announced.
- Move on; verify the author/post change is announced once.
- Open and dismiss compose and comment sheets; verify focus restoration.
- Enable Focus Read; confirm collapsed content is represented accurately and can be expanded.

### TalkBack

Run on Android Chrome with the same scenarios. Pay particular attention to swipe-navigation conflicts with the card gesture model and verify that standard buttons remain usable.

No VoiceOver or TalkBack pass is claimed until these scenarios are completed and recorded.

## Reduced-motion validation · pending

With system Reduce Motion enabled:

- no topbar status pulse appears
- no idle card wobble appears
- comments do not auto-rotate
- the end state does not loop or pulse
- dock expansion, reaction selection, and post advance still expose clear destination states
- focus and live-region feedback remain intact
- no content depends on animation to become available

## Contrast and visual validation · pending

- Verify body, secondary, and metadata text against every surface at WCAG AA sizes.
- Verify focus indicators in resting, expanded, dragging, and modal states.
- Verify reaction meaning does not rely on color alone.
- Verify 200% and 400% zoom without clipped actions or horizontal loss of content.
- Verify narrow mobile layouts do not crop the annotated-feed artifact or data tables.
- Verify forced-colors/high-contrast behavior for buttons, outlines, and state boundaries.

## Manual browser and device matrix · pending

| Platform | Browser | Pointer/keyboard | Screen reader | Status |
|---|---|---|---|---|
| macOS | Chrome | both | none | Pending |
| macOS | Safari | both | VoiceOver | Pending |
| macOS | Firefox | both | none | Pending |
| iOS | Safari | touch | VoiceOver | Pending |
| Android | Chrome | touch | TalkBack | Pending |
| Windows | Edge | both | optional Narrator | Pending |

For each row, record browser and OS versions, test date, defects, and retest outcome. Pointer Events support alone is not evidence that drag, focus, scroll, and assistive-technology behavior work together.
