import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const dir = join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans");

/** Geist fonts for next/og image generation, read from disk so builds work offline. */
export async function ogFonts() {
  const [regular, bold] = await Promise.all([readFile(join(dir, "Geist-Regular.ttf")), readFile(join(dir, "Geist-Bold.ttf"))]);
  return [
    { name: "Geist", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

/** The Alaba mark as a data URL for OG images. */
export async function ogLogo() {
  const buf = await readFile(join(process.cwd(), "public/og-mark.png"));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

/** Geist has no ₦ glyph, so OG images spell the currency out. */
export const ogNaira = (kobo: number) => `NGN ${Math.round(kobo / 100).toLocaleString("en-NG")}`;
