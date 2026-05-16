# Importing Tokens Into Figma

These tokens follow the W3C Design Tokens Format Module. The simplest path into Figma is via the [Tokens Studio plugin](https://tokens.studio/).

## Steps

1. Install the Tokens Studio plugin in Figma
2. Open the plugin, choose "Tools" then "Import"
3. Paste the contents of `tokens.json` or upload the file
4. Apply to your Figma file as variables

## What's included

- `color`: surface, brand, text, hairline, reaction tints
- `typography`: font family plus the type scale
- `space`: 4px-based spacing scale
- `radius`: rounding scale
- `motion`: durations plus easing curves (Figma variables can reference these even though Figma does not yet animate from tokens directly)

## Source of truth

The canonical token file is `design-system/tokens.json` at the project root. This file is a mirror; regenerate if upstream changes.
