#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, normalize, resolve } from 'node:path';

const root = resolve(process.cwd());
const pages = [
  'index.html',
  'case-study/index.html',
  'prototype/demo.html',
  'prototype/index.html',
  ...readdirSync(join(root, 'screens'))
    .filter((name) => name.endsWith('.html'))
    .map((name) => `screens/${name}`),
];

const referencePattern = /\b(?:href|src)=["']([^"']+)["']/g;
const ignoredProtocol = /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i;
let checked = 0;
const missing = [];

for (const page of pages) {
  const html = readFileSync(join(root, page), 'utf8');
  for (const match of html.matchAll(referencePattern)) {
    const reference = match[1];
    if (!reference || ignoredProtocol.test(reference)) continue;

    const clean = reference.split(/[?#]/, 1)[0];
    if (!clean) continue;
    const path = clean.startsWith('/')
      ? join(root, clean)
      : resolve(root, dirname(page), clean);
    const candidate = normalize(path);
    if (!candidate.startsWith(root)) {
      missing.push(`${page}: ${reference} escapes the repository root`);
      continue;
    }

    checked += 1;
    const resolves = existsSync(candidate)
      ? !statSync(candidate).isDirectory() ||
        existsSync(join(candidate, 'index.html'))
      : false;
    if (!resolves) missing.push(`${page}: ${reference}`);
  }
}

if (missing.length) {
  console.error(
    `check-local-links: ${missing.length} unresolved reference(s):`,
  );
  for (const item of missing) console.error(`  - ${item}`);
  process.exitCode = 1;
} else {
  console.log(
    `check-local-links: ${checked} local references resolve across ${pages.length} pages.`,
  );
}
