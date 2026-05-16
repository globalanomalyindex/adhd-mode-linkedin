# Accessibility Audit Notes

## Scope
Every screen file in `screens/`, the prototype in `prototype/`, and the case study in `case-study/`.

## Static checks (completed in implementation)

- Every HTML file declares `lang="en"`
- Every HTML file has a `<title>`
- Prototype reaction buttons have `aria-label` attributes
- `prefers-reduced-motion` honored in `design-system/base.css` (sets animation-duration and transition-duration to 0.01ms across all elements)
- Screen-reader live region (`#sr-live`) present in prototype for announcing gesture commits

## Manual checks (to be run before shipping the portfolio)

### Lighthouse accessibility audit
Open each file below in Chrome DevTools, run Lighthouse > Accessibility, target score >= 90:
- screens/entry-point.html
- screens/session-setup.html
- screens/mid-session-checkin.html
- screens/end-of-session.html
- screens/before-feed-annotated.html
- prototype/index.html
- case-study/index.html

### Keyboard navigation
- All interactive elements reachable via Tab
- Focus indicator visible
- In the prototype: Escape closes the long-press picker
- In the prototype: number keys 1-6 trigger the reaction picker buttons (when open)

### Screen reader
- macOS: enable VoiceOver (Cmd+F5) on the prototype
- React to a post, verify announcement: "Reacted [reaction] to [author]'s post. Added to your resurface queue." (or without queue note for non-resurfacing reactions)
- Skip a post, verify announcement: "Skipped [author]'s post. Moving on."

### Reduced motion
- macOS: System Settings > Accessibility > Display > Reduce Motion ON
- Reload each screen
- Animations should collapse to instant; no transforms
- Page reveals should still occur via opacity only (verify the end-of-session screen still fades in)

### Color contrast (WCAG AA)
- Body text vs cream background (`--text` on `--bg`): visually verify or use a contrast checker
- Secondary text vs cream background (`--text-secondary` on `--bg`): visually verify

## Cross-browser smoke test (manual)

Open `prototype/index.html` in each of these browsers and verify:
- Chrome (macOS): drag, magnification, long-press picker, animations all work
- Safari (macOS): same checks
- Firefox (macOS): same checks (Pointer Events supported since Firefox 59)

For mobile/touch testing:
- From project root: `npx serve .` (note the network URL printed)
- Open URL on a phone connected to the same WiFi
- Test drag, react, long-press on touch

If any browser shows issues, document them and triage. Pointer Events should work across all modern browsers.
