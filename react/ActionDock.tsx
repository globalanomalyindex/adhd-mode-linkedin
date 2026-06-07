// react/ActionDock.tsx
//
// The Action Dock as a typed, accessible React component. This is the
// React-stack twin of the zero-dependency vanilla prototype in
// prototype/demo.html; both share the Reaction type from lib/types and
// implement the same interaction documented in figma-spec/action-dock.md.
//
// The spec's accessibility contract previously lived only in prose. This
// component makes it real, testable code:
//   - Comment + React FABs are role=button with aria-labels
//   - React FAB has aria-expanded synced to dock state
//   - each reaction slot is role=button, aria-label "React with <Name>"
//   - Tab reaches the FABs; when expanded, ArrowLeft/ArrowRight provide
//     roving focus (roving tabindex) across the slots
//   - Enter/Space activates; Escape collapses and returns focus to React FAB
//   - focus-visible rings; every interactive target is at least 44x44 CSS px
//
// Motion lives in ActionDock.css (transform/opacity only, canon easings,
// exit faster than enter, staggered slots, prefers-reduced-motion honored).

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import type { Reaction } from '../lib/types';
import './ActionDock.css';

// ---------------------------------------------------------------------------
// Reaction order + presentation
//
// Order mirrors lib/gestures.js REACTIONS_ORDER exactly (canon section 10):
// the shared contract is the single source of truth so the React dock and the
// vanilla lib stay in lockstep. Kept inline (not imported) because gestures.js
// is plain ESM JS; importing the value would not change the order and would
// couple the component to the lib's runtime. The order is asserted in tests.
// ---------------------------------------------------------------------------

const REACTIONS_ORDER: readonly Reaction[] = [
  'like',
  'celebrate',
  'support',
  'love',
  'insightful',
  'funny',
] as const;

const REACTION_EMOJI: Record<Reaction, string> = {
  like: '\u{1F44D}',
  celebrate: '\u{1F389}',
  support: '\u{1F91D}',
  love: '❤️',
  insightful: '\u{1F4A1}',
  funny: '\u{1F604}',
};

const REACTION_LABEL: Record<Reaction, string> = {
  like: 'Like',
  celebrate: 'Celebrate',
  support: 'Support',
  love: 'Love',
  insightful: 'Insightful',
  funny: 'Funny',
};

// ---------------------------------------------------------------------------
// Dock state machine
//
// The full spec models three states (collapsed, expanded-tap-source,
// expanded-drag-source). The React version simplifies to collapsed / expanded
// because the source of the expansion (tap vs drag) does not change the
// component's a11y behavior or rendered output; it only matters to the gesture
// engine, which is out of scope here. The simplification is documented in
// react/README.md. The reducer is intentionally small and explicit so the
// transitions map onto the spec's diagram.
// ---------------------------------------------------------------------------

type DockState = { expanded: boolean };

type DockAction =
  | { type: 'EXPAND' }
  | { type: 'COLLAPSE' }
  | { type: 'TOGGLE' }
  | { type: 'SYNC'; expanded: boolean };

