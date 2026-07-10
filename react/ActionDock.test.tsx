// react/ActionDock.test.tsx
//
// Behavioral tests for the Action Dock. These assert the accessibility
// contract from figma-spec/action-dock.md as executable behavior, not prose:
// roles + aria-labels, aria-expanded sync, roving focus, keyboard activation,
// Escape-to-collapse with focus restoration, and the reduced-motion path.
//
// Driven with @testing-library/react fireEvent (no user-event dependency) so
// the suite stays inside the already-installed devDeps.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, within, fireEvent } from '@testing-library/react';
import { ActionDock } from './ActionDock';

afterEach(cleanup);

// Canonical thumb-ergonomic visual and screen-reader order. The gesture
// engine keeps its separate data order in lib/gestures.js.
const ORDER = ['insightful', 'support', 'love', 'celebrate', 'like', 'funny'];
const LABELS = ['Insightful', 'Support', 'Love', 'Celebrate', 'Like', 'Funny'];

function setup(props: Partial<Parameters<typeof ActionDock>[0]> = {}) {
  const onReact = vi.fn();
  const onComment = vi.fn();
  const utils = render(
    <ActionDock onReact={onReact} onComment={onComment} {...props} />,
  );
  const reactFab = screen.getByRole('button', { name: 'Add a reaction' });
  return { onReact, onComment, reactFab, ...utils };
}

// Open the tray by clicking the React FAB, then return the FAB focused so the
// keyboard tests start from a realistic spot.
function open() {
  const reactFab = screen.getByRole('button', { name: /Add a reaction|Close reactions/ });
  fireEvent.click(reactFab);
  reactFab.focus();
  return reactFab;
}

