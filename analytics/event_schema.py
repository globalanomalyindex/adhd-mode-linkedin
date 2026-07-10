"""Typed event taxonomy plus dependency-free runtime validation.

This mirrors docs/build-canon.md section 9 and lib/types.d.ts. The Python
TypedDicts help static readers, while validate_event() enforces the same
contract for every JSONL row at runtime.

All data produced and consumed by this pipeline is synthetic and illustrative.
Nothing here is a measured result.
"""

from __future__ import annotations

import math
import sys

try:
    from typing import Callable, Literal, Mapping, TypedDict, Union
except ImportError:  # pragma: no cover - only on very old runtimes
    from typing_extensions import Callable, Literal, Mapping, TypedDict, Union  # type: ignore


Reaction = Literal["like", "celebrate", "support", "love", "insightful", "funny"]
ResurfacingReaction = Literal["insightful", "support", "love"]
SessionMode = Literal["focus", "reengage"]
WrapReason = Literal["timebox", "postcap", "user_closed", "abandoned"]
ComprehensionVariant = Literal["tldr_first", "full_text_first"]

REACTIONS = frozenset({"like", "celebrate", "support", "love", "insightful", "funny"})
RESURFACING_REACTIONS = ("insightful", "support", "love")
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
    """Optional recall question in the research build."""

    type: Literal["recall_probe"]
    post_id: str
    correct: bool
    ts: int


class ComprehensionProbeEvent(TypedDict):
    """One-question comprehension check in the research build."""

    type: Literal["comprehension_probe"]
    post_id: str
    variant: ComprehensionVariant
    correct: bool
    ts: int


class SessionWrappedEvent(TypedDict):
    type: Literal["session_wrapped"]
    reason: WrapReason
    posts_seen: int
    elapsed_s: int
    resurfaced_count: int
    settledness_delta: "float | None"
    ts: int


SessionEvent = Union[
    SessionStartedEvent,
    CardSeenEvent,
    LongPostReflowedEvent,
    ReactionCommittedEvent,
    PostSkippedEvent,
    CheckpointShownEvent,
    RecallProbeEvent,
    ComprehensionProbeEvent,
    SessionWrappedEvent,
]


class EventValidationError(ValueError):
    """Raised when one event row violates the canonical runtime contract."""


FieldRule = tuple[str, Callable[[object], bool]]


def _is_string(value: object) -> bool:
    return isinstance(value, str) and bool(value)


def _is_bool(value: object) -> bool:
    return type(value) is bool


def _is_nonnegative_int(value: object) -> bool:
    return type(value) is int and value >= 0


def _is_finite_number_or_none(value: object) -> bool:
    if value is None:
        return True
    return not isinstance(value, bool) and isinstance(value, (int, float)) and math.isfinite(value)


STRING: FieldRule = ("a non-empty string", _is_string)
BOOL: FieldRule = ("a boolean", _is_bool)
NONNEGATIVE_INT: FieldRule = ("a non-negative integer", _is_nonnegative_int)
NUMBER_OR_NONE: FieldRule = ("a finite number or null", _is_finite_number_or_none)


EVENT_SCHEMAS: dict[str, dict[str, FieldRule]] = {
    "session_started": {
        "mode": STRING,
        "time_box_s": NONNEGATIVE_INT,
        "post_cap": NONNEGATIVE_INT,
        "ts": NONNEGATIVE_INT,
    },
    "card_seen": {
        "post_id": STRING,
        "dwell_ms": NONNEGATIVE_INT,
        "is_resurfaced": BOOL,
        "ts": NONNEGATIVE_INT,
    },
    "long_post_reflowed": {
        "post_id": STRING,
        "expanded": BOOL,
        "ts": NONNEGATIVE_INT,
    },
    "reaction_committed": {
        "post_id": STRING,
        "reaction": STRING,
        "seeds_resurface": BOOL,
        "via": STRING,
        "ts": NONNEGATIVE_INT,
    },
    "post_skipped": {
        "post_id": STRING,
        "via": STRING,
        "ts": NONNEGATIVE_INT,
    },
    "checkpoint_shown": {
        "posts_seen": NONNEGATIVE_INT,
        "elapsed_s": NONNEGATIVE_INT,
        "ts": NONNEGATIVE_INT,
    },
    "recall_probe": {
        "post_id": STRING,
        "correct": BOOL,
        "ts": NONNEGATIVE_INT,
    },
    "comprehension_probe": {
        "post_id": STRING,
        "variant": STRING,
        "correct": BOOL,
        "ts": NONNEGATIVE_INT,
    },
    "session_wrapped": {
        "reason": STRING,
        "posts_seen": NONNEGATIVE_INT,
        "elapsed_s": NONNEGATIVE_INT,
        "resurfaced_count": NONNEGATIVE_INT,
        "settledness_delta": NUMBER_OR_NONE,
        "ts": NONNEGATIVE_INT,
    },
}

EVENT_TYPES = frozenset(EVENT_SCHEMAS)

_LITERAL_VALUES = {
    ("session_started", "mode"): frozenset({"focus", "reengage"}),
    ("reaction_committed", "reaction"): REACTIONS,
    ("reaction_committed", "via"): frozenset({"tap", "drag"}),
    ("post_skipped", "via"): frozenset({"swipe", "key"}),
    ("comprehension_probe", "variant"): frozenset({"tldr_first", "full_text_first"}),
    ("session_wrapped", "reason"): frozenset(
        {"timebox", "postcap", "user_closed", "abandoned"}
    ),
}

