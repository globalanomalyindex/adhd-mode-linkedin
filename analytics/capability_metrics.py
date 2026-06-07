"""Capability-first metrics over the synthetic event log.

WARNING: every number this prints and plots is computed from a SYNTHETIC log
(see generate_events.py). It is illustrative. It is not a measured result and is
not a claim about real users.

This script implements the canon section 5 measurement model, in the canon's own
priority order:

  Tier 1 (PRIMARY, what success means):
    - Resurfaced-content recall accuracy vs a non-resurfaced control.
    - Comprehension-after-reflow delta (TL;DR-first vs full-text-first).
    - Intentional completion rate.
    - Mean settledness delta.

  Tier 2 (GUARDRAILS, must not be the success criteria):
    - Opt-in / reaction-mix / resurface acceptance style engagement reads.

  Harm counter-metrics (must fail loudly if they rise):
    - Compulsive re-entry rate.
    - Resurface anxiety (dismiss-without-view on resurfaced items).
    - Rumination increase (share of sessions whose settledness delta is < 0).

The point the case study makes with this: capability is the headline, engagement
is the guardrail. We print Tier 1 first and largest, on purpose.

Run:
  python analytics/generate_events.py
  python analytics/capability_metrics.py
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from event_schema import EVENT_TYPES, RESURFACING_REACTIONS

HERE = Path(__file__).resolve().parent
EVENTS_PATH = HERE / "sample_events.jsonl"
FIG_DIR = HERE / "figures"

# Two minutes, in ms: the compulsive-re-entry window (canon section 5).
REENTRY_WINDOW_MS = 2 * 60 * 1000


def load_events(path: Path = EVENTS_PATH) -> pd.DataFrame:
    """Load the JSONL log into a DataFrame, validating the discriminator.

    Raises a clear error if the file is missing (the usual cause is forgetting
    to run the generator first).
    """
    if not path.exists():
        raise SystemExit(
            f"No event log at {path}.\n"
            "Run the generator first:  python analytics/generate_events.py"
        )
    rows = []
    with path.open(encoding="utf-8") as fh:
        for line_no, line in enumerate(fh, start=1):
            line = line.strip()
            if not line:
                continue
            obj = json.loads(line)
            if obj.get("type") not in EVENT_TYPES:
                raise ValueError(
                    f"line {line_no}: unknown event type {obj.get('type')!r}. "
                    "The log does not match canon section 9."
                )
            rows.append(obj)
    df = pd.DataFrame(rows)
    return df


def _wilson_ci(k: int, n: int, z: float = 1.96):
    """Wilson score interval for a binomial proportion.

    Reported alongside accuracies because the synthetic sample is small. A plain
    point estimate would overstate how settled these numbers are.
    """
    if n == 0:
        return (float("nan"), float("nan"))
    phat = k / n
    denom = 1 + z * z / n
    center = (phat + z * z / (2 * n)) / denom
    half = (z * ((phat * (1 - phat) / n + z * z / (4 * n * n)) ** 0.5)) / denom
    return (max(0.0, center - half), min(1.0, center + half))


def _split_probes(df: pd.DataFrame) -> dict:
    """Separate the single recall_probe channel into its three arms.

    The shipped taxonomy carries one probe event (canon section 9). The
    generator encodes the arm in post_id with a suffix so we can split:
      - "...#comp_tldrfirst" / "...#comp_fulltext": comprehension probes
      - "...#control": non-resurfaced control recall probe
      - everything else on a research-build, is_resurfaced second touch:
        resurfaced recall probe
    """
    probes = df[df["type"] == "recall_probe"].copy()
    if probes.empty:
        return {
            "recall_resurfaced": probes,
            "recall_control": probes,
            "comp_tldr": probes,
            "comp_fulltext": probes,
        }
    probes["arm"] = "recall_resurfaced"
    pid = probes["post_id"].astype(str)
    probes.loc[pid.str.endswith("#control"), "arm"] = "recall_control"
    probes.loc[pid.str.endswith("#comp_tldrfirst"), "arm"] = "comp_tldr"
    probes.loc[pid.str.endswith("#comp_fulltext"), "arm"] = "comp_fulltext"
    return {
        "recall_resurfaced": probes[probes["arm"] == "recall_resurfaced"],
        "recall_control": probes[probes["arm"] == "recall_control"],
        "comp_tldr": probes[probes["arm"] == "comp_tldr"],
        "comp_fulltext": probes[probes["arm"] == "comp_fulltext"],
    }


def _accuracy(frame: pd.DataFrame):
    n = len(frame)
    k = int(frame["correct"].sum()) if n else 0
    acc = k / n if n else float("nan")
    lo, hi = _wilson_ci(k, n)
    return {"n": n, "correct": k, "accuracy": acc, "ci_lo": lo, "ci_hi": hi}


def tier1_recall(df: pd.DataFrame) -> dict:
    """Resurfaced-content recall accuracy vs non-resurfaced control."""
    arms = _split_probes(df)
    res = _accuracy(arms["recall_resurfaced"])
    ctrl = _accuracy(arms["recall_control"])
    delta = (
        res["accuracy"] - ctrl["accuracy"]
        if not (pd.isna(res["accuracy"]) or pd.isna(ctrl["accuracy"]))
        else float("nan")
    )
    return {"resurfaced": res, "control": ctrl, "delta": delta}


def tier1_comprehension(df: pd.DataFrame) -> dict:
    """Comprehension accuracy: TL;DR-first reflow vs full-text-first."""
    arms = _split_probes(df)
    tldr = _accuracy(arms["comp_tldr"])
    full = _accuracy(arms["comp_fulltext"])
    delta = (
        tldr["accuracy"] - full["accuracy"]
        if not (pd.isna(tldr["accuracy"]) or pd.isna(full["accuracy"]))
        else float("nan")
    )
    return {"tldr_first": tldr, "fulltext_first": full, "delta": delta}


def _real_wraps(df: pd.DataFrame) -> pd.DataFrame:
    """session_wrapped rows for primary sessions, excluding re-entry stubs.

    Re-entry stub sessions have a session_id ending in "_re" and exist only to
    drive the compulsive-re-entry harm metric. They are not real sessions for
    the completion-rate or settledness reads.
    """
    wraps = df[df["type"] == "session_wrapped"].copy()
    return wraps[~wraps["session_id"].astype(str).str.endswith("_re")]


def tier1_completion(df: pd.DataFrame) -> dict:
    """Intentional completion rate: intentional ends / all ends."""
    wraps = _real_wraps(df)
    n = len(wraps)
    if n == 0:
        return {"n": 0, "intentional": 0, "rate": float("nan"), "by_reason": {}}
    intentional_mask = wraps["reason"].isin(["timebox", "postcap", "user_closed"])
    intentional = int(intentional_mask.sum())
    by_reason = wraps["reason"].value_counts().to_dict()
    return {
        "n": n,
        "intentional": intentional,
        "rate": intentional / n,
        "by_reason": by_reason,
    }


def tier1_settledness(df: pd.DataFrame) -> dict:
    """Mean settledness delta across sessions that reported one."""
    wraps = _real_wraps(df)
    deltas = wraps["settledness_delta"].dropna()
    n = len(deltas)
    if n == 0:
        return {"n": 0, "mean": float("nan"), "median": float("nan")}
    return {
        "n": n,
        "mean": float(deltas.mean()),
        "median": float(deltas.median()),
        "values": deltas,
    }


def tier2_engagement(df: pd.DataFrame) -> dict:
    """Engagement guardrails: reaction mix, resurface seeding, dwell.

    These confirm the feature is not quietly tanking the business. They are NOT
    the success criteria (canon section 5).
    """
    reactions = df[df["type"] == "reaction_committed"]
    mix = (
        reactions["reaction"].value_counts(normalize=True).round(3).to_dict()
        if not reactions.empty
        else {}
    )
    seed_rate = (
        float(reactions["seeds_resurface"].mean()) if not reactions.empty else float("nan")
    )
    via_mix = (
        reactions["via"].value_counts(normalize=True).round(3).to_dict()
        if not reactions.empty
        else {}
    )
    cards = df[df["type"] == "card_seen"]
    mean_dwell_ms = float(cards["dwell_ms"].mean()) if not cards.empty else float("nan")
    starts = df[df["type"] == "session_started"]
    mode_mix = (
        starts["mode"].value_counts(normalize=True).round(3).to_dict()
        if not starts.empty
        else {}
    )
    return {
        "reaction_mix": mix,
        "resurface_seed_rate": seed_rate,
        "via_mix": via_mix,
        "mean_dwell_ms": mean_dwell_ms,
        "mode_mix": mode_mix,
    }


def harm_reentry(df: pd.DataFrame) -> dict:
    """Compulsive re-entry: a new session_started within two minutes of a wrap."""
    wraps = df[df["type"] == "session_wrapped"][["ts"]].sort_values("ts")
    starts = df[df["type"] == "session_started"][["ts"]].sort_values("ts")
    if wraps.empty:
        return {"wraps": 0, "fast_reentries": 0, "rate": float("nan")}
    fast = 0
    start_ts = starts["ts"].to_numpy()
    for wrap_ts in wraps["ts"].to_numpy():
        # Any start strictly after this wrap and within the window.
        window = start_ts[(start_ts > wrap_ts) & (start_ts <= wrap_ts + REENTRY_WINDOW_MS)]
        if len(window) > 0:
            fast += 1
    n = len(wraps)
    return {"wraps": n, "fast_reentries": fast, "rate": fast / n}


def harm_resurface_anxiety(df: pd.DataFrame) -> dict:
    """Resurface anxiety proxy: dismiss-without-view on resurfaced items.

    We read it as resurfaced cards that were seen but skipped (post_skipped)
    rather than engaged. A rising value would mean the queue became a guilt
    backlog (canon section 5).
    """
    resurfaced_cards = df[(df["type"] == "card_seen") & (df["is_resurfaced"] == True)]  # noqa: E712
    resurfaced_ids = set(resurfaced_cards["post_id"].astype(str))
    if not resurfaced_ids:
        return {"resurfaced_seen": 0, "dismissed": 0, "rate": float("nan")}
    skips = df[df["type"] == "post_skipped"]
    # Match on (session_id, post_id) so we only count a skip of a resurfaced card
    # within the same session it was surfaced.
    res_keys = set(
        zip(resurfaced_cards["session_id"].astype(str), resurfaced_cards["post_id"].astype(str))
    )
    skip_keys = set(
        zip(skips["session_id"].astype(str), skips["post_id"].astype(str))
    )
    dismissed = len(res_keys & skip_keys)
    seen = len(res_keys)
    return {"resurfaced_seen": seen, "dismissed": dismissed, "rate": dismissed / seen}


def harm_rumination(df: pd.DataFrame) -> dict:
    """Rumination increase: share of sessions whose settledness delta is < 0."""
    wraps = _real_wraps(df)
    deltas = wraps["settledness_delta"].dropna()
    n = len(deltas)
    if n == 0:
        return {"n": 0, "worse": 0, "rate": float("nan")}
    worse = int((deltas < 0).sum())
    return {"n": n, "worse": worse, "rate": worse / n}


def _fmt_pct(x: float) -> str:
    return "n/a" if pd.isna(x) else f"{x * 100:.1f}%"


def _fmt_acc(a: dict) -> str:
    if a["n"] == 0:
        return "no samples"
    return (
        f"{_fmt_pct(a['accuracy'])} "
        f"(95% CI {_fmt_pct(a['ci_lo'])} to {_fmt_pct(a['ci_hi'])}, n={a['n']})"
    )


def print_report(df: pd.DataFrame) -> dict:
    """Print the readable report and return the computed numbers as a dict."""
    recall = tier1_recall(df)
    comp = tier1_comprehension(df)
    completion = tier1_completion(df)
    settledness = tier1_settledness(df)
    engagement = tier2_engagement(df)
    reentry = harm_reentry(df)
    anxiety = harm_resurface_anxiety(df)
    rumination = harm_rumination(df)

    line = "=" * 68
    print(line)
    print("FOCUS SESSION CAPABILITY REPORT")
    print("ALL NUMBERS ARE SYNTHETIC AND ILLUSTRATIVE (not measured)")
    print(line)
    n_real_sessions = _real_wraps(df)["session_id"].nunique()
    print(f"primary sessions analyzed: {n_real_sessions}")
    research_rows = df[df.get("build") == "research"] if "build" in df else df
    print(f"research-build rows (carry probes): {len(research_rows)} of {len(df)}")
    print()

    print("TIER 1  capability and outcome metrics  (PRIMARY: what success means)")
    print("-" * 68)
    print("  1) Resurfaced-content recall vs non-resurfaced control")
    print(f"       resurfaced : {_fmt_acc(recall['resurfaced'])}")
    print(f"       control    : {_fmt_acc(recall['control'])}")
    print(f"       delta      : {_fmt_pct(recall['delta'])} (resurfaced minus control)")
    print()
    print("  2) Comprehension after reflow  (TL;DR-first vs full-text-first)")
    print(f"       tldr-first : {_fmt_acc(comp['tldr_first'])}")
    print(f"       full-first : {_fmt_acc(comp['fulltext_first'])}")
    print(f"       delta      : {_fmt_pct(comp['delta'])} (tldr-first minus full-text-first)")
    print()
    print("  3) Intentional completion rate")
    print(
        f"       rate       : {_fmt_pct(completion['rate'])} "
        f"({completion['intentional']} of {completion['n']} ends were intentional)"
    )
    print(f"       by reason  : {completion['by_reason']}")
    print()
    print("  4) Settledness delta  (1..5 self-report, after minus before)")
    if settledness["n"]:
        print(
            f"       mean       : {settledness['mean']:+.2f}  "
            f"median {settledness['median']:+.2f}  (n={settledness['n']})"
        )
    else:
        print("       mean       : no samples")
    print()

    print("TIER 2  engagement metrics  (GUARDRAILS: must not be the success criteria)")
    print("-" * 68)
    print(f"  reaction mix          : {engagement['reaction_mix']}")
    print(f"  resurface seed rate   : {_fmt_pct(engagement['resurface_seed_rate'])}")
    print(f"  reaction via (tap/drag): {engagement['via_mix']}")
    print(f"  mean dwell            : {engagement['mean_dwell_ms'] / 1000:.1f}s")
    print(f"  mode mix              : {engagement['mode_mix']}")
    print()

    print("HARM COUNTER-METRICS  (must fail loudly; rising = the design is hurting)")
    print("-" * 68)
    print(
        f"  compulsive re-entry   : {_fmt_pct(reentry['rate'])} "
        f"({reentry['fast_reentries']} of {reentry['wraps']} wraps within 2 min)"
    )
    print(
        f"  resurface anxiety     : {_fmt_pct(anxiety['rate'])} "
        f"({anxiety['dismissed']} of {anxiety['resurfaced_seen']} resurfaced cards dismissed)"
    )
    print(
        f"  rumination increase   : {_fmt_pct(rumination['rate'])} "
        f"({rumination['worse']} of {rumination['n']} sessions ended more scattered)"
    )
    print(line)
    print("Reading: Tier 1 is the headline. Tier 2 only confirms the feature is")
    print("not tanking the business. The three harm metrics are the brake.")
    print("Reminder: SYNTHETIC data. This demonstrates the measurement design,")
    print("not an outcome.")
    print(line)

    return {
        "recall": recall,
        "comprehension": comp,
        "completion": completion,
        "settledness": settledness,
        "engagement": engagement,
        "harm": {
            "reentry": reentry,
            "resurface_anxiety": anxiety,
            "rumination": rumination,
        },
    }


def save_figures(df: pd.DataFrame, results: dict) -> list:
    """Save 2 to 3 figures if matplotlib is importable. Returns the file paths.

    If matplotlib is not installed the pipeline still completes; it just skips
    the figures and says so.
    """
    try:
        import matplotlib

        matplotlib.use("Agg")  # headless: no display needed
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib not available: skipping figures (numbers above stand).")
        return []

    FIG_DIR.mkdir(exist_ok=True)
    saved = []
    title_tag = "SYNTHETIC, illustrative"

    # Figure 1: Tier 1 capability bars (recall arms + comprehension arms).
    recall = results["recall"]
    comp = results["comprehension"]
    labels = ["recall\ncontrol", "recall\nresurfaced", "comp\nfull-first", "comp\ntldr-first"]
    values = [
        recall["control"]["accuracy"],
        recall["resurfaced"]["accuracy"],
        comp["fulltext_first"]["accuracy"],
        comp["tldr_first"]["accuracy"],
    ]
    colors = ["#b0b7c0", "#0a66c2", "#b0b7c0", "#0a66c2"]
    fig, ax = plt.subplots(figsize=(7, 4.2))
    bars = ax.bar(labels, [v * 100 for v in values], color=colors)
    ax.set_ylabel("accuracy (%)")
    ax.set_ylim(0, 100)
    ax.set_title(f"Tier 1 capability: probe accuracy by arm ({title_tag})")
    for bar, v in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 1.5,
            "n/a" if pd.isna(v) else f"{v * 100:.0f}%",
            ha="center",
            va="bottom",
            fontsize=9,
        )
    fig.tight_layout()
    p1 = FIG_DIR / "fig1_capability_arms.png"
    fig.savefig(p1, dpi=130)
    plt.close(fig)
    saved.append(p1)

    # Figure 2: settledness delta distribution.
    settledness = results["settledness"]
    if settledness["n"]:
        fig, ax = plt.subplots(figsize=(7, 4.2))
        vals = settledness["values"]
        bins = range(-4, 6)
        ax.hist(vals, bins=bins, color="#128161", edgecolor="white", align="left")
        ax.axvline(0, color="#cb112d", linestyle="--", linewidth=1.2, label="no change")
        ax.axvline(
            settledness["mean"],
            color="#0a66c2",
            linewidth=1.6,
            label=f"mean {settledness['mean']:+.2f}",
        )
        ax.set_xlabel("settledness delta (after minus before, 1..5 scale)")
        ax.set_ylabel("sessions")
        ax.set_title(f"Settledness shift per session ({title_tag})")
        ax.legend()
        fig.tight_layout()
        p2 = FIG_DIR / "fig2_settledness_delta.png"
        fig.savefig(p2, dpi=130)
        plt.close(fig)
        saved.append(p2)

    # Figure 3: completion reasons + harm metrics, side by side.
    completion = results["completion"]
    harm = results["harm"]
    fig, axes = plt.subplots(1, 2, figsize=(10, 4.2))
    reasons = completion["by_reason"]
    intentional = {"timebox", "postcap", "user_closed"}
    r_labels = list(reasons.keys())
    r_vals = [reasons[k] for k in r_labels]
    r_colors = ["#0a66c2" if k in intentional else "#cb112d" for k in r_labels]
    axes[0].bar(r_labels, r_vals, color=r_colors)
    axes[0].set_title(f"Session end reasons ({title_tag})")
    axes[0].set_ylabel("sessions")
    axes[0].tick_params(axis="x", rotation=20)

    h_labels = ["compulsive\nre-entry", "resurface\nanxiety", "rumination"]
    h_vals = [
        harm["reentry"]["rate"] * 100 if not pd.isna(harm["reentry"]["rate"]) else 0,
        harm["resurface_anxiety"]["rate"] * 100
        if not pd.isna(harm["resurface_anxiety"]["rate"])
        else 0,
        harm["rumination"]["rate"] * 100 if not pd.isna(harm["rumination"]["rate"]) else 0,
    ]
    axes[1].bar(h_labels, h_vals, color="#cb112d")
    axes[1].set_ylim(0, max(20, max(h_vals) * 1.4 + 1))
    axes[1].set_title(f"Harm metrics, lower is better ({title_tag})")
    axes[1].set_ylabel("rate (%)")
    for i, v in enumerate(h_vals):
        axes[1].text(i, v + 0.4, f"{v:.0f}%", ha="center", va="bottom", fontsize=9)
    fig.tight_layout()
    p3 = FIG_DIR / "fig3_guardrails.png"
    fig.savefig(p3, dpi=130)
    plt.close(fig)
    saved.append(p3)

    print(f"figures written to {FIG_DIR} ({len(saved)}): " + ", ".join(p.name for p in saved))
    return saved


def main():
    df = load_events()
    results = print_report(df)
    save_figures(df, results)


if __name__ == "__main__":
    main()
