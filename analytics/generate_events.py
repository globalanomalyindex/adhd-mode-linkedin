"""Deterministic fixture generator for a synthetic measurement rehearsal.

Every row this writes is synthetic. The generator exists to exercise event
validation, metric transforms, report formatting, and figure generation. It is
not observed behavior, a study result, or evidence that the product works.

What it produces
----------------
analytics/sample_events.jsonl: one JSON object per line, each a canon section 9
event (see event_schema.py), wrapped with two envelope fields (session_id,
build) that the running app would attach at the sink boundary.

Simulation shape
----------------
- About 40 sessions, split across both modes: "focus" (the bounded, intentional
  session) and "reengage" (a re-entry session that surfaces the resurface queue).
- Each session draws from the six canonical posts (canon section 3). Three of
  them can resurface (Priya/Support, Maya/Insightful, plus Love when given);
  three are ephemeral.
- Long posts (Priya, Maya, Daniel by canon section 3 bodies) get a
  long_post_reflowed event and, in the research build, a comprehension probe.
- Resurfaced posts at their second touch get a recall_probe. Fresh posts form an
  illustrative nonresurfaced comparison arm. The arms are not randomized,
  matched, counterbalanced, or evidence about people.
- Settledness is sampled before and after each session; the delta is attached to
  session_wrapped. A small share of fixture sessions move toward lower
  settledness so that code path is exercised.

Baked-in fixture probabilities
------------------------------
The apparent differences are inputs, not discoveries. Resurfaced recall is
sampled at 0.78 vs 0.55 for the comparison arm. TL;DR-first comprehension is
sampled at 0.80 vs 0.62 for full-text-first. Intentional endings and positive
settledness shifts are also encoded below. The output only proves the pipeline
can preserve and summarize those authored differences.

Determinism
-----------
A single seed (SEED) drives one numpy Generator. Re-running reproduces the file
byte for byte. Timestamps are derived from a fixed BASE_TS so even the ts fields
are stable across runs.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from event_schema import RESURFACE_INTERVAL_DAYS, validate_event

# --- Reproducibility knobs ---------------------------------------------------

SEED = 7
# About 40 primary sessions keeps the generated file inspectable. Probe arms
# draw from subsets, so each transform also exercises uneven fixture counts.
N_SESSIONS = 42
# Fixed anchor so timestamps are deterministic. 2026-01-05 12:00:00 UTC in ms.
BASE_TS = 1_767_614_400_000
DAY_MS = 86_400_000

OUT_PATH = Path(__file__).resolve().parent / "sample_events.jsonl"

# --- Canonical feed (canon section 3) ----------------------------------------
# id, author, whether the body is long enough to reflow, and the reaction that
# (if given) seeds a resurface. "ephemeral" posts never resurface.

POSTS = [
    {"id": "priya", "author": "Priya Nair", "long": True, "resurface_reaction": "support"},
    {"id": "james", "author": "James Park", "long": False, "resurface_reaction": None},
    {"id": "maya", "author": "Maya Chen", "long": True, "resurface_reaction": "insightful"},
    {"id": "acme", "author": "Acme Cloud", "long": False, "resurface_reaction": None},
    {"id": "daniel", "author": "Daniel Okafor", "long": True, "resurface_reaction": "love"},
    {"id": "lena", "author": "Lena Fischer", "long": False, "resurface_reaction": None},
]
POST_BY_ID = {p["id"]: p for p in POSTS}
LONG_POST_IDS = [p["id"] for p in POSTS if p["long"]]

# Preset bounds (canon section 2): time box seconds -> soft post cap.
PRESETS = [
    {"time_box_s": 5 * 60, "post_cap": 8},
    {"time_box_s": 12 * 60, "post_cap": 15},
    {"time_box_s": 20 * 60, "post_cap": 25},
]

# --- Authored fixture probabilities (SYNTHETIC, documented above) ------------

RECALL_P_RESURFACED = 0.78
RECALL_P_COMPARISON = 0.55
COMPREHENSION_P_TLDR_FIRST = 0.80
COMPREHENSION_P_FULLTEXT_FIRST = 0.62
P_RESURFACED_DISMISSED = 0.22

# Share of sessions that end intentionally vs abandoned.
P_ABANDONED = 0.15
# Within intentional ends, how the reason splits.
INTENTIONAL_REASONS = ["timebox", "postcap", "user_closed"]
INTENTIONAL_REASON_WEIGHTS = [0.45, 0.30, 0.25]

# Settledness self-report (1..5) before/after. The fixture includes some sessions
# with worsened settledness so that harm-signal path is non-zero. The delta is sampled
# on a continuous scale, then the after-report is rounded to the nearest whole
# point and clamped to 1..5; the stored delta is the difference of the integer
# endpoints, so it stays a valid 5-point-scale shift.
SETTLEDNESS_DELTA_MEAN = 1.0
SETTLEDNESS_DELTA_SD = 1.05


def _ts(session_idx: int, step: int) -> int:
    """Deterministic, monotonic-ish epoch ms for a (session, step).

    Each session is spaced one simulated day apart so that resurface
    second-touches in a later "reengage" session read as genuinely later in
    time, not interleaved with the first touch.
    """
    return BASE_TS + session_idx * DAY_MS + step * 1500


def _emit(rows, session_id, build, event):
    """Attach the envelope (session_id, build) and append one event row."""
    row = {"session_id": session_id, "build": build}
    row.update(event)
    validate_event(row, require_envelope=True)
    rows.append(row)


def _bernoulli(rng: np.random.Generator, p: float) -> bool:
    return bool(rng.random() < p)


def generate():
    rng = np.random.default_rng(SEED)
    rows: list[dict] = []

    # Track posts a user reacted-to-resurface in earlier focus sessions so a
    # later reengage session can surface them as a real second touch.
    # Keyed by a synthetic user bucket; we keep it simple with a global pool
    # because every session here belongs to one illustrative cohort.
    pending_resurface: list[dict] = []

    for s in range(N_SESSIONS):
        session_id = f"s{ s:03d}"
        # Roughly 60% focus, 40% reengage. Reengage sessions are the ones that
        # replay the resurface queue and carry the second-touch recall probes.
        mode = "focus" if _bernoulli(rng, 0.6) else "reengage"
        # Research build emits probes; production build does not. Bias toward the
        # research build so the Tier 1 probe metrics have enough samples, but
        # keep some production sessions so the loader's build filter is exercised.
        build = "research" if _bernoulli(rng, 0.8) else "production"

        preset = PRESETS[int(rng.integers(0, len(PRESETS)))]
        time_box_s = preset["time_box_s"]
        post_cap = preset["post_cap"]

        step = 0
        _emit(
            rows,
            session_id,
            build,
            {
                "type": "session_started",
                "mode": mode,
                "time_box_s": time_box_s,
                "post_cap": post_cap,
                "ts": _ts(s, step),
            },
        )
        step += 1

        # Scattered-ish start, weighted low but with room to move either way so
        # the worsened-settledness signal can be non-zero (a clamp at 1
        # would otherwise silently erase the negative tail).
        settledness_before = int(rng.choice([1, 2, 3, 4], p=[0.30, 0.35, 0.25, 0.10]))

        # How many posts this session actually shows. Most sessions land under
        # the soft cap (canon depicted session: 11 of 15). Sample a fraction.
        target_posts = int(round(post_cap * float(rng.uniform(0.55, 0.95))))
        target_posts = max(3, min(target_posts, post_cap))

        # A reengage session leads with up to two due resurfaced items (second
        # touches) before fresh posts, mirroring blendFeed mixing the queue in.
        resurfaced_this_session: list[dict] = []
        if mode == "reengage" and pending_resurface:
            n_due = min(len(pending_resurface), int(rng.integers(1, 4)))
            for _ in range(n_due):
                resurfaced_this_session.append(pending_resurface.pop(0))

        seen_count = 0
        seeded_in_this_session: list[dict] = []
        checkpoint_shown = False

        def emit_checkpoint_if_due():
            """Emit the one-time midpoint check-in when the post midpoint is crossed."""
            nonlocal checkpoint_shown, step
            midpoint = (post_cap + 1) // 2
            if checkpoint_shown or seen_count < midpoint:
                return
            _emit(
                rows,
                session_id,
                build,
                {
                    "type": "checkpoint_shown",
                    "posts_seen": seen_count,
                    "elapsed_s": min(
                        time_box_s,
                        int(time_box_s * seen_count / max(post_cap, 1)),
                    ),
                    "ts": _ts(s, step),
                },
            )
            step += 1
            checkpoint_shown = True

        # 1) Resurfaced second touches first (reengage only).
        for item in resurfaced_this_session:
            post = POST_BY_ID[item["post_id"]]
            dwell = int(rng.normal(5200, 1400))
            dwell = max(800, dwell)
            _emit(
                rows,
                session_id,
                build,
                {
                    "type": "card_seen",
                    "post_id": post["id"],
                    "dwell_ms": dwell,
                    "is_resurfaced": True,
                    "ts": _ts(s, step),
                },
            )
            step += 1
            # Research build: the optional recall probe at the second touch.
            if build == "research":
                correct = _bernoulli(rng, RECALL_P_RESURFACED)
                _emit(
                    rows,
                    session_id,
                    build,
                    {
                        "type": "recall_probe",
                        "post_id": post["id"],
                        "correct": correct,
                        "ts": _ts(s, step),
                    },
                )
                step += 1
            # Exercise the dismiss-without-engage transform for a subset of
            # resurfaced fixture rows. This probability is authored, not observed.
            if _bernoulli(rng, P_RESURFACED_DISMISSED):
                _emit(
                    rows,
                    session_id,
                    build,
                    {
                        "type": "post_skipped",
                        "post_id": post["id"],
                        "via": "swipe" if _bernoulli(rng, 0.8) else "key",
                        "ts": _ts(s, step),
                    },
                )
                step += 1
            seen_count += 1
            emit_checkpoint_if_due()

        # 2) Fresh posts for the rest of the session.
        # Sample without replacement from the canonical six, cycling if the
        # target exceeds six (a session can scroll past the same authors again).
        fresh_needed = max(0, target_posts - seen_count)
        order = list(rng.permutation(len(POSTS)))
        fresh_ids = []
        while len(fresh_ids) < fresh_needed:
            for idx in order:
                fresh_ids.append(POSTS[idx]["id"])
                if len(fresh_ids) >= fresh_needed:
                    break
            order = list(rng.permutation(len(POSTS)))

        for post_id in fresh_ids:
            post = POST_BY_ID[post_id]
            dwell = int(rng.normal(4200, 1600))
            dwell = max(600, dwell)
            _emit(
                rows,
                session_id,
                build,
                {
                    "type": "card_seen",
                    "post_id": post_id,
                    "dwell_ms": dwell,
                    "is_resurfaced": False,
                    "ts": _ts(s, step),
                },
            )
            step += 1
            seen_count += 1
            emit_checkpoint_if_due()

            # Long posts get a reflow event. In the research build we attach a
            # comprehension probe. We A/B the presentation: TL;DR-first vs
            # full-text-first, and bake the comprehension lift into TL;DR-first.
            if post["long"]:
                tldr_first = _bernoulli(rng, 0.5)
                _emit(
                    rows,
                    session_id,
                    build,
                    {
                        "type": "long_post_reflowed",
                        "post_id": post_id,
                        # expanded=False means the reader stayed on the TL;DR;
                        # True means they expanded to full text. We treat
                        # tldr_first as the reflow arm and encode the arm in
                        # `expanded`: TL;DR-first readers more often do NOT need
                        # to expand. The metrics script reads the comprehension
                        # probe, not this flag, for the headline delta; this flag
                        # is recorded for the engagement guardrail view.
                        "expanded": (not tldr_first) or _bernoulli(rng, 0.35),
                        "ts": _ts(s, step),
                    },
                )
                step += 1
                if build == "research":
                    p = (
                        COMPREHENSION_P_TLDR_FIRST
                        if tldr_first
                        else COMPREHENSION_P_FULLTEXT_FIRST
                    )
                    correct = _bernoulli(rng, p)
                    _emit(
                        rows,
                        session_id,
                        build,
                        {
                            "type": "comprehension_probe",
                            "post_id": post_id,
                            "variant": (
                                "tldr_first" if tldr_first else "full_text_first"
                            ),
                            "correct": correct,
                            "ts": _ts(s, step),
                        },
                    )
                    step += 1

            # Decide the interaction: react, skip, or just move on.
            roll = rng.random()
            if roll < 0.40:
                # React. Reaction mix is weighted toward the canonical reactions.
                reaction = str(
                    rng.choice(
                        ["like", "celebrate", "support", "love", "insightful", "funny"],
                        p=[0.30, 0.10, 0.18, 0.07, 0.20, 0.15],
                    )
                )
                seeds = reaction in RESURFACE_INTERVAL_DAYS
                via = "tap" if _bernoulli(rng, 0.7) else "drag"
                _emit(
                    rows,
                    session_id,
                    build,
                    {
                        "type": "reaction_committed",
                        "post_id": post_id,
                        "reaction": reaction,
                        "seeds_resurface": seeds,
                        "via": via,
                        "ts": _ts(s, step),
                    },
                )
                step += 1
                if seeds:
                    interval = RESURFACE_INTERVAL_DAYS[reaction]
                    seeded_in_this_session.append(
                        {"post_id": post_id, "reaction": reaction, "interval": interval}
                    )
            elif roll < 0.62:
                via = "swipe" if _bernoulli(rng, 0.8) else "key"
                _emit(
                    rows,
                    session_id,
                    build,
                    {
                        "type": "post_skipped",
                        "post_id": post_id,
                        "via": via,
                        "ts": _ts(s, step),
                    },
                )
                step += 1
            # else: the user just moved on (no react, no explicit skip).

        # The session itself still ends at the post cap when that bound is hit.
        hit_cap = seen_count >= post_cap

        # Illustrative comparison recall probe (research build only): a
        # nonresurfaced post seen this session gets a recall probe at session
        # end. This is a synthetic comparison arm, not a matched control. We
        # pick one fresh, non-long post id seen this session to avoid mixing
        # with the comprehension arm.
        if build == "research":
            comparison_candidates = [
                pid
                for pid in fresh_ids
                if not POST_BY_ID[pid]["long"]
            ]
            # Probe up to two distinct non-resurfaced posts per research session.
            # Two gives the transform enough rows to exercise the comparison
            # branch without inventing excessive per-session probe volume.
            uniq = list(dict.fromkeys(comparison_candidates))
            rng.shuffle(uniq)
            for comparison_id in uniq[:2]:
                correct = _bernoulli(rng, RECALL_P_COMPARISON)
                _emit(
                    rows,
                    session_id,
                    build,
                    {
                        "type": "recall_probe",
                        "post_id": f"{comparison_id}#comparison",
                        "correct": correct,
                        "ts": _ts(s, step),
                    },
                )
                step += 1

        # End the session. Most end intentionally; a minority are abandoned.
        abandoned = _bernoulli(rng, P_ABANDONED)
        if abandoned:
            reason = "abandoned"
            settledness_delta = None  # no post self-report on abandon
        else:
            if hit_cap and _bernoulli(rng, 0.6):
                reason = "postcap"
            else:
                reason = str(
                    rng.choice(INTENTIONAL_REASONS, p=INTENTIONAL_REASON_WEIGHTS)
                )
            delta_f = float(rng.normal(SETTLEDNESS_DELTA_MEAN, SETTLEDNESS_DELTA_SD))
            settledness_after = settledness_before + delta_f
            # Clamp the after-report to the 1..5 self-report range, then round to
            # whole points (the item is a 5-point scale), and recompute delta so
            # the stored delta is consistent with the clamped endpoints.
            settledness_after = float(np.clip(round(settledness_after), 1, 5))
            settledness_delta = settledness_after - settledness_before

        resurfaced_count = len(seeded_in_this_session)
        elapsed_s = (
            int(rng.uniform(0.85, 1.0) * time_box_s)
            if reason == "timebox"
            else int(rng.uniform(0.4, 0.95) * time_box_s)
        )
        if abandoned:
            elapsed_s = int(rng.uniform(0.1, 0.5) * time_box_s)

        _emit(
            rows,
            session_id,
            build,
            {
                "type": "session_wrapped",
                "reason": reason,
                "posts_seen": seen_count,
                "elapsed_s": elapsed_s,
                "resurfaced_count": resurfaced_count,
                "settledness_delta": settledness_delta,
                "ts": _ts(s, step),
            },
        )
        step += 1

        # Feed this session's freshly-seeded items into the global pending pool
        # so a later reengage session can replay them as second touches.
        for item in seeded_in_this_session:
            pending_resurface.append(item)

        # Simulate a compulsive re-entry tail: a small share of sessions are
        # followed by another start within two minutes. We encode this by
        # emitting an extra session_started for a tiny "re-entry" session right
        # after the wrap, sharing nothing but timing. The harm metric reads the
        # gap between a wrap ts and the next start ts.
        if not abandoned and _bernoulli(rng, 0.08):
            reentry_id = f"{session_id}_re"
            _emit(
                rows,
                reentry_id,
                build,
                {
                    "type": "session_started",
                    "mode": mode,
                    "time_box_s": time_box_s,
                    "post_cap": post_cap,
                    # within two minutes of the wrap: 90s after.
                    "ts": _ts(s, step) + 90_000,
                },
            )
            # Give the re-entry session a tiny body so it is a valid session.
            _emit(
                rows,
                reentry_id,
                build,
                {
                    "type": "session_wrapped",
                    "reason": "user_closed",
                    "posts_seen": 1,
                    "elapsed_s": 40,
                    "resurfaced_count": 0,
                    "settledness_delta": 0.0,
                    "ts": _ts(s, step) + 90_000 + 60_000,
                },
            )

    return rows


def main():
    rows = generate()
    with OUT_PATH.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, separators=(",", ":")))
            fh.write("\n")
    n_sessions = len({r["session_id"] for r in rows})
    print(f"SYNTHETIC event log written: {OUT_PATH}")
    print(f"  rows: {len(rows)}")
    print(f"  sessions (including re-entry stubs): {n_sessions}")
    print(f"  seed: {SEED} (re-running reproduces this file exactly)")
    print("  reminder: every row is SYNTHETIC and illustrative, not measured.")


if __name__ == "__main__":
    main()
