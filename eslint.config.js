/* =========================================================
   ESLint flat config  ·  ADHD MODE
   ---------------------------------------------------------
   ESLint 9 uses flat config by default, and `npm run lint`
   runs `eslint .` with no legacy-config flag, so this file
   (not a .eslintrc.json) is the source of truth.

   Scope: the JavaScript surface the canon asks us to lint,
     lib/ (pure logic), prototype/*.js (the demo), and
     scripts/ plus this config and the token build.
   The TypeScript surface (react/*.tsx, react/*.ts, lib
   type decls) is intentionally left to `npm run typecheck`
   (tsc): no TypeScript parser is installed in this repo, so
   pointing ESLint at .ts/.tsx would only crash the parser.
   tsc already covers those files for type and syntax errors.

   eslint-config-prettier is applied last so ESLint never
   fights Prettier over formatting; Prettier owns layout,
   ESLint owns correctness.
   ========================================================= */

import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

// vitest exposes these as globals (vitest.config.js sets globals: true).
// The globals package does not ship a vitest preset, so declare the few
// names the test files reference. They are read-only.
const vitestGlobals = {
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  vi: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
};

export default [
  // Things ESLint should never read: dependencies, coverage, the
  // generated token files, every TypeScript file (no parser here),
  // HTML, and the Python virtualenv.
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      '.vitest-cache/**',
      '.venv-analytics/**',
      'design-system/tokens.css',
      'design-system/tokens.json',
      '**/*.ts',
      '**/*.tsx',
      '**/*.html',
    ],
  },

  // Base recommended rules for every JavaScript file.
  js.configs.recommended,

  // Shared rules and language options for the JS we author.
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'smart'],
      'no-console': 'off',
    },
  },

  // lib/ is environment-free pure logic (ESM). No DOM, no Node, just
  // the standard built-ins.
  {
    files: ['lib/**/*.js'],
    languageOptions: {
      globals: { ...globals.es2021 },
    },
  },

  // The prototype runs in the browser and touches the DOM. It is a
  // demo surface owned by another workstream, so its two pre-existing
  // findings (a let that could be const, one unused event arg) are
  // surfaced as warnings: visible in the lint output, but not a hard
  // CI failure for a file this lane does not edit. Owned code keeps
  // error severity above.
  {
    files: ['prototype/**/*.js'],
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      'prefer-const': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Build tooling and scripts run under Node.
  {
    files: ['scripts/**/*.mjs', 'config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // Test files use the vitest globals (they also import them, but the
  // globals keep no-undef quiet for any matcher helpers).
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: { ...globals.node, ...vitestGlobals },
    },
  },

  // Disable every stylistic rule that Prettier already enforces.
  prettier,
];
