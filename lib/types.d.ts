// lib/types.d.ts
//
// Ambient type layer for the pure vanilla-JS lib. These declarations are
// consumed by the .js source files via JSDoc @typedef imports, e.g.
//   /** @typedef {import('./types').Post} Post */
// Nothing here is emitted: the lib ships as plain ESM .js that the browser
// demo imports directly. This file only feeds `tsc --noEmit --checkJs`.
//
// Field names mirror docs/build-canon.md sections 9 (event taxonomy) and 10
// (lib export contract) exactly. The Python analytics pipeline and these
// types must stay in lockstep.

// Domain primitives

/**
 * The six LinkedIn reactions, in dock display order (canon section 4).
 * Order matches gestures.js REACTIONS_ORDER:
 * like, celebrate, support, love, insightful, funny.
 */
export type Reaction =
  | 'like'
  | 'celebrate'
  | 'support'
  | 'love'
  | 'insightful'
  | 'funny';

/**
 * The three reactions that seed a resurface (canon section 4):
 * insightful, support, love. The other three are ephemeral.
 */
export type ResurfacingReaction = 'insightful' | 'support' | 'love';

/**
 * A feed post. The prototype draws bodies from canon section 3; only `id`,
 * `author`, and `text` are load-bearing for the lib. `role` and `avatarTheme`
 * are presentational metadata used by the prototype renderer.
 */
export interface Post {
  id: string;
  author: string;
  text: string;
  role?: string;
  avatarTheme?: string;
}

// Reflow (reflow.js)

/** Reflow classification kinds returned by classifyPost(). */
export type PostKind = 'short' | 'narrative' | 'mixed';

/** Result of classifyPost(post): whether and how a post should be reflowed. */
export interface PostClassification {
  shouldReflow: boolean;
  kind: PostKind;
  words: number;
}

/** Chunk kinds produced by chunkPost(). */
export type ChunkKind = 'body' | 'tldr';

/**
 * One page of a reflowed (or single-page short) post. `pageIndex` is the
 * zero-based position in the paged sequence; `pageTotal` is the page count.
 */
export interface Chunk {
  kind: ChunkKind;
  text: string;
  pageIndex: number;
  pageTotal: number;
}

// Gestures (gestures.js)

/** A 2D drag delta in CSS pixels relative to the touch origin. */
export interface Delta {
  dx: number;
  dy: number;
}

/** Viewport dimensions used to map horizontal drift to a reaction. */
export interface View {
  width: number;
  height: number;
}

/** The three gesture zones classifyGesture() can resolve to. */
export type GestureZone = 'idle' | 'skip' | 'react';

/** Below-threshold drag: no committed direction yet. */
export interface IdleGesture {
  zone: 'idle';
}

/** Upward drag past threshold: skip the current card. */
export interface SkipGesture {
  zone: 'skip';
  /** 0..1 progress toward the commit threshold. */
  progress: number;
  /** True once the drag has crossed the commit threshold. */
  commit: boolean;
}

/** Downward drag: previews or commits a reaction selected by horizontal drift. */
export interface ReactGesture {
  zone: 'react';
  reaction: Reaction;
  /** 0..1 progress toward the commit threshold. */
  progress: number;
  /** True once the drag has crossed the commit threshold. */
  commit: boolean;
}

/** Discriminated union returned by classifyGesture(). */
export type GestureClass = IdleGesture | SkipGesture | ReactGesture;

// Spaced repetition (spaced-repetition.js)

/** A scheduled resurface entry, produced by schedule() and advanced by advance(). */
export interface ScheduleItem {
  postId: string;
  reaction: ResurfacingReaction;
  exposureCount: number;
  intervalDays: number;
  /** Epoch ms at which this item becomes due. */
  scheduledFor: number;
}

/** Arguments to schedule(). */
export interface ScheduleArgs {
  reaction: Reaction;
  /** Epoch ms "now". */
  now: number;
  postId: string;
}

// Resurface queue (resurface-queue.js)

/** A queue item is a scheduled resurface entry (alias kept for the contract). */
export type QueueItem = ScheduleItem;

/** The resurface queue: a flat list of scheduled items. */
export interface Queue {
  items: ScheduleItem[];
}

/** Arguments to blendFeed(). */
export interface BlendFeedArgs {
  /** Fresh, chronologically ordered posts. */
  fresh: Post[];
  queue: Queue;
  /** Epoch ms "now". */
  now: number;
  /** 0..1 share of the blended feed that may be resurfaced items. */
  mixRatio: number;
  /** Resolves a postId to its Post for insertion into the blend. */
  postLookup: (postId: string) => Post;
}

// Session state machine (session-state.js)

/** Session lifecycle states. */
export type SessionStateName =
  | 'entry'
  | 'setup'
  | 'active'
  | 'checkpoint'
  | 'end'
  | 'exit';

