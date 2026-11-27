/**
 * Builds every logo, icon and favicon from one text-encoded source
 * (scripts/brand/logo.webp.b64) so the repo needs no binary brand files.
 * Runs automatically before `next dev` and `next build`.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const out = (p) => new URL(`public/${p}`, root);
const src = Buffer.from((await readFile(new URL("scripts/brand/logo.webp.b64", root), "utf8")).replace(/\s+/g, ""), "base64");
const logo = await sharp(src).trim().png().toBuffer();
const clear = { r: 0, g: 0, b: 0, alpha: 0 };
const white = { r: 255, g: 255, b: 255, alpha: 1 };

/** Logo fitted into a square canvas, `scale` = share of the width the logo fills. */
async function square(size, scale, background) {
  const inner = Math.round(size * scale);
  const mark = await sharp(logo).resize({ width: inner, height: inner, fit: "inside" }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: mark, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

await mkdir(out("icons"), { recursive: true });
const files = {
  "logo.png": await sharp(logo).resize({ height: 128 }).png({ compressionLevel: 9 }).toBuffer(),
  "logo-mark.png": await square(256, 1, clear),
  "og-mark.png": await square(160, 1, clear),
  "icons/icon-192.png": await square(192, 0.84, white),
  "icons/icon-512.png": await square(512, 0.84, white),
  "icons/maskable-192.png": await square(192, 0.6, white),
  "icons/maskable-512.png": await square(512, 0.6, white),
  "icons/apple-touch-icon.png": await square(180, 0.8, white),
  "icons/favicon-32.png": await square(32, 0.94, clear),
};
for (const [p, buf] of Object.entries(files)) await writeFile(out(p), buf);

// favicon.ico: a single 32×32 PNG wrapped in an ICO header.
const png = files["icons/favicon-32.png"];
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt8(0, 8); ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12); ico.writeUInt32LE(png.length, 14); ico.writeUInt32LE(22, 18);
await writeFile(out("favicon.ico"), Buffer.concat([ico, png]));

console.log(`Brand assets: ${Object.keys(files).length + 1} files written to public/`);
