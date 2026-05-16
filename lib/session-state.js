// lib/session-state.js
import { RESURFACING_REACTIONS } from './spaced-repetition.js';

const RESURFACE_SET = new Set(RESURFACING_REACTIONS);

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

export function send(session, event) {
  switch (session.state) {
    case 'entry':
      if (event.type === 'START_SETUP') return { ...session, state: 'setup' };
      return session;

    case 'setup':
      if (event.type === 'BEGIN') {
        return {
          ...session,
          state: 'active',
          mode: event.mode,
          durationSec: event.durationSec,
          postCap: event.postCap,
          startedAt: Date.now(),
        };
      }
      return session;

    case 'active': {
      if (event.type === 'TIME_UP' || event.type === 'WRAP') {
        return { ...session, state: 'end' };
      }
      if (event.type === 'CARD_SEEN') {
        const next = { ...session, cardsSeen: session.cardsSeen + 1 };
        if (next.cardsSeen >= session.postCap) {
          return { ...next, state: 'checkpoint' };
        }
        return next;
      }
      if (event.type === 'REACT') {
        return {
          ...session,
          reactionsSent: session.reactionsSent + 1,
          queueAdds: session.queueAdds + (RESURFACE_SET.has(event.reaction) ? 1 : 0),
        };
      }
      return session;
    }

    case 'checkpoint':
      if (event.type === 'CONTINUE') return { ...session, state: 'active' };
      if (event.type === 'WRAP') return { ...session, state: 'end' };
      return session;

    case 'end':
      if (event.type === 'CLOSE') return { ...session, state: 'exit' };
      return session;

    default:
      return session;
  }
}