function dockReducer(state: DockState, action: DockAction): DockState {
  switch (action.type) {
    case 'EXPAND':
      return state.expanded ? state : { expanded: true };
    case 'COLLAPSE':
      return state.expanded ? { expanded: false } : state;
    case 'TOGGLE':
      return { expanded: !state.expanded };
    case 'SYNC':
      return state.expanded === action.expanded
        ? state
        : { expanded: action.expanded };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ActionDockProps {
  /**
   * Reactions to render as slots, in display order. Defaults to the canonical
   * REACTIONS_ORDER (lib/gestures.js) so a bare <ActionDock /> matches the lib.
   */
  reactions?: Reaction[];
  /** Called with the chosen reaction when a slot is activated. */
  onReact: (r: Reaction) => void;
  /** Called when the Comment FAB is activated. */
  onComment: () => void;
  /** Controlled expanded state. When provided, the component is controlled. */
  expanded?: boolean;
  /** Initial expanded state for the uncontrolled component. Defaults false. */
  defaultExpanded?: boolean;
  /** Notified on every expand/collapse, for controlled and uncontrolled use. */
  onExpandedChange?: (b: boolean) => void;
  /** Optional extra class on the dock root. */
  className?: string;
}

// Comment icon: Lucide message-circle. React icons: Lucide smile + x.
// Inlined SVGs keep the component zero-dependency (no icon library).

function CommentIcon() {
  return (
    <svg
      className="action-dock__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
    </svg>
  );
}

function SmileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      width={24}
      height={24}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      width={22}
      height={22}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ActionDock({
  reactions = [...REACTIONS_ORDER],
  onReact,
  onComment,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  className,
}: ActionDockProps) {
  const isControlled = expandedProp !== undefined;

  const [state, dispatch] = useReducer(dockReducer, {
    expanded: isControlled ? expandedProp : defaultExpanded,
  });

  // When controlled, mirror the prop into the reducer so the rendered state
  // and the machine never drift.
  useEffect(() => {
    if (isControlled) {
      dispatch({ type: 'SYNC', expanded: expandedProp });
    }
  }, [isControlled, expandedProp]);

  const expanded = isControlled ? expandedProp : state.expanded;

  const reactFabRef = useRef<HTMLButtonElement>(null);
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Index of the slot that currently holds tabindex=0 (roving tabindex). Held
  // in state so the rendered tabIndex attributes stay in sync with focus: if
  // the user Tabs out of and back into the tray, the last-focused slot is the
  // one that receives focus.
  const [rovingIndex, setRovingIndex] = useState(0);

  // setExpanded routes through both the controlled callback and (when
  // uncontrolled) the local reducer. Single funnel for every transition.
  const setExpanded = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        dispatch({ type: next ? 'EXPAND' : 'COLLAPSE' });
      }
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange],
  );

  const collapseAndRestoreFocus = useCallback(() => {
    setExpanded(false);
    // Return focus to the React FAB per the a11y contract.
    reactFabRef.current?.focus();
  }, [setExpanded]);

  // Reset the roving index whenever the tray opens so focus management starts
  // from the first slot. The actual focus move only happens on Arrow keys, not
  // on open, to avoid stealing focus from the React FAB the user just pressed.
  useEffect(() => {
    if (expanded) {
      setRovingIndex(0);
    }
  }, [expanded]);

  const focusSlot = useCallback((index: number) => {
    setRovingIndex(index);
    slotRefs.current[index]?.focus();
  }, []);

  const handleReactFabClick = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);

  const handleReactFabKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Escape' && expanded) {
        e.preventDefault();
        collapseAndRestoreFocus();
        return;
      }
      // When expanded, ArrowLeft/ArrowRight from the FAB enter the tray.
      if (expanded && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const enterIndex =
          e.key === 'ArrowLeft' ? reactions.length - 1 : 0;
        focusSlot(enterIndex);
      }
    },
    [expanded, collapseAndRestoreFocus, focusSlot, reactions.length],
  );

  const commitReaction = useCallback(
    (reaction: Reaction) => {
      onReact(reaction);
      collapseAndRestoreFocus();
    },
    [onReact, collapseAndRestoreFocus],
  );

  const handleSlotKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (e.key) {
        case 'ArrowRight': {
          e.preventDefault();
          const next = (index + 1) % reactions.length;
          focusSlot(next);
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          const prev = (index - 1 + reactions.length) % reactions.length;
          focusSlot(prev);
          break;
        }
        case 'Home': {
          e.preventDefault();
          focusSlot(0);
          break;
        }
        case 'End': {
          e.preventDefault();
          focusSlot(reactions.length - 1);
          break;
        }
        case 'Enter':
        case ' ':
        case 'Spacebar': {
          e.preventDefault();
          commitReaction(reactions[index]);
          break;
        }
        case 'Escape': {
          e.preventDefault();
          collapseAndRestoreFocus();
          break;
        }
        default:
          break;
      }
    },
    [reactions, focusSlot, commitReaction, collapseAndRestoreFocus],
  );

  return (
    <div className={`action-dock${className ? ` ${className}` : ''}`}>
      {/* LEFT: Comment FAB */}
      <button
        type="button"
        className="action-dock__fab action-dock__comment"
        aria-label="Write a comment"
        onClick={onComment}
      >
        <CommentIcon />
      </button>

      {/* RIGHT: React FAB + expanding tray */}
      <div className="action-dock__react" data-state={expanded ? 'expanded' : 'collapsed'}>
        <div className="action-dock__react-shell" aria-hidden="true" />

        {/* Reaction tray: slots use roving tabindex. */}
        <div
          className="action-dock__tray"
          role="group"
          aria-label="Reactions"
        >
          {reactions.map((reaction, index) => {
            const isRoving = index === rovingIndex;
            const style = {
              ['--ad-slot-i' as keyof CSSProperties]: String(index),
            } as CSSProperties;
            return (
              <button
                key={reaction}
                type="button"
                ref={(el) => {
                  slotRefs.current[index] = el;
                }}
                className="action-dock__slot"
                style={style}
                aria-label={`React with ${REACTION_LABEL[reaction]}`}
                // Roving tabindex: exactly one slot is tabbable at a time, and
                // only when the tray is open. Closed tray slots are fully out
                // of the tab order and hidden from assistive tech.
                tabIndex={expanded && isRoving ? 0 : -1}
                aria-hidden={expanded ? undefined : true}
                onClick={() => commitReaction(reaction)}
                onKeyDown={(e) => handleSlotKeyDown(e, index)}
                onFocus={() => setRovingIndex(index)}
              >
                <span aria-hidden="true">{REACTION_EMOJI[reaction]}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          ref={reactFabRef}
          className="action-dock__fab action-dock__react-btn"
          aria-label={expanded ? 'Close reactions' : 'Add a reaction'}
          aria-expanded={expanded}
          onClick={handleReactFabClick}
          onKeyDown={handleReactFabKeyDown}
        >
          <span className="action-dock__react-icon action-dock__react-icon--smile">
            <SmileIcon />
          </span>
          <span className="action-dock__react-icon action-dock__react-icon--close">
            <CloseIcon />
          </span>
        </button>
      </div>
    </div>
  );
}

export default ActionDock;
