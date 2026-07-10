# Analytics: executable synthetic measurement rehearsal

This directory is an executable rehearsal of the proposed measurement pipeline.
It proves that typed events can be generated, rejected when malformed,
aggregated into capability and harm-signal transforms, and rendered as figures.
It does not prove that ADHD Mode improves recall, comprehension, intentional
completion, settledness, or any human outcome.

## Evidence status

Every row in `sample_events.jsonl`, every printed rate, and every pixel in the
figures is generated from a fixed seed.

- The apparent differences are baked into the generator. Recall probabilities
  are authored as 0.78 vs 0.55. Comprehension probabilities are authored as
  0.80 vs 0.62. The pipeline recovers inputs it was given.
- The resurfaced and nonresurfaced recall arms are illustrative fixture arms.
  They are not randomized, matched, counterbalanced, or causal evidence.
- There are no participants, observed sessions, or human outcomes in this
  directory.
- The settledness item is a proposed self-report, not a validated clinical
  measure. A negative delta is labeled only as worsened settledness.
- Candidate harm signals are computed descriptively. This rehearsal implements
  no alert thresholds, preregistered stop rules, or deployment decisions.

The output demonstrates pipeline plumbing only.

## What is executable

1. `event_schema.py` defines the event union in typed Python and validates every
   row at runtime. It checks required keys, primitive types, literal values,
   research-only events, envelope fields, and unexpected keys.
2. `generate_events.py` creates a deterministic JSONL fixture and validates each
   row before writing it.
3. `capability_metrics.py` validates each row again before pandas can coerce its
   types, then exercises proposed capability, engagement, and harm-signal
   transforms.
4. The figure pass renders three visibly labeled synthetic artifacts. Figure 3
   shows session end reasons plus candidate harm signals, not engagement
   guardrails.

Recall and comprehension are separate research-build events. A
`recall_probe` records a second-touch recall check. A `comprehension_probe`
records the post, presentation variant (`tldr_first` or `full_text_first`), and
whether the generated fixture answer is marked correct.

## Run it

From the repository root:

```sh
python3 -m venv .venv-analytics
source .venv-analytics/bin/activate
pip install -r requirements.txt
python analytics/event_schema.py
python analytics/generate_events.py
python analytics/capability_metrics.py
```

`generate_events.py` reproduces `analytics/sample_events.jsonl` byte for byte
with the same seed. If matplotlib is installed, `capability_metrics.py`
regenerates:

- `fig1_capability_arms.png`: authored fixture rates flowing through recall and
  comprehension transforms.
- `fig2_settledness_delta.png`: generated settledness deltas in both directions.
- `fig3_guardrails.png`: session end reasons plus candidate harm signals. The
  legacy filename remains stable for existing case-study links.

Every chart is labeled `SYNTHETIC FIXTURE, not evidence` in the image itself.

## Files

- `event_schema.py`: TypedDict taxonomy and dependency-free runtime validator.
- `generate_events.py`: deterministic fixture generator with documented input
  probabilities.
- `capability_metrics.py`: validated loader, descriptive transforms, report,
  and figure generation.
- `sample_events.jsonl`: generated fixture, never participant data.
- `figures/`: generated visual traces of the rehearsal.

## What real evidence would require

Before interpreting any difference as a product effect, a study would need a
defined population, consent and data-handling plan, randomized or
counterbalanced assignment, scoring rules, sample size based on power analysis,
accessibility coverage, and preregistered harm thresholds with stop conditions.
Those decisions and participant data do not exist here yet.
