// lib/session-state.js
/** @typedef {import('./types').Session} Session */
/** @typedef {import('./types').SessionAction} SessionAction */
/** @typedef {import('./types').AnalyticsSink} AnalyticsSink */
/** @typedef {import('./types').Reaction} Reaction */

import { RESURFACING_REACTIONS } from './spaced-repetition.js';

/** @type {Set<Reaction>} */
const RESURFACE_SET = new Set(RESURFACING_REACTIONS);

/**
 * Compile-time exhaustiveness guard. If a discriminated union (the action
 * union or the state-name union) gains a member that the reducer does not
 * account for, the argument here will no longer narrow to `never` and this
 * call fails to compile. At runtime it is a safe no-op, so the guard adds
 * type-level safety without changing behavior.
 * @param {never} _x
 * @returns {void}
 */
function assertNever(_x) {
  // Intentionally empty: type-level exhaustiveness only.
}

/**
 * Exhaustiveness checkpoint over the action union. Every SessionAction.type is
 * enumerated here so that adding a new action variant without teaching the
 * reducer about it fails compilation at the default branch. This runs only for
 * actions a given state does not consume; it never mutates the session.
 * @param {SessionAction} event
 * @returns {void}
 */
function assertKnownAction(event) {
  switch (event.type) {
    case 'START_SETUP':
    case 'BEGIN':
    case 'CARD_SEEN':
    case 'REACT':
    case 'TIME_UP':
    case 'WRAP':
    case 'CONTINUE':
    case 'CLOSE':
      return;
    default:
      // If a new action type is added to SessionAction without a case above,
      // `event` is no longer `never` here and the build breaks.
      assertNever(event);
  }
}

/**
 * Create a fresh session in the entry state.
 * @returns {Session}
 */
export function createSession() {
  return {
    state: 'entry',
    mode: null,
    durationSec: null,
    postCap: null,
    cardsSeen: 0,
    reactionsSent: 0,
    queueAdds: 0,
    startedAt: null,
  };
}

/**
 * Whole seconds elapsed since the active phase began, or 0 if not yet started.
 * @param {Session} session
 * @param {number} now epoch ms
 * @returns {number}
 */
function elapsedSeconds(session, now) {
  if (session.startedAt == null) return 0;
  return Math.max(0, Math.round((now - session.startedAt) / 1000));
}

/**
 * Reduce a session by one action, returning the next session. The reducer is
 * pure with respect to the returned session. When an optional analytics `sink`
 * is provided, the corresponding canonical SessionEvent objects (canon section
 * 9) are emitted as transitions happen. Omitting the sink changes nothing:
 * the function stays backward compatible with `send(session, event)`.
 *
 * @param {Session} session
 * @param {SessionAction} event
 * @param {AnalyticsSink} [sink] optional typed analytics sink
 * @returns {Session}
 */
export function send(session, event, sink) {
  switch (session.state) {
    case 'entry':
      if (event.type === 'START_SETUP') return { ...session, state: 'setup' };
      return session;

    case 'setup':
      if (event.type === 'BEGIN') {
        const startedAt = Date.now();
        if (sink) {
          sink({
            type: 'session_started',
            mode: event.mode,
            time_box_s: event.durationSec,
            post_cap: event.postCap,
            ts: startedAt,
          });
        }
        return {
          ...session,
          state: 'active',
          mode: event.mode,
          durationSec: event.durationSec,
          postCap: event.postCap,
          startedAt,
        };
      }
      return session;

    case 'active': {
      if (event.type === 'TIME_UP' || event.type === 'WRAP') {
        const ts = Date.now();
        if (sink) {
          sink({
            type: 'session_wrapped',
            reason: event.type === 'TIME_UP' ? 'timebox' : 'user_closed',
            posts_seen: session.cardsSeen,
            elapsed_s: elapsedSeconds(session, ts),
            resurfaced_count: session.queueAdds,
            settledness_delta: event.settledness_delta ?? null,
            ts,
          });
        }
        return { ...session, state: 'end' };
      }
      if (event.type === 'CARD_SEEN') {
        const ts = Date.now();
        const next = { ...session, cardsSeen: session.cardsSeen + 1 };
        if (sink) {
          sink({
            type: 'card_seen',
            post_id: event.post_id ?? '',
            dwell_ms: event.dwell_ms ?? 0,
            is_resurfaced: event.is_resurfaced ?? false,
            ts,
          });
        }
        if (next.cardsSeen >= /** @type {number} */ (session.postCap)) {
          if (sink) {
            sink({
              type: 'checkpoint_shown',
              posts_seen: next.cardsSeen,
              elapsed_s: elapsedSeconds(session, ts),
              ts,
            });
          }
          return { ...next, state: 'checkpoint' };
        }
        return next;
      }
      if (event.type === 'REACT') {
        const seeds = RESURFACE_SET.has(event.reaction);
        if (sink) {
          sink({
            type: 'reaction_committed',
            post_id: event.post_id ?? '',
            reaction: event.reaction,
            seeds_resurface: seeds,
            via: event.via ?? 'tap',
            ts: Date.now(),
          });
        }
        return {
          ...session,
          reactionsSent: session.reactionsSent + 1,
          queueAdds: session.queueAdds + (seeds ? 1 : 0),
        };
      }
      return session;
    }

    case 'checkpoint':
      if (event.type === 'CONTINUE') return { ...session, state: 'active' };
      if (event.type === 'WRAP') {
        const ts = Date.now();
        if (sink) {
          sink({
            type: 'session_wrapped',
            reason: 'user_closed',
            posts_seen: session.cardsSeen,
            elapsed_s: elapsedSeconds(session, ts),
            resurfaced_count: session.queueAdds,
            settledness_delta: event.settledness_delta ?? null,
            ts,
          });
        }
        return { ...session, state: 'end' };
      }
      return session;

    case 'end':
      if (event.type === 'CLOSE') return { ...session, state: 'exit' };
      return session;

    case 'exit':
      return session;

    default: {
      // Exhaustiveness on the state union: every SessionStateName is handled
      // above. If a new state is added without a case, `session.state` is no
      // longer `never` here and compilation fails.
      assertNever(session.state);
      // Exhaustiveness on the action union: an unknown event type fails
      // compilation inside assertKnownAction. Runtime stays a safe no-op.
      assertKnownAction(event);
      return session;
    }
  }
}
