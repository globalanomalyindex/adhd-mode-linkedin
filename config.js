/* =========================================================
   STYLE DICTIONARY CONFIG  ·  ADHD MODE DESIGN TOKENS
   ---------------------------------------------------------
   Single source of truth: design-system/tokens.source.json
   (W3C / DTCG format). This config is what `npm run tokens:build`
   runs (the package.json script is `style-dictionary build`, and
   the CLI loads ./config.js by default).

   It generates two artifacts that previously drifted because they
   were hand-maintained:
     - design-system/tokens.css   (the runtime stylesheet every
       screen and the prototype @import via base.css)
     - design-system/tokens.json  (the W3C mirror for Figma /
       Tokens Studio import)

   Both come from one source now, so they cannot disagree. The CSS
   output preserves the exact custom-property names and literal
   values the codebase already ships (rgba spelling, LinkedIn-native
   hex), so it is a strict superset: nothing existing is renamed or
   dropped, only the canon section-11 tokens are added.

   The renderers below are intentionally explicit (templated section
   by section) rather than leaning on the generic css/variables
   format. That is the only way to keep the section comments, the
   column alignment, and the literal value spelling byte-stable.
   ========================================================= */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = JSON.parse(
  readFileSync(join(here, 'design-system', 'tokens.source.json'), 'utf8'),
);

/* ---------------------------------------------------------
   Source readers. We render straight from the source tree
   (not the transformed dictionary) so value spelling stays
   exactly as authored: rgba(...) keeps its spaces, cubic
   beziers keep their literal form, font stacks keep quotes.
   --------------------------------------------------------- */

/** Render a CSS value from a DTCG token, matching the spelling
 *  the codebase already uses for each token type. */
function cssValue(token) {
  const v = token.$value;
  switch (token.$type) {
    case 'cubicBezier':
      return `cubic-bezier(${v.join(', ')})`;
    case 'fontFamily':
      // Quote the first family (it has a space); leave the system
      // fallbacks bare, as the existing file does.
      return v.map((f, i) => (i === 0 ? `'${f}'` : f)).join(', ');
    case 'shadow':
    case 'number':
    case 'duration':
    case 'dimension':
    case 'fontWeight':
    case 'color':
    default:
      return String(v);
  }
}

/** One `  --name: value;` line, with the value column padded so a
 *  block of declarations lines up the way the hand-written file did. */
function decl(name, value, pad) {
  const label = `--${name}:`;
  return `  ${label.padEnd(pad)}${value};`;
}

/* Compute the value-column width for a set of token names: the
   longest `--name:` in the block, plus two spaces, so every value
   lines up and the shortest names still get breathing room. */
function columnFor(...names) {
  return Math.max(...names.map((n) => `--${n}:`.length)) + 2;
}

/* The color and shadow blocks share one column so the whole COLOR
   section reads as a single aligned table, the way the hand-written
   file did. */
const COLOR_PAD = columnFor(
  ...Object.keys(source.color),
  ...Object.keys(source.shadow),
);
const TYPE_PAD = columnFor(...Object.keys(source.typography));
const MOTION_PAD = columnFor(
  'd-fast',
  'd-base',
  'd-slow',
  'd-page',
  'ease-out',
  'ease-in-out',
  'ease-spring',
  'lift-sm',
  'lift-md',
  'lift-lg',
  'stagger-tight',
  'stagger-loose',
);

function renderColor() {
  const c = source.color;
  const padTo = COLOR_PAD;
  const d = (k) => decl(k, cssValue(c[k]), padTo);
  return [
    '  /* ---------- COLOR ---------- */',
    d('bg'),
    d('card'),
    d('brand'),
    d('brand-hover'),
    d('brand-tint'),
    '',
    '  /* Exposed Logic shell roles. These name product structure, not decoration. */',
    d('canvas'),
    d('canvas-alt'),
    d('structure'),
    d('structure-soft'),
    d('ink-muted'),
    d('trace'),
    d('rule-strong'),
    d('session-field'),
    d('session-bound'),
    d('signal-text'),
    d('signal-field'),
    '',
    '  /* LinkedIn-native product roles. */',
    d('text'),
    d('text-secondary'),
    d('text-tertiary'),
    d('hairline'),
    d('hairline-2'),
    d('skip-grey'),
    d('skip-tint'),
    d('surface-2'),
    d('field-grey'),
    d('notify-red'),
    d('success-green'),
    declShadow(),
    '',
    '  /* Reaction accents (background tints for hover/commit states) */',
    d('react-insightful'),
    d('react-support'),
    d('react-love'),
    d('react-celebrate'),
  ].join('\n');

  // Shadows live in the COLOR block in the existing file, right after
  // the neutral colors and before the reaction accents.
  function declShadow() {
    const s = source.shadow;
    return [
      decl('shadow', cssValue(s.shadow), COLOR_PAD),
      decl('shadow-hover', cssValue(s['shadow-hover']), COLOR_PAD),
      decl('shadow-drag', cssValue(s['shadow-drag']), COLOR_PAD),
    ].join('\n');
  }
}

