import type { Review } from "../types";
import { products } from "./catalog";

const authors = [
  ["Adaeze O.", "Lagos"], ["Tunde A.", "Ibadan"], ["Chiamaka N.", "Enugu"], ["Ibrahim M.", "Abuja"],
  ["Funmi K.", "Lekki"], ["Emeka U.", "Port Harcourt"], ["Zainab Y.", "Kano"], ["Segun B.", "Abeokuta"],
] as const;

const templates = [
  { rating: 5, title: "Exactly as described", body: "Arrived well packed and works perfectly. The shipping estimate was spot on, no surprises." },
  { rating: 5, title: "Worth the wait", body: "Took about two weeks from China but the tracking updates kept me informed the whole time." },
  { rating: 4, title: "Good value", body: "Quality is better than what I found in the market for the price. Delivery rider was polite." },
  { rating: 4, title: "Happy with it", body: "Does the job well. Packaging could be better but nothing was damaged." },
  { rating: 3, title: "Okay, not perfect", body: "Product is fine but delivery was two days later than the window shown. Support replied quickly though." },
];

let seed = 7;
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

export const reviews: Review[] = products.flatMap((p, pi) =>
  Array.from({ length: 3 }, (_, i) => {
    const t = templates[Math.floor(rand() * templates.length)]!;
    const a = authors[(pi + i * 3) % authors.length]!;
    const day = 1 + Math.floor(rand() * 20);
    return {
      id: `rev_${pi}_${i}`,
      productId: p.id,
      author: a[0],
      city: a[1],
      rating: p.rating >= 4.5 && t.rating < 4 ? 5 : t.rating,
      title: t.title,
      body: t.body,
      createdAt: `2026-11-${String(day).padStart(2, "0")}T12:00:00.000Z`,
      verified: rand() > 0.15,
    };
  }),
);
