#!/usr/bin/env node
/* =========================================================
   check-dashes.mjs
   ---------------------------------------------------------
   Enforces the author's typography rule as CI: no em dash,
   no en dash, no other unicode dash used as punctuation, and
   no prose double-hyphen standing in for a dash. The rule is
   stated in docs/build-canon.md ("No em dashes, no en dashes,
   no double hyphen used as a dash. Use commas, colons,
   semicolons, periods, or parentheses.").

   Scans reviewer-facing source: *.html, *.css, *.js, *.md,
   *.tsx, *.ts under the repo. Skips build output and vendored
   trees (node_modules, coverage, the Python virtualenv, the
   lockfile, minified bundles).

   Exits nonzero and prints every offending file:line when it
   finds a violation, so the same run works locally and in CI.

   It deliberately does NOT flag the legitimate uses of double
   hyphens and dash-shaped glyphs that show up in real code:
     - CSS custom properties:        --brand, var(--brand)
     - BEM modifiers:                card__title--active
     - CLI flags in code or strings: --noEmit, --coverage
     - TS / JS arrow functions:      (x) => x
     - markdown table separators:    | --- | --- |
     - a minus sign between numbers: 396 - 18 (arithmetic)
   ========================================================= */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SCAN_EXT = new Set(['.html', '.css', '.js', '.md', '.tsx', '.ts']);

// Directory names we never descend into. These are dependencies,
// generated artifacts, or environments, not authored prose.
const SKIP_DIRS = new Set([
  'node_modules',
  'coverage',
  '.git',
  '.venv-analytics',
  '.vitest-cache',
  'dist',
  'build',
]);

// Exact file basenames to skip even when the extension matches.
const SKIP_FILES = new Set(['package-lock.json']);

// Unicode dashes that are banned outright (these never have a
// legitimate non-dash meaning in our prose or code).
//   U+2014 em dash, U+2013 en dash, U+2012 figure dash,
//   U+2015 horizontal bar.
const HARD_DASHES = /[—–‒―]/;

// U+2212 MINUS SIGN is banned as punctuation but allowed as an
// arithmetic operator (a digit or space on each side). We flag it
// only when it is NOT being used as math.
const MINUS = '−';

/**
 * Collect every line-level violation in one line of text.
 * @param {string} line  raw line content
 * @returns {string[]}   human-readable reasons, empty if clean
 */
function violationsInLine(line) {
  const reasons = [];

  // 1. Hard unicode dashes: always a violation.
  if (HARD_DASHES.test(line)) {
    reasons.push('unicode dash (em / en / figure / bar)');
  }

  // 2. Unicode minus sign used as punctuation rather than math.
  //    Allow it only when both neighbours look arithmetic
  //    (digit, whitespace, or a paren / closing brace boundary).
  for (let i = 0; i < line.length; i++) {
    if (line[i] !== MINUS) continue;
    const before = line[i - 1] ?? ' ';
    const after = line[i + 1] ?? ' ';
    const arithmetic = /[\d\s)\]]/.test(before) && /[\d\s($]/.test(after);
    if (!arithmetic) {
      reasons.push('unicode minus sign used as a dash');
      break;
    }
  }

  // 3. Prose double-hyphen used as a dash. We strip the legitimate
  //    code shapes first, then look for what is left.
  if (hasProseDoubleHyphen(line)) {
    reasons.push('double hyphen used as a dash');
  }

  return reasons;
}

/**
 * True if the line contains a `--` that reads as a prose dash,
 * after removing every legitimate `--` shape from the codebase.
 *
 * A prose dash is exactly two hyphens standing in for punctuation,
 * either glued between words ("word--word") or floating between them
 * ("word -- word"). Everything else that contains `--` in source is
 * structural, not punctuation, and is stripped first:
 *   - HTML comment delimiters:  <!-- ... -->
 *   - decorative rules / dividers: runs of 3+ hyphens
 *   - markdown table separators and horizontal rules
 *   - CSS custom properties and BEM modifiers: --brand, el--mod
 *   - CLI flags and the bare `--` argument separator: --noEmit, x -- y
 *
 * @param {string} raw
 * @returns {boolean}
 */