function renderTypography() {
  const t = source.typography;
  const padTo = TYPE_PAD;
  const d = (k) => decl(k, cssValue(t[k]), padTo);
  return [
    '  /* ---------- TYPOGRAPHY ---------- */',
    d('font-sans'),
    d('fs-display'),
    d('fs-heading'),
    d('fs-body'),
    d('fs-small'),
    d('fs-meta'),
    d('fs-tiny'),
    d('fw-regular'),
    d('fw-medium'),
    d('fw-semibold'),
    d('fw-bold'),
    d('lh-tight'),
    d('lh-base'),
    d('lh-loose'),
    d('tracking-tight'),
    d('tracking-wide'),
  ].join('\n');
}

function renderSpace() {
  const s = source.space;
  const padTo = columnFor(...Object.keys(s).map((k) => `s-${k}`));
  const d = (k) => decl(`s-${k}`, cssValue(s[k]), padTo);
  return [
    '  /* ---------- SPACE ---------- */',
    d('1'),
    d('2'),
    d('3'),
    d('4'),
    d('5'),
    d('6'),
    d('7'),
    d('8'),
    d('9'),
  ].join('\n');
}

function renderRadius() {
  const r = source.radius;
  const padTo = columnFor(...Object.keys(r).map((k) => `r-${k}`));
  const d = (k) => decl(`r-${k}`, cssValue(r[k]), padTo);
  return [
    '  /* ---------- RADIUS ---------- */',
    d('sm'),
    d('md'),
    d('lg'),
    d('pill'),
  ].join('\n');
}

function renderMotion() {
  const m = source.motion;
  const padTo = MOTION_PAD;
  const dDur = (k) => decl(`d-${k}`, cssValue(m.duration[k]), padTo);
  const dEase = (k) => decl(`ease-${k}`, cssValue(m.easing[k]), padTo);
  const dLift = (k) => decl(`lift-${k}`, cssValue(m.lift[k]), padTo);
  const dStagger = (k) => decl(`stagger-${k}`, cssValue(m.stagger[k]), padTo);
  return [
    '  /* ---------- MOTION ---------- */',
    dDur('fast'),
    dDur('base'),
    dDur('slow'),
    dDur('page'),
    dEase('out'),
    dEase('in-out'),
    dEase('spring'),
    dLift('sm'),
    dLift('md'),
    dLift('lg'),
    dStagger('tight'),
    dStagger('loose'),
  ].join('\n');
}

/* ---------------------------------------------------------
   The CSS file format. Reproduces the original header, the
   :root block (in original section order), the reduced-motion
   note, and the dark-mode placeholder.
   --------------------------------------------------------- */
function cssFormat() {
  return (
    `/* =========================================================
   ADHD MODE · DESIGN TOKENS
   GENERATED FILE. Do not edit by hand.
   Source: design-system/tokens.source.json
   Build:  npm run tokens:build   (style-dictionary build)
   The tokens.json W3C mirror is generated from the same source,
   so the two cannot drift. Imported by every screen and the
   working prototype; mirror imports into Figma via Tokens Studio.
   ========================================================= */

:root {
` +
    [
      renderColor(),
      '',
      renderTypography(),
      '',
      renderSpace(),
      '',
      renderRadius(),
      '',
      renderMotion(),
    ].join('\n') +
    `
}

@media (prefers-color-scheme: dark) {
  /* Out of scope for the portfolio prototype; LinkedIn doesn't yet ship
     a fully tokenized dark mode for the feed. Note for future work. */
}
`
  );
}

/* ---------------------------------------------------------
   The JSON (W3C / DTCG) mirror. We re-emit the source minus
   the build-only `shadow` group's host wrapper differences,
   keeping the same shape the Figma import expects. Shadows,
   font weights, line heights and tracking are included so the
   mirror is a true superset too.
   --------------------------------------------------------- */
function jsonFormat() {
  // Re-serialize the source verbatim (it is already valid DTCG),
  // but with the `shadow` group folded into `color`-adjacent output
  // order is not significant for Tokens Studio. We keep groups as-is.
  return JSON.stringify(source, null, 2) + '\n';
}

export default {
  // We do not use SD's token pipeline for value transforms (we render
  // straight from source for byte-stable spelling), but SD still needs
  // a valid source + platforms to drive the CLI and write the files.
  source: ['design-system/tokens.source.json'],
  usesDtcg: true,
  log: { verbosity: 'silent', warnings: 'disabled' },
  hooks: {
    formats: {
      'adhd/css': () => cssFormat(),
      'adhd/json': () => jsonFormat(),
    },
  },
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'design-system/',
      files: [{ destination: 'tokens.css', format: 'adhd/css' }],
    },
    json: {
      transformGroup: 'js',
      buildPath: 'design-system/',
      files: [{ destination: 'tokens.json', format: 'adhd/json' }],
    },
  },
};
