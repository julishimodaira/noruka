// Icon generator — run with: node generate-icons.js
// Generates all required PNG icons from an SVG source
// Requires: npm install canvas

const fs = require('fs');
const path = require('path');

// SVG source for the Noruka icon
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="110" fill="url(#bg)"/>
  <text x="256" y="340" font-family="Arial" font-size="280" text-anchor="middle" fill="white">♿</text>
</svg>`;

const SIZES = [16, 32, 48, 72, 96, 120, 128, 144, 152, 180, 192, 512];

// Write SVG source
fs.mkdirSync('./public/icons', { recursive: true });
fs.writeFileSync('./public/icons/icon.svg', SVG);

console.log('SVG icon written to public/icons/icon.svg');
console.log('');
console.log('To generate PNGs, use one of these options:');
console.log('');
console.log('Option 1 — Online tool (easiest):');
console.log('  1. Go to https://realfavicongenerator.net');
console.log('  2. Upload public/icons/icon.svg');
console.log('  3. Download the package and copy icons to public/icons/');
console.log('');
console.log('Option 2 — Command line (if you have ImageMagick):');
SIZES.forEach(size => {
  console.log(`  convert -background none public/icons/icon.svg -resize ${size}x${size} public/icons/icon-${size}.png`);
});
console.log('');
console.log('Option 3 — Node canvas (npm install canvas):');
console.log('  See https://www.npmjs.com/package/canvas for setup');
