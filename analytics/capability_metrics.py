"""Metric transforms for an executable synthetic measurement rehearsal.

Every number printed or plotted here comes from authored fixture probabilities
in generate_events.py. The output verifies schema validation, aggregation,
reporting, and chart generation. It is not a measured result, an effect
estimate, or evidence about people.

The transforms follow the canon section 5 priority order:

  Tier 1 (PRIMARY, what success means):
    - Resurfaced-content recall accuracy vs an illustrative nonresurfaced arm.
    - Comprehension-after-reflow delta (TL;DR-first vs full-text-first).
    - Intentional completion rate.
    - Mean settledness delta.

  Tier 2 (GUARDRAILS, must not be the success criteria):
    - Opt-in / reaction-mix / resurface acceptance style engagement reads.

  Candidate harm signals for a future study:
    - Compulsive re-entry rate.
    - Resurface anxiety proxy (dismissal after a resurfaced-card impression).
    - Worsened settledness (share of sessions whose settledness delta is < 0).

No alert thresholds or study-stop rules are implemented in this rehearsal.

Run:
  python analytics/generate_events.py
  python analytics/capability_metrics.py
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from event_schema import EventValidationError, validate_event

HERE = Path(__file__).resolve().parent
EVENTS_PATH = HERE / "sample_events.jsonl"
FIG_DIR = HERE / "figures"

# Two minutes, in ms: the compulsive-re-entry window (canon section 5).
REENTRY_WINDOW_MS = 2 * 60 * 1000


def load_events(path: Path = EVENTS_PATH) -> pd.DataFrame:
    """Load JSONL only after validating every row against the runtime schema.

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
            try:
                obj = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"line {line_no}: invalid JSON: {exc.msg}") from exc
            try:
                validate_event(obj, require_envelope=True)
            except EventValidationError as exc:
                raise EventValidationError(f"line {line_no}: {exc}") from exc
            rows.append(obj)
    df = pd.DataFrame(rows)
    return df


def _recall_arms(df: pd.DataFrame) -> dict:
    """Split recall fixtures into resurfaced and illustrative comparison arms."""
    probes = df[df["type"] == "recall_probe"].copy()
    if probes.empty:
        return {
            "recall_resurfaced": probes,
            "recall_comparison": probes,
        }
    probes["arm"] = "recall_resurfaced"
    pid = probes["post_id"].astype(str)
    probes.loc[pid.str.endswith("#comparison"), "arm"] = "recall_comparison"
    return {
        "recall_resurfaced": probes[probes["arm"] == "recall_resurfaced"],
        "recall_comparison": probes[probes["arm"] == "recall_comparison"],
    }


def _comprehension_arms(df: pd.DataFrame) -> dict:
    """Split the distinct comprehension_probe event by presentation variant."""
    probes = df[df["type"] == "comprehension_probe"].copy()
    if probes.empty:
        return {"comp_tldr": probes, "comp_fulltext": probes}
    return {
        "comp_tldr": probes[probes["variant"] == "tldr_first"],
        "comp_fulltext": probes[probes["variant"] == "full_text_first"],
    }


def _accuracy(frame: pd.DataFrame):
    n = len(frame)
    k = int(frame["correct"].sum()) if n else 0
    acc = k / n if n else float("nan")
    return {"n": n, "correct": k, "accuracy": acc}


def tier1_recall(df: pd.DataFrame) -> dict:
    """Resurfaced recall accuracy vs an illustrative nonresurfaced fixture arm."""
    arms = _recall_arms(df)
    res = _accuracy(arms["recall_resurfaced"])
    comparison = _accuracy(arms["recall_comparison"])
    delta = (
        res["accuracy"] - comparison["accuracy"]
        if not (pd.isna(res["accuracy"]) or pd.isna(comparison["accuracy"]))
        else float("nan")
    )
    return {"resurfaced": res, "comparison": comparison, "delta": delta}


def tier1_comprehension(df: pd.DataFrame) -> dict:
    """Comprehension accuracy: TL;DR-first reflow vs full-text-first."""
    arms = _comprehension_arms(df)
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
    """Exercise descriptive engagement transforms for future guardrail use."""
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
    """Resurface anxiety proxy: dismissal after a resurfaced-card impression.

    A dismissal counts only when post_skipped follows that specific resurfaced
    card before the next card_seen event in the same session. This avoids
    misattributing a later fresh copy of the same post.
    """
    seen = 0
    dismissed = 0
    for _, session_rows in df.groupby("session_id", sort=False):
        active_resurfaced_post = None
        for event in session_rows.to_dict("records"):
            event_type = event["type"]
            if event_type == "card_seen":
                if event.get("is_resurfaced") == True:  # noqa: E712
                    seen += 1
                    active_resurfaced_post = str(event["post_id"])
                else:
                    active_resurfaced_post = None
            elif (
                event_type == "post_skipped"
                and active_resurfaced_post is not None
                and str(event["post_id"]) == active_resurfaced_post
            ):
                dismissed += 1
                active_resurfaced_post = None
            elif event_type == "reaction_committed":
                active_resurfaced_post = None

    if seen == 0:
        return {"resurfaced_seen": 0, "dismissed": 0, "rate": float("nan")}
    return {"resurfaced_seen": seen, "dismissed": dismissed, "rate": dismissed / seen}