/** Session mode. Mirrors the analytics session_started.mode field. */
export type SessionMode = 'focus' | 'reengage';

/** The reducer's accumulated session record. */
export interface Session {
  state: SessionStateName;
  mode: SessionMode | null;
  durationSec: number | null;
  postCap: number | null;
  cardsSeen: number;
  reactionsSent: number;
  queueAdds: number;
  /** Epoch ms the active phase began, or null before BEGIN. */
  startedAt: number | null;
}

// Reducer action events (input to send())
//
// These are the imperative actions the UI dispatches into the reducer. They are
// distinct from the analytics SessionEvent union (canon section 9), which the
// reducer EMITS to the sink as transitions happen.

/** entry -> setup. */
export interface StartSetupAction {
  type: 'START_SETUP';
}

/** setup -> active, carrying the user-chosen bounds. */
export interface BeginAction {
  type: 'BEGIN';
  mode: SessionMode;
  durationSec: number;
  postCap: number;
}

/**
 * active: a card became visible. The optional fields carry analytics payload
 * for the card_seen event (canon section 9); they are ignored by the reducer's
 * state math and only consumed when a sink is provided.
 */
export interface CardSeenAction {
  type: 'CARD_SEEN';
  post_id?: string;
  dwell_ms?: number;
  is_resurfaced?: boolean;
}

/**
 * active: the user committed a reaction. The optional fields carry analytics
 * payload for the reaction_committed event (canon section 9).
 */
export interface ReactAction {
  type: 'REACT';
  reaction: Reaction;
  post_id?: string;
  via?: 'tap' | 'drag';
}

/** active -> end: the time box elapsed. */
export interface TimeUpAction {
  type: 'TIME_UP';
  /** Optional analytics payload for session_wrapped. */
  settledness_delta?: number | null;
}

/**
 * active|checkpoint -> end: the user wrapped the session via the closure
 * ritual.
 */
export interface WrapAction {
  type: 'WRAP';
  /** Optional analytics payload for session_wrapped. */
  settledness_delta?: number | null;
}

/** checkpoint -> active: the user chose to continue past the cap. */
export interface ContinueAction {
  type: 'CONTINUE';
}

/** end -> exit: the closure ritual completed. */
export interface CloseAction {
  type: 'CLOSE';
}

/** Discriminated union of every action send() accepts. */
export type SessionAction =
  | StartSetupAction
  | BeginAction
  | CardSeenAction
  | ReactAction
  | TimeUpAction
  | WrapAction
  | ContinueAction
  | CloseAction;

// Analytics event taxonomy (canon section 9) and sink
//
// Discriminated union emitted from the session reducer via an injected sink.
// Field names are canonical; the Python pipeline and these TS types must match
// exactly. `ts` is epoch ms on every variant.

export interface SessionStartedEvent {
  type: 'session_started';
  mode: SessionMode;
  time_box_s: number;
  post_cap: number;
  ts: number;
}

export interface CardSeenEvent {
  type: 'card_seen';
  post_id: string;
  dwell_ms: number;
  is_resurfaced: boolean;
  ts: number;
}

export interface LongPostReflowedEvent {
  type: 'long_post_reflowed';
  post_id: string;
  expanded: boolean;
  ts: number;
}

export interface ReactionCommittedEvent {
  type: 'reaction_committed';
  post_id: string;
  reaction: Reaction;
  seeds_resurface: boolean;
  via: 'tap' | 'drag';
  ts: number;
}

export interface PostSkippedEvent {
  type: 'post_skipped';
  post_id: string;
  via: 'swipe' | 'key';
  ts: number;
}

export interface CheckpointShownEvent {
  type: 'checkpoint_shown';
  posts_seen: number;
  elapsed_s: number;
  ts: number;
}

/** Research build only. */
export interface RecallProbeEvent {
  type: 'recall_probe';
  post_id: string;
  correct: boolean;
  ts: number;
}

export interface SessionWrappedEvent {
  type: 'session_wrapped';
  reason: 'timebox' | 'postcap' | 'user_closed' | 'abandoned';
  posts_seen: number;
  elapsed_s: number;
  resurfaced_count: number;
  settledness_delta: number | null;
  ts: number;
}

/** The canonical analytics event union (canon section 9). */
export type SessionEvent =
  | SessionStartedEvent
  | CardSeenEvent
  | LongPostReflowedEvent
  | ReactionCommittedEvent
  | PostSkippedEvent
  | CheckpointShownEvent
  | RecallProbeEvent
  | SessionWrappedEvent;

/**
 * A typed analytics sink. Pass one to send() to receive the canonical
 * SessionEvent objects as reducer transitions happen. Omitting it is a no-op:
 * the reducer stays pure and backward compatible.
 */
export type AnalyticsSink = (e: SessionEvent) => void;
