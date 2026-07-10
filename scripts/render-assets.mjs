#!/usr/bin/env node

import sharp from 'sharp';

const renders = [
  ['case-study/og.svg', 'case-study/og.png', 1200, 630],
  ['favicon.svg', 'favicon-32.png', 32, 32],
  ['favicon.svg', 'apple-touch-icon.png', 180, 180],
];

await Promise.all(
  renders.map(async ([source, target, width, height]) => {
    await sharp(source)
      .resize(width, height, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(target);
  }),
);

console.log('Rendered social card and app icons from SVG sources.');
