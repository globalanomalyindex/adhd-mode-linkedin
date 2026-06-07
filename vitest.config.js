import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // @vitejs/plugin-react transforms .tsx (JSX + the automatic runtime) so the
  // React Action Dock tests run alongside the pure-JS lib tests. The lib stays
  // plain ESM and is untouched by the plugin.
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // Both suites: the existing pure-lib unit tests and the React component
    // tests. Order does not matter; vitest isolates files.
    include: ['lib/**/*.test.js', 'react/**/*.test.tsx'],
    globals: true,
    // jest-dom matchers + matchMedia stub for the React suite. Harmless for the
    // lib suite (it just imports matchers it never uses).
    setupFiles: ['./react/setup-tests.ts'],
  },
});