_ENVELOPE_RULES: dict[str, FieldRule] = {
    "session_id": STRING,
    "build": STRING,
}
_BUILD_VALUES = frozenset({"research", "production"})
_RESEARCH_ONLY_EVENTS = frozenset({"recall_probe", "comprehension_probe"})


def seeds_resurface(reaction: str) -> bool:
    """Return whether a reaction schedules a later touch."""
    return reaction in RESURFACING_REACTIONS


def validate_event(row: object, *, require_envelope: bool = False) -> None:
    """Validate one canonical event, optionally requiring JSONL envelope fields.

    The check is strict by design: required fields, primitive types, literal
    values, and unexpected keys are validated before pandas can coerce them.
    """
    if not isinstance(row, Mapping):
        raise EventValidationError("event must be a JSON object")

    event_type = row.get("type")
    if not isinstance(event_type, str):
        raise EventValidationError("field 'type' must be a string")
    if event_type not in EVENT_SCHEMAS:
        raise EventValidationError(f"unknown event type {event_type!r}")

    schema = EVENT_SCHEMAS[event_type]
    required = {"type", *schema}
    if require_envelope:
        required.update(_ENVELOPE_RULES)

    missing = sorted(required.difference(row))
    if missing:
        raise EventValidationError(f"{event_type}: missing required field(s): {', '.join(missing)}")

    allowed = required.union(_ENVELOPE_RULES)
    unexpected = sorted(set(row).difference(allowed))
    if unexpected:
        raise EventValidationError(f"{event_type}: unexpected field(s): {', '.join(unexpected)}")

    for field, (expected, predicate) in schema.items():
        value = row[field]
        if not predicate(value):
            raise EventValidationError(
                f"{event_type}.{field} must be {expected}; got {type(value).__name__}"
            )

    for field, (expected, predicate) in _ENVELOPE_RULES.items():
        if field in row and not predicate(row[field]):
            raise EventValidationError(
                f"{event_type}.{field} must be {expected}; got {type(row[field]).__name__}"
            )

    if "build" in row and row["build"] not in _BUILD_VALUES:
        raise EventValidationError(
            f"{event_type}.build must be one of {sorted(_BUILD_VALUES)}; got {row['build']!r}"
        )

    for (literal_event, field), values in _LITERAL_VALUES.items():
        if event_type == literal_event and row[field] not in values:
            raise EventValidationError(
                f"{event_type}.{field} must be one of {sorted(values)}; got {row[field]!r}"
            )

    if event_type == "reaction_committed":
        expected_seed = seeds_resurface(str(row["reaction"]))
        if row["seeds_resurface"] is not expected_seed:
            raise EventValidationError(
                "reaction_committed.seeds_resurface does not match the reaction mapping"
            )

    if event_type in _RESEARCH_ONLY_EVENTS and row.get("build") not in (None, "research"):
        raise EventValidationError(f"{event_type} is allowed only in a research build")


def _self_check_rows() -> list[dict]:
    envelope = {"session_id": "self-check", "build": "research"}
    events = [
        {"type": "session_started", "mode": "focus", "time_box_s": 300, "post_cap": 8, "ts": 1},
        {"type": "card_seen", "post_id": "p1", "dwell_ms": 1200, "is_resurfaced": False, "ts": 2},
        {"type": "long_post_reflowed", "post_id": "p1", "expanded": False, "ts": 3},
        {"type": "reaction_committed", "post_id": "p1", "reaction": "support", "seeds_resurface": True, "via": "tap", "ts": 4},
        {"type": "post_skipped", "post_id": "p2", "via": "key", "ts": 5},
        {"type": "checkpoint_shown", "posts_seen": 4, "elapsed_s": 150, "ts": 6},
        {"type": "recall_probe", "post_id": "p1", "correct": True, "ts": 7},
        {"type": "comprehension_probe", "post_id": "p1", "variant": "tldr_first", "correct": True, "ts": 8},
        {"type": "session_wrapped", "reason": "timebox", "posts_seen": 7, "elapsed_s": 300, "resurfaced_count": 1, "settledness_delta": 1.0, "ts": 9},
    ]
    return [{**envelope, **event} for event in events]


if __name__ == "__main__":
    rows = _self_check_rows()
    for sample in rows:
        validate_event(sample, require_envelope=True)
    assert {row["type"] for row in rows} == EVENT_TYPES
    assert set(RESURFACING_REACTIONS) == set(RESURFACE_INTERVAL_DAYS)

    try:
        invalid = dict(rows[0])
        del invalid["ts"]
        validate_event(invalid, require_envelope=True)
    except EventValidationError:
        pass
    else:  # pragma: no cover - protects the validator self-check itself
        raise AssertionError("missing-field validation did not run")

    try:
        invalid = dict(rows[1], dwell_ms=True)
        validate_event(invalid, require_envelope=True)
    except EventValidationError:
        pass
    else:  # pragma: no cover
        raise AssertionError("type validation did not run")

    print(
        f"event_schema: {len(EVENT_TYPES)} event types and runtime validation OK "
        f"on Python {sys.version.split()[0]}"
    )
