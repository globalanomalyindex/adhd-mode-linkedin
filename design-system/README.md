# Design tokens

One source, two generated files, no drift.

The source carries two related visual languages without confusing their jobs:

- LinkedIn-native product roles keep the in-app interaction familiar.
- Exposed Logic roles make the portfolio shell's real structure visible.

## Semantic shell roles

| Role | Meaning |
| --- | --- |
| `canvas` / `canvas-alt` | the warm working surface and secondary modules |
| `structure` / `structure-soft` | frames, seams, and load-bearing modules |
| `session-field` | the active bounded session |
| `session-bound` | time, post, and saved-attention limits |
| `signal-text` / `signal-field` | a scarce action, warning, or committed state |
| `trace` | history and the future-return path |

The roles are behavioral. Cobalt is not a general accent: it means the active
session. Amber is not decoration: it marks a limit or saved-attention
counterfield. Signal orange stays scarce. Product screens continue using the
existing LinkedIn roles instead of inheriting the portfolio shell wholesale.

## Source of truth

`tokens.source.json` is the only file you edit by hand. It is W3C / DTCG
format (`$type` / `$value`), the same shape Tokens Studio reads in Figma.

## Generated files (do not edit)

| File          | Consumed by                                                 | Notes                            |
| ------------- | ----------------------------------------------------------- | -------------------------------- |
| `tokens.css`  | every screen and the prototype, via `@import` in `base.css` | CSS custom properties on `:root` |
| `tokens.json` | the Figma component library, via Tokens Studio              | W3C mirror of the source         |

Both are produced from `tokens.source.json`. They carry a "GENERATED FILE"
banner. Hand edits get clobbered on the next build, and CI fails if a
generated file is out of sync with the source (see "Freshness gate").

## Build

```
npm run tokens:build
```

This runs `style-dictionary build`, which the Style Dictionary CLI drives
from `../config.js` (repo root). The config registers two custom output
formats so the CSS keeps its section comments, column alignment, and the
exact literal value spelling the codebase already shipped (rgba spacing,
LinkedIn-native hex). The build is deterministic: no timestamps, so the
same source always yields the same bytes.

### Why a custom format instead of Style Dictionary's default CSS output

The generic `css/variables` format would rename properties to its own
convention (group-prefixed, e.g. `--color-react-insightful`). Hundreds of
existing references across the screens and the prototype use the bare names
(`--react-insightful`). The custom format in `config.js` preserves every
existing name and value as a strict superset, so the generator could be
introduced without touching a single consumer.

## Adding or changing a token

1. Edit `tokens.source.json`.
2. Run `npm run tokens:build`.
3. Commit the source and both generated files together.

## Freshness gate

CI (`.github/workflows/ci.yml`) rebuilds the tokens and then runs
`git diff --exit-code design-system/`. A nonempty diff means a generated
file was edited by hand, or someone changed the source and forgot to
rebuild. Either way the build fails until the committed files match the
source.