function hasProseDoubleHyphen(raw) {
  let s = raw;

  // markdown table separator rows: | --- | :--- | ---: |
  // (a line made only of pipes, colons, spaces and runs of hyphens)
  if (/^\s*\|?[\s:|-]*-{2,}[\s:|-]*\|?\s*$/.test(s) && s.includes('|')) {
    return false;
  }

  // markdown horizontal rule or front-matter rule: a line of only hyphens
  if (/^\s*-{3,}\s*$/.test(s)) {
    return false;
  }

  // URLs and slugs: a Figma file name or any link can carry a `--` in
  // its path (e.g. .../ADHD-Mode-for-LinkedIn--Portfolio?node-id=...).
  // That is data, not prose, so blank whole URLs and link attributes.
  s = s.replace(/\bhttps?:\/\/\S+/g, ' ');
  s = s.replace(/\b(?:href|src|url)\s*=\s*["'][^"']*["']/gi, ' ');
  s = s.replace(/\burl\(\s*[^)]*\)/gi, ' ');

  // HTML comment delimiters. The `--` here is comment syntax, not a dash.
  s = s.replace(/<!--/g, ' ').replace(/-->/g, ' ');

  // Decorative rules / section dividers: any run of 3 or more hyphens
  // (e.g. /* ---------- COLOR ---------- */ or // ----- foo -----).
  // Three or more hyphens is never punctuation, so blank the whole run.
  s = s.replace(/-{3,}/g, ' ');

  // BEM tokens: any identifier that uses a double-underscore element is
  // BEM, so its `--modifier` is structural. Blank the whole token,
  // e.g. action-dock__react-icon--smile .
  s = s.replace(/[\w-]*__[\w-]*--[\w-]+/g, ' ');

  // CSS custom-property names built in a template literal, where the
  // name continues with an interpolation: `--${name}` or `--${k}-foo`.
  s = s.replace(/--\$\{/g, ' ');

  // CSS custom properties and var() refs, plus CLI flags and the bare
  // `--` separator. The defining trait of all of these is that the `--`
  // is NOT preceded by a word character: it sits at a line start, after
  // whitespace, or after a delimiter such as `(`, `:`, `,`, `'`, `"`.
  // A prose dash, by contrast, is glued to the word before it
  // ("word--word"), so it is preceded by a letter and survives this
  // strip to be caught below.
  s = s.replace(/(^|[\s(:,;'"`[{])--(\$\{|[\w][\w-]*|(?=\s|$))/g, '$1 ');

  // What remains: any `--` now is glued to a word on its left, e.g.
  // "word--word" used mid sentence, which is the dash misuse we catch.
  return s.includes('--');
}

/** Recursively gather scannable files under a directory. */
function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      if (entry.startsWith('.') && entry !== '.github') continue;
      walk(full, out);
    } else if (st.isFile()) {
      if (SKIP_FILES.has(entry)) continue;
      if (entry.endsWith('.min.css') || entry.endsWith('.min.js')) continue;
      if (SCAN_EXT.has(extname(entry))) out.push(full);
    }
  }
  return out;
}

function main() {
  const files = walk(ROOT, []);
  const hits = [];

  for (const file of files) {
    let text;
    try {
      text = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const lines = text.split('\n');
    lines.forEach((line, idx) => {
      const reasons = violationsInLine(line);
      if (reasons.length > 0) {
        hits.push({
          file: relative(ROOT, file),
          line: idx + 1,
          reasons,
          text: line.trim().slice(0, 120),
        });
      }
    });
  }

  if (hits.length === 0) {
    console.log(
      `check-dashes: clean. Scanned ${files.length} files, no banned dashes found.`,
    );
    process.exit(0);
  }

  console.error(`check-dashes: found ${hits.length} offending line(s):\n`);
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}  (${h.reasons.join('; ')})`);
    console.error(`    > ${h.text}`);
  }
  console.error(
    '\nReplace dashes with commas, colons, semicolons, periods, or parentheses.',
  );
  process.exit(1);
}

main();
