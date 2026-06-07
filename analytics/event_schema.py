"""Event taxonomy as typed Python.

This mirrors docs/build-canon.md section 9 (event taxonomy) and the TypeScript
declarations in lib/types.d.ts. Field names match the canon EXACTLY so the JSONL
the generator writes is the same shape the running app would emit from its
reducer sink (lib/session-state.js send()).

ALL DATA produced and consumed by this pipeline is SYNTHETIC and illustrative.
Nothing here is a measured result.

The event union is discriminated on the literal "type" field, just like the TS
SessionEvent union. We use TypedDict so the dicts round-trip to JSON with no
serialization step, and so the field names stay literal in source where a
reviewer can diff them against the canon.
"""

from __future__ import annotations

import sys

# TypedDict with `Literal` lives in typing on 3.8+. On 3.9 (the interpreter this
# repo ships against) both are present. We import defensively so the module also
# loads on installs where typing_extensions backfills older runtimes.
try:
    from typing import Literal, TypedDict, Union
except ImportError:  # pragma: no cover - only on very old runtimes
    from typing_extensions import Literal, TypedDict, Union  # type: ignore


# The six LinkedIn reactions, in dock display order (canon section 4).
# Order matches gestures.js REACTIONS_ORDER:
#   like, celebrate, support, love, insightful, funny.
Reaction = Literal["like", "celebrate", "support", "love", "insightful", "funny"]

# The three reactions that seed a resurface (canon section 4).
ResurfacingReaction = Literal["insightful", "support", "love"]

# Session mode. Mirrors the analytics session_started.mode field.
SessionMode = Literal["focus", "reengage"]

# Why a session ended (canon section 9 session_wrapped.reason).
WrapReason = Literal["timebox", "postcap", "user_closed", "abandoned"]

# The set form is handy for the generator and metrics; keep it in lockstep with
# the literal above. spaced-repetition.js RESURFACING_REACTIONS is the source of
# truth in the running app.
RESURFACING_REACTIONS = ("insightful", "support", "love")

# Reaction -> first resurface interval in days (canon section 4).
# Non-resurfacing reactions are absent from this map.
RESURFACE_INTERVAL_DAYS = {
    "insightful": 3,
    "support": 7,
    "love": 14,
}


class SessionStartedEvent(TypedDict):
    type: Literal["session_started"]
    mode: SessionMode
    time_box_s: int
    post_cap: int
    ts: int


class CardSeenEvent(TypedDict):
    type: Literal["card_seen"]
    post_id: str
    dwell_ms: int
    is_resurfaced: bool
    ts: int


class LongPostReflowedEvent(TypedDict):
    type: Literal["long_post_reflowed"]
    post_id: str
    expanded: bool
    ts: int


class ReactionCommittedEvent(TypedDict):
    type: Literal["reaction_committed"]
    post_id: str
    reaction: Reaction
    seeds_resurface: bool
    via: Literal["tap", "drag"]
    ts: int


class PostSkippedEvent(TypedDict):
    type: Literal["post_skipped"]
    post_id: str
    via: Literal["swipe", "key"]
    ts: int


class CheckpointShownEvent(TypedDict):
    type: Literal["checkpoint_shown"]
    posts_seen: int
    elapsed_s: int
    ts: int


class RecallProbeEvent(TypedDict):
    """Research build only (canon section 5)."""

    type: Literal["recall_probe"]
    post_id: str
    correct: bool
    ts: int


class SessionWrappedEvent(TypedDict):
    type: Literal["session_wrapped"]
    reason: WrapReason
    posts_seen: int
    elapsed_s: int
    resurfaced_count: int
    # settledness_delta is nullable in the canon: a session can end without a
    # post self-report (for example an abandoned session).
    settledness_delta: "float | None"
    ts: int


# The full event row written to one JSONL line. Every variant shares the
# discriminating "type" key. We carry two non-canonical envelope fields the
# running app would attach at the sink boundary, not inside the reducer:
#   session_id: groups rows into a session for analysis
#   build: "research" or "production" so probe-only metrics can be filtered
# These are clearly outside canon section 9 and are documented as envelope-only.
SessionEvent = Union[
    SessionStartedEvent,
    CardSeenEvent,
    LongPostReflowedEvent,
    ReactionCommittedEvent,
    PostSkippedEvent,
    CheckpointShownEvent,
    RecallProbeEvent,
    SessionWrappedEvent,
]


# Canonical event type names, for validation in the metrics loader.
EVENT_TYPES = frozenset(
    {
        "session_started",
        "card_seen",
        "long_post_reflowed",
        "reaction_committed",
        "post_skipped",
        "checkpoint_shown",
        "recall_probe",
        "session_wrapped",
    }
)


def seeds_resurface(reaction: str) -> bool:
    """True when a reaction schedules the post to come back (canon section 4)."""
    return reaction in RESURFACING_REACTIONS


if __name__ == "__main__":
    # Tiny self-check so `python analytics/event_schema.py` is not a silent no-op.
    assert seeds_resurface("insightful") is True
    assert seeds_resurface("like") is False
    # The eight canon section 9 event types are all present.
    assert len(EVENT_TYPES) == 8
    assert "recall_probe" in EVENT_TYPES
    # The resurfacing reactions and their interval map agree.
    assert set(RESURFACING_REACTIONS) == set(RESURFACE_INTERVAL_DAYS)
    print("event_schema: SYNTHETIC taxonomy OK on Python", sys.version.split()[0])
