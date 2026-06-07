# Analytics: capability-first measurement (SYNTHETIC)

This directory holds a small Python pipeline that makes the capability thesis
computable. It ingests an event log in the canon section 9 taxonomy and computes
the canon section 5 measurement model: capability outcomes as the headline,
engagement as a guardrail, and three harm counter-metrics that have to fail
loudly if the design starts hurting.

## ALL DATA HERE IS SYNTHETIC AND ILLUSTRATIVE

Every row in `sample_events.jsonl`, every number in the report, and every figure
in `figures/` comes from a seeded simulation (`generate_events.py`). None of it
is measured. None of it is a claim about real users. It exists to demonstrate the
measurement design and to give the case study a concrete, clearly-labeled example
of what the dashboard would compute once real data exists. The case study cites
these numbers only as "SYNTHETIC, illustrative" per canon section 13.

## What the pipeline demonstrates

1. Capability-first measurement. The report prints Tier 1 (recall, comprehension,
   intentional completion, settledness) first and largest, because that is what
   success means. Tier 2 engagement reads come second and are framed as guardrails.
2. The honest mechanic made measurable. Resurfaced posts are scheduled by the
   user's own reactions (canon section 4), and the second-touch recall probe
   doubles as a capability signal, compared against a non-resurfaced control.
3. A brake, not just a gas pedal. Three harm counter-metrics (compulsive
   re-entry, resurface anxiety, rumination increase) are computed every run. A
   real deployment would alert on these.

## How to run

From the repo root:

```
python3 -m venv .venv-analytics
source .venv-analytics/bin/activate
pip install -r requirements.txt
python analytics/generate_events.py
python analytics/capability_metrics.py
```

`generate_events.py` writes `analytics/sample_events.jsonl` (deterministic: the
same seed reproduces the file byte for byte). `capability_metrics.py` loads it,
prints the report, and, if matplotlib is installed, writes 2 to 3 figures to
`analytics/figures/`. If matplotlib is not installed the pipeline still completes
and the report still prints; it just skips the figures and says so.

## Files

- `event_schema.py`: the canon section 9 event taxonomy as typed Python
  (TypedDict + Literal unions). Field names match `lib/types.d.ts` exactly.
- `generate_events.py`: the seeded synthetic generator. Simulation assumptions
  (the modest baked-in capability effect, the control group, the settledness and
  rumination distributions) are documented in the module docstring and inline.
- `capability_metrics.py`: loads the JSONL with pandas, computes Tier 1, Tier 2,
  and the harm metrics, prints the report, and saves the figures.
- `sample_events.jsonl`: the generated log (regenerate any time).
- `figures/`: the generated charts, each titled "SYNTHETIC, illustrative".

## Illustrative results (SYNTHETIC, not measured)

Computed from the seeded log (SEED=7, 42 primary sessions, both modes). These
are the exact numbers the scripts print. Re-running reproduces them.

### Tier 1: capability and outcome (the headline)

| Metric | Result (SYNTHETIC) | Read |
|---|---|---|
| Resurfaced-content recall vs control | 80.6% vs 53.0%, delta +27.6% | resurfaced posts recalled better than a non-resurfaced control (n=31 vs n=66) |
| Comprehension after reflow | 76.5% TL;DR-first vs 63.2% full-text-first, delta +13.2% | reading the TL;DR first beat reading full text first (n=102 vs n=117) |
| Intentional completion rate | 81.0% | 34 of 42 sessions ended by a bound or the closure ritual, not by leaving mid-session |
| Settledness delta | mean +0.97, median +1.00 | calmer after the session on the 1..5 self-report (n=34) |

Each accuracy in the printed report carries a 95% Wilson confidence interval,
because the per-arm samples are small and a bare point estimate would overstate
how settled the numbers are.

### Tier 2: engagement (guardrail only)

| Guardrail | Result (SYNTHETIC) |
|---|---|
| Reaction mix | like 28%, insightful 24%, funny 17%, support 16%, celebrate 11%, love 5% |
| Resurface seed rate | 44.8% of reactions scheduled a resurface |
| Reaction input (tap vs drag) | tap 70%, drag 30% |
| Mean dwell | 4.4s |
| Mode mix | reengage 55%, focus 45% |

These confirm the feature is not quietly tanking engagement while the capability
metrics move. They are not the success criteria.

### Harm counter-metrics (must stay low; a rise means the design is hurting)

| Counter-metric | Result (SYNTHETIC) | What a rise would mean |
|---|---|---|
| Compulsive re-entry | 10.6% | the bound became a binge enabler, not a stop |
| Resurface anxiety | 24.2% | the queue became a guilt backlog (dismiss-without-engage) |
| Rumination increase | 5.9% | sessions left people more scattered than they started |

In this synthetic run all three sit low, which is the point: the design is meant
to keep them low. The resurface-anxiety read (24%) is the one worth watching, and
the dashboard surfaces it on purpose rather than hiding it.

## Notes on the simulation

The generator bakes a deliberately modest effect (resurfaced recall around 0.78,
control around 0.55; comprehension around 0.80 vs 0.62) so the metrics are
non-trivial without looking like a miracle. The sampled results land near those
targets, with the small-N noise visible in the confidence intervals. The exact
generative assumptions are in the `generate_events.py` docstring. If you change
the seed or the cohort size, the numbers move; the table above is for SEED=7.
