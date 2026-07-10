# Importing Tokens Into Figma

These tokens follow the W3C Design Tokens Format Module. The simplest path into Figma is via the [Tokens Studio plugin](https://tokens.studio/).

## Steps

1. Install the Tokens Studio plugin in Figma
2. Open the plugin, choose "Tools" then "Import"
3. Paste the contents of `tokens.json` or upload the file
4. Apply to your Figma file as variables

## What's included

- `color`: LinkedIn-native product roles plus Exposed Logic canvas, structure, session-bound, signal, and trace roles
- `shadow`: resting, hover, and drag elevation
- `typography`: font family, type scale, weights, line heights, and tracking
- `space`: 4px-based spacing scale
- `radius`: rounding scale
- `motion`: durations, easing curves, lifts, and stagger values

Use `session-field` for the active session, `session-bound` for the visible time and post constraints, and `signal-*` only for a real action or saved state. Keep the product UI LinkedIn-native; the broader canvas and structure roles belong to the portfolio and handoff shell.

## Source of truth

The editable source is `design-system/tokens.source.json`. Run `npm run tokens:build` to regenerate `design-system/tokens.json` and `design-system/tokens.css`. This file mirrors the generated W3C JSON for Figma import and must be updated whenever the source changes.
