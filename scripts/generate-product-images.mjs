// Generates neutral placeholder product images (SVG) for the mock catalogue.
// Run: node scripts/generate-product-images.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { productIcons } from "../lib/data/catalog.ts";

const bgs = {
  phones: ["#eef2f7", "#e7ecf6"], computers: ["#edf0f4", "#e6eaf1"], electronics: ["#eef1f6", "#e8edf5"],
  fashion: ["#f3f1ee", "#efece7"], home: ["#eff2ef", "#e9eee9"], beauty: ["#f4eff1", "#efe8eb"],
};
mkdirSync("public/products", { recursive: true });

for (const { slug, icon, category } of productIcons) {
  const svg = readFileSync(`node_modules/lucide-static/icons/${icon}.svg`, "utf8");
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const [a, b] = bgs[category] ?? ["#eef1f5", "#e7ebf2"];
  const variants = [
    { bg: `<rect width="800" height="800" fill="${a}"/>`, scale: 17, rot: 0, dx: 0, dy: -10 },
    { bg: `<rect width="800" height="800" fill="${b}"/><circle cx="400" cy="400" r="290" fill="#ffffff" opacity=".55"/>`, scale: 14, rot: -12, dx: 0, dy: 0 },
    { bg: `<rect width="800" height="800" fill="#f8fafc"/><rect x="40" y="40" width="720" height="720" rx="28" fill="none" stroke="#e2e8f0" stroke-width="2"/>`, scale: 11, rot: 8, dx: 0, dy: 0 },
  ];
  variants.forEach((v, i) => {
    const size = 24 * v.scale;
    const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">${v.bg}
<ellipse cx="400" cy="${640 + v.dy}" rx="${size * 0.36}" ry="18" fill="#0a1a52" opacity=".07"/>
<g transform="translate(${400 - size / 2 + v.dx} ${400 - size / 2 + v.dy}) rotate(${v.rot} ${size / 2} ${size / 2}) scale(${v.scale})" fill="none" stroke="#0a1a52" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round">${inner}</g>
<circle cx="${400 + size * 0.3}" cy="${400 - size * 0.32 + v.dy}" r="10" fill="#ff7a00"/>
</svg>`;
    writeFileSync(`public/products/${slug}-${i + 1}.svg`, out);
  });
}
console.log(`Generated ${productIcons.length * 3} images`);
