// react/setup-tests.ts
// Vitest setup for the React (.tsx) test environment. Adds the jest-dom
// matchers (toBeInTheDocument, toHaveAttribute, toHaveFocus, ...) and a
// matchMedia stub so prefers-reduced-motion code paths can be exercised
// under jsdom, which does not implement matchMedia.

import '@testing-library/jest-dom/vitest';

if (typeof window !== 'undefined' && !window.matchMedia) {
  // Default stub: nothing matches. Individual tests may override
  // window.matchMedia to simulate prefers-reduced-motion: reduce.
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