def harm_worsened_settledness(df: pd.DataFrame) -> dict:
    """Share of sessions with a lower settledness report after the session."""
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
    return f"{_fmt_pct(a['accuracy'])} ({a['correct']} of {a['n']} generated rows)"


def print_report(df: pd.DataFrame) -> dict:
    """Print the readable report and return the computed numbers as a dict."""
    recall = tier1_recall(df)
    comp = tier1_comprehension(df)
    completion = tier1_completion(df)
    settledness = tier1_settledness(df)
    engagement = tier2_engagement(df)
    reentry = harm_reentry(df)
    anxiety = harm_resurface_anxiety(df)
    worsened_settledness = harm_worsened_settledness(df)

    line = "=" * 68
    print(line)
    print("FOCUS SESSION SYNTHETIC MEASUREMENT REHEARSAL")
    print("AUTHORED FIXTURE OUTPUT, NOT MEASURED OR HUMAN EVIDENCE")
    print(line)
    n_real_sessions = _real_wraps(df)["session_id"].nunique()
    print(f"primary sessions analyzed: {n_real_sessions}")
    research_rows = df[df.get("build") == "research"] if "build" in df else df
    print(f"research-build rows (carry probes): {len(research_rows)} of {len(df)}")
    print()

    print("TIER 1  proposed capability transforms  (generated fixture output)")
    print("-" * 68)
    print("  1) Resurfaced recall vs illustrative nonresurfaced comparison")
    print(f"       resurfaced : {_fmt_acc(recall['resurfaced'])}")
    print(f"       comparison : {_fmt_acc(recall['comparison'])}")
    print(f"       delta      : {_fmt_pct(recall['delta'])} (fixture-arm difference)")
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

    print("TIER 2  descriptive engagement transforms  (future guardrail inputs)")
    print("-" * 68)
    print(f"  reaction mix          : {engagement['reaction_mix']}")
    print(f"  resurface seed rate   : {_fmt_pct(engagement['resurface_seed_rate'])}")
    print(f"  reaction via (tap/drag): {engagement['via_mix']}")
    print(f"  mean dwell            : {engagement['mean_dwell_ms'] / 1000:.1f}s")
    print(f"  mode mix              : {engagement['mode_mix']}")
    print()

    print("CANDIDATE HARM SIGNALS  (no thresholds or alerts implemented)")
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
        f"  worsened settledness  : {_fmt_pct(worsened_settledness['rate'])} "
        f"({worsened_settledness['worse']} of {worsened_settledness['n']} generated sessions)"
    )
    print(line)
    print("Reading: these authored differences exercise the pipeline end to end.")
    print("They do not estimate an effect, validate a measure, or show an outcome.")
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
            "worsened_settledness": worsened_settledness,
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
    title_tag = "SYNTHETIC FIXTURE, not evidence"

    # Quiet Exposed Logic roles: a warm base, near-black structure, LinkedIn
    # cobalt for the active fixture arm, muted traces, and a scarce harm signal.
    CANVAS = "#f3f1e8"
    STRUCTURE = "#171b18"
    FIELD = "#0a66c2"
    TRACE = "#868c85"
    SIGNAL = "#b4482d"
    GRID = "#d9d8cf"

    def _style_axes(ax_target):
        """Apply semantic color roles to one axes."""
        ax_target.set_facecolor(CANVAS)
        ax_target.spines["top"].set_visible(False)
        ax_target.spines["right"].set_visible(False)
        ax_target.spines["left"].set_color(STRUCTURE)
        ax_target.spines["bottom"].set_color(STRUCTURE)
        ax_target.tick_params(colors=STRUCTURE, labelcolor=STRUCTURE)
        ax_target.xaxis.label.set_color(STRUCTURE)
        ax_target.yaxis.label.set_color(STRUCTURE)
        ax_target.title.set_color(STRUCTURE)
        ax_target.grid(True, axis="y", color=GRID, linewidth=0.8, zorder=0)
        ax_target.set_axisbelow(True)

    # Figure 1: Tier 1 capability bars (recall arms + comprehension arms).
    recall = results["recall"]
    comp = results["comprehension"]
    labels = ["recall\ncomparison", "recall\nresurfaced", "comp\nfull-first", "comp\ntldr-first"]
    values = [
        recall["comparison"]["accuracy"],
        recall["resurfaced"]["accuracy"],
        comp["fulltext_first"]["accuracy"],
        comp["tldr_first"]["accuracy"],
    ]
    colors = [TRACE, FIELD, TRACE, FIELD]
    fig, ax = plt.subplots(figsize=(7, 4.2))
    fig.patch.set_facecolor(CANVAS)
    _style_axes(ax)
    bars = ax.bar(labels, [v * 100 for v in values], color=colors, zorder=3)
    ax.set_ylabel("accuracy in generated fixture (%)")
    ax.set_ylim(0, 100)
    ax.set_title("Authored probe rates through the metric transforms")
    for bar, v in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 1.5,
            "n/a" if pd.isna(v) else f"{v * 100:.0f}%",
            ha="center",
            va="bottom",
            fontsize=9,
            color=STRUCTURE,
        )
    fig.suptitle(title_tag, color=STRUCTURE, fontsize=10, fontweight="bold")
    fig.tight_layout(rect=[0, 0, 1, 0.91])
    p1 = FIG_DIR / "fig1_capability_arms.png"
    fig.savefig(p1, dpi=130, facecolor=CANVAS)
    plt.close(fig)
    saved.append(p1)

    # Figure 2: settledness delta distribution.
    settledness = results["settledness"]
    if settledness["n"]:
        fig, ax = plt.subplots(figsize=(7, 4.2))
        fig.patch.set_facecolor(CANVAS)
        _style_axes(ax)
        vals = settledness["values"]
        bins = range(-4, 6)
        ax.hist(vals, bins=bins, color=FIELD, edgecolor=CANVAS, align="left", zorder=3)
        ax.axvline(0, color=TRACE, linestyle="--", linewidth=1.2, label="no change")
        ax.axvline(
            settledness["mean"],
            color=STRUCTURE,
            linewidth=1.6,
            label=f"mean {settledness['mean']:+.2f}",
        )
        ax.set_xlabel("settledness delta (after minus before, 1..5 scale)")
        ax.set_ylabel("sessions")
        ax.set_title("Generated settledness deltas exercise both directions")
        legend = ax.legend()
        legend.get_frame().set_facecolor(CANVAS)
        legend.get_frame().set_edgecolor(STRUCTURE)
        for text in legend.get_texts():
            text.set_color(STRUCTURE)
        fig.suptitle(title_tag, color=STRUCTURE, fontsize=10, fontweight="bold")
        fig.tight_layout(rect=[0, 0, 1, 0.91])
        p2 = FIG_DIR / "fig2_settledness_delta.png"
        fig.savefig(p2, dpi=130, facecolor=CANVAS)
        plt.close(fig)
        saved.append(p2)

    # Figure 3: session end reasons + candidate harm signals, side by side.
    completion = results["completion"]
    harm = results["harm"]
    fig, axes = plt.subplots(1, 2, figsize=(10, 4.2))
    fig.patch.set_facecolor(CANVAS)
    _style_axes(axes[0])
    _style_axes(axes[1])
    reasons = completion["by_reason"]
    intentional = {"timebox", "postcap", "user_closed"}
    r_labels = list(reasons.keys())
    r_vals = [reasons[k] for k in r_labels]
    r_colors = [FIELD if k in intentional else TRACE for k in r_labels]
    axes[0].bar(r_labels, r_vals, color=r_colors, zorder=3)
    axes[0].set_title("Session end reasons")
    axes[0].set_ylabel("sessions")
    axes[0].tick_params(axis="x", rotation=20)

    h_labels = ["compulsive\nre-entry", "resurface\nanxiety", "worsened\nsettledness"]
    h_vals = [
        harm["reentry"]["rate"] * 100 if not pd.isna(harm["reentry"]["rate"]) else 0,
        harm["resurface_anxiety"]["rate"] * 100
        if not pd.isna(harm["resurface_anxiety"]["rate"])
        else 0,
        harm["worsened_settledness"]["rate"] * 100
        if not pd.isna(harm["worsened_settledness"]["rate"])
        else 0,
    ]
    axes[1].bar(h_labels, h_vals, color=SIGNAL, zorder=3)
    axes[1].set_ylim(0, max(20, max(h_vals) * 1.4 + 1))
    axes[1].set_title("Candidate harm signals")
    axes[1].set_ylabel("rate (%)")
    for i, v in enumerate(h_vals):
        axes[1].text(
            i,
            v + 0.4,
            f"{v:.0f}%",
            ha="center",
            va="bottom",
            fontsize=9,
            color=STRUCTURE,
        )
    fig.suptitle(
        f"Session end reasons + harm signals ({title_tag})",
        color=STRUCTURE,
        fontsize=12,
        fontweight="bold",
    )
    fig.tight_layout(rect=[0, 0, 1, 0.91])
    p3 = FIG_DIR / "fig3_guardrails.png"
    fig.savefig(p3, dpi=130, facecolor=CANVAS)
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
