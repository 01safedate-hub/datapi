/**
 * Product video links: TikTok and Instagram only. Anything else is rejected so
 * sellers can't use the field to push buyers to outside sites.
 */
export type VideoLink = { platform: "tiktok" | "instagram"; url: string };

const patterns: { platform: VideoLink["platform"]; re: RegExp }[] = [
  { platform: "tiktok", re: /^https:\/\/(?:www\.|m\.)?tiktok\.com\/@[A-Za-z0-9._]{2,24}\/video\/\d{8,25}\/?$/ },
  { platform: "tiktok", re: /^https:\/\/(?:vm|vt)\.tiktok\.com\/[A-Za-z0-9]{5,15}\/?$/ },
  { platform: "instagram", re: /^https:\/\/(?:www\.)?instagram\.com\/(?:reel|reels|p|tv)\/[A-Za-z0-9_-]{5,40}\/?$/ },
];

export function parseVideoLink(input: string): VideoLink | null {
  const raw = input.trim();
  if (raw.length > 200) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
  // Drop tracking query strings and fragments; the canonical path is what we store.
  const clean = `${url.origin}${url.pathname}`;
  for (const p of patterns) if (p.re.test(clean)) return { platform: p.platform, url: clean };
  return null;
}

export const videoLinkHelp = "Paste a TikTok video link (tiktok.com/@shop/video/…) or an Instagram post or reel link (instagram.com/reel/…). Other sites are not allowed.";
