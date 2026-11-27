/**
 * Small, dependency-free fuzzy matcher shared by server search and the
 * instant suggestions in the header. Tolerates typos ("blutooth", "chargr")
 * and partial words. In production, Postgres full-text + pg_trgm replaces it.
 */

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

function levenshtein(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length]!;
}

function termScore(term: string, words: string[]) {
  let best = 0;
  for (const w of words) {
    if (w === term) return 3;
    if (w.startsWith(term)) best = Math.max(best, 2.5);
    else if (term.length >= 4 && w.includes(term)) best = Math.max(best, 2);
    else if (term.length >= 4) {
      const allowed = term.length >= 7 ? 2 : 1;
      const d = levenshtein(term, w.slice(0, term.length + allowed), allowed);
      if (d <= allowed) best = Math.max(best, 1.5 - d * 0.25);
    }
  }
  return best;
}

/** Returns 0 when any search term finds no match, otherwise a relevance score. */
export function matchScore(query: string, fields: string[]) {
  const terms = normalise(query).split(" ").filter(Boolean);
  if (!terms.length) return 0;
  const words = normalise(fields.join(" ")).split(" ");
  let total = 0;
  for (const t of terms) {
    const s = termScore(t, words);
    if (s === 0) return 0;
    total += s;
  }
  // Boost matches in the first field (the product name).
  const name = normalise(fields[0] ?? "");
  if (name.includes(normalise(query))) total += 2;
  return total;
}

/**
 * Query understanding: Nigerian shopping slang and common variants mapped to
 * catalogue words, plus filler words dropped. Admin-editable in production
 * (`search_synonyms` table); this list is the seed.
 */
export const synonyms: Record<string, string> = {
  fone: "phone",
  fones: "phone",
  handset: "phone",
  mobile: "phone",
  powerbank: "power bank",
  earpiece: "earbuds",
  earphone: "earbuds",
  earphones: "earbuds",
  airpods: "earbuds",
  lappy: "laptop",
  notebook: "laptop",
  gen: "generator",
  tv: "projector",
  sneaker: "sneakers",
  canvas: "sneakers",
  bag: "backpack",
  fan: "fan",
  nepa: "rechargeable",
  "rechargable": "rechargeable",
  watch: "smartwatch",
  charger: "charger",
  "ssd": "ssd",
  shoe: "shoes",
  loafer: "loafers",
};

const stopwords = new Set(["a", "an", "the", "for", "with", "and", "in", "of", "cheap", "best", "new", "original", "buy", "price", "naija", "nigeria"]);

export function expandQuery(query: string) {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w && !stopwords.has(w))
    .map((w) => synonyms[w] ?? w)
    .join(" ") || query;
}