describe('ActionDock rendering + roles', () => {
  it('renders collapsed by default with both FABs as role=button', () => {
    setup();
    expect(
      screen.getByRole('button', { name: 'Write a comment' }),
    ).toBeInTheDocument();
    const reactFab = screen.getByRole('button', { name: 'Add a reaction' });
    expect(reactFab).toBeInTheDocument();
    expect(reactFab).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders slots in the canonical thumb-ergonomic visual order', () => {
    setup();
    const tray = screen.getByRole('group', { name: 'Reactions' });
    const slots = within(tray).getAllByRole('button', { hidden: true });
    const order = slots.map((s) => s.getAttribute('aria-label'));
    expect(order).toEqual(LABELS.map((l) => `React with ${l}`));
    // The screen-reader order follows the same visual contract.
    expect(LABELS.map((l) => l.toLowerCase())).toEqual(ORDER);
  });

  it('hides reaction slots from the tab order while collapsed', () => {
    setup();
    const tray = screen.getByRole('group', { name: 'Reactions' });
    const slots = within(tray).getAllByRole('button', { hidden: true });
    for (const slot of slots) {
      expect(slot).toHaveAttribute('tabindex', '-1');
      expect(slot).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('gives the FABs the sized class the CSS uses for 44px+ targets', () => {
    setup();
    // jsdom does not lay out, so the 44px min box is asserted through the
    // class contract rather than computed pixels. Both FABs carry the base
    // FAB class whose CSS sets min-width/min-height to 52px.
    expect(
      screen.getByRole('button', { name: 'Add a reaction' }).className,
    ).toContain('action-dock__fab');
    expect(
      screen.getByRole('button', { name: 'Write a comment' }).className,
    ).toContain('action-dock__fab');
  });
});

describe('expansion + aria-expanded sync', () => {
  it('clicking the React FAB expands and sets aria-expanded=true', () => {
    const { reactFab } = setup();
    fireEvent.click(reactFab);
    expect(reactFab).toHaveAttribute('aria-expanded', 'true');
    expect(reactFab).toHaveAccessibleName('Close reactions');
  });

  it('makes reaction slots focusable (roving) once expanded', () => {
    setup();
    open();
    const tray = screen.getByRole('group', { name: 'Reactions' });
    const slots = within(tray).getAllByRole('button');
    // exactly one slot is tabbable (roving tabindex), the first by default
    const tabbable = slots.filter((s) => s.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAccessibleName('React with Insightful');
  });

  it('clicking the React FAB again collapses it', () => {
    const { reactFab } = setup();
    fireEvent.click(reactFab);
    expect(reactFab).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(reactFab);
    expect(reactFab).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('keyboard: roving focus + activation', () => {
  it('ArrowRight from the React FAB enters the first slot', () => {
    setup();
    const reactFab = open();
    fireEvent.keyDown(reactFab, { key: 'ArrowRight' });
    expect(
      screen.getByRole('button', { name: 'React with Insightful' }),
    ).toHaveFocus();
  });

  it('ArrowLeft from the React FAB enters the last slot', () => {
    setup();
    const reactFab = open();
    fireEvent.keyDown(reactFab, { key: 'ArrowLeft' });
    expect(
      screen.getByRole('button', { name: 'React with Funny' }),
    ).toHaveFocus();
  });

  it('ArrowRight moves roving focus to the next slot', () => {
    setup();
    const reactFab = open();
    fireEvent.keyDown(reactFab, { key: 'ArrowRight' }); // -> Insightful (0)
    const insightful = screen.getByRole('button', { name: 'React with Insightful' });
    fireEvent.keyDown(insightful, { key: 'ArrowRight' }); // -> Support (1)
    expect(
      screen.getByRole('button', { name: 'React with Support' }),
    ).toHaveFocus();
  });

  it('ArrowLeft wraps roving focus around the ends', () => {
    setup();
    const reactFab = open();
    fireEvent.keyDown(reactFab, { key: 'ArrowRight' }); // Insightful (0)
    const insightful = screen.getByRole('button', { name: 'React with Insightful' });
    fireEvent.keyDown(insightful, { key: 'ArrowLeft' }); // wraps to Funny (last)
    expect(
      screen.getByRole('button', { name: 'React with Funny' }),
    ).toHaveFocus();
  });

  it('Home / End jump to the first and last slots', () => {
    setup();
    const reactFab = open();
    fireEvent.keyDown(reactFab, { key: 'ArrowRight' }); // Insightful (0)
    const insightful = screen.getByRole('button', { name: 'React with Insightful' });
    fireEvent.keyDown(insightful, { key: 'End' });
    expect(
      screen.getByRole('button', { name: 'React with Funny' }),
    ).toHaveFocus();
    const funny = screen.getByRole('button', { name: 'React with Funny' });
    fireEvent.keyDown(funny, { key: 'Home' });
    expect(
      screen.getByRole('button', { name: 'React with Insightful' }),
    ).toHaveFocus();
  });

  it('Enter on a slot calls onReact with that reaction and collapses', () => {
    const { onReact, reactFab } = setup();
    open();
    fireEvent.keyDown(reactFab, { key: 'ArrowRight' }); // Insightful (0)
    let cur = screen.getByRole('button', { name: 'React with Insightful' });
    fireEvent.keyDown(cur, { key: 'ArrowRight' }); // Support (1)
    cur = screen.getByRole('button', { name: 'React with Support' });
    fireEvent.keyDown(cur, { key: 'Enter' });
    expect(onReact).toHaveBeenCalledTimes(1);
    expect(onReact).toHaveBeenCalledWith('support');
    expect(reactFab).toHaveAttribute('aria-expanded', 'false');
  });

  it('Space on a slot also activates it', () => {
    const { onReact, reactFab } = setup();
    open();
    fireEvent.keyDown(reactFab, { key: 'ArrowRight' }); // Insightful
    const insightful = screen.getByRole('button', { name: 'React with Insightful' });
    fireEvent.keyDown(insightful, { key: ' ' });
    expect(onReact).toHaveBeenCalledWith('insightful');
  });

  it('clicking a slot commits and collapses', () => {
    const { onReact, reactFab } = setup();
    open();
    fireEvent.click(screen.getByRole('button', { name: 'React with Love' }));
    expect(onReact).toHaveBeenCalledWith('love');
    expect(reactFab).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Escape + focus restoration', () => {
  it('Escape from a slot collapses and restores focus to the React FAB', () => {
    const { reactFab } = setup();
    open();
    fireEvent.keyDown(reactFab, { key: 'ArrowRight' }); // focus a slot
    const insightful = screen.getByRole('button', { name: 'React with Insightful' });
    expect(insightful).toHaveFocus();
    fireEvent.keyDown(insightful, { key: 'Escape' });
    expect(reactFab).toHaveAttribute('aria-expanded', 'false');
    expect(reactFab).toHaveFocus();
  });

  it('Escape from the React FAB itself collapses while expanded', () => {
    const { reactFab } = setup();
    open();
    fireEvent.keyDown(reactFab, { key: 'Escape' });
    expect(reactFab).toHaveAttribute('aria-expanded', 'false');
    expect(reactFab).toHaveFocus();
  });
});

describe('Comment FAB', () => {
  it('clicking the Comment FAB calls onComment and leaves the dock collapsed', () => {
    const { onComment, reactFab } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Write a comment' }));
    expect(onComment).toHaveBeenCalledTimes(1);
    expect(reactFab).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('controlled / uncontrolled', () => {
  it('respects the controlled expanded prop and notifies onExpandedChange', () => {
    const onExpandedChange = vi.fn();
    const { rerender } = render(
      <ActionDock
        onReact={vi.fn()}
        onComment={vi.fn()}
        expanded={false}
        onExpandedChange={onExpandedChange}
      />,
    );
    const reactFab = screen.getByRole('button', { name: 'Add a reaction' });
    expect(reactFab).toHaveAttribute('aria-expanded', 'false');

    // Controlled: clicking does not self-expand, it only requests a change.
    fireEvent.click(reactFab);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(reactFab).toHaveAttribute('aria-expanded', 'false');

    // Parent flips the prop -> the component reflects it.
    rerender(
      <ActionDock
        onReact={vi.fn()}
        onComment={vi.fn()}
        expanded={true}
        onExpandedChange={onExpandedChange}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Close reactions' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('honors defaultExpanded for the uncontrolled component', () => {
    render(
      <ActionDock onReact={vi.fn()} onComment={vi.fn()} defaultExpanded />,
    );
    expect(
      screen.getByRole('button', { name: 'Close reactions' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('prefers-reduced-motion path', () => {
  const realMatchMedia = window.matchMedia;
  beforeEach(() => {
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
  });
  afterEach(() => {
    window.matchMedia = realMatchMedia;
  });

  it('renders, expands, and commits without throwing under reduced motion', () => {
    const onReact = vi.fn();
    render(<ActionDock onReact={onReact} onComment={vi.fn()} />);
    const reactFab = screen.getByRole('button', { name: 'Add a reaction' });
    fireEvent.click(reactFab);
    expect(reactFab).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(
      screen.getByRole('button', { name: 'React with Insightful' }),
    );
    expect(onReact).toHaveBeenCalledWith('insightful');
  });
});
