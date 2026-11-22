import { ImageResponse } from "next/og";
import { getProduct, queryProducts } from "@/lib/catalog";
import { ogFonts, ogNaira } from "@/lib/og";

export const alt = "Shupzy product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return queryProducts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  const name = p?.name ?? "Shupzy";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: "Geist", background: "#0b1b3f", color: "white", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, fontWeight: 700 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#1d3fd1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>S</div>
          Shupzy
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#ff8a00", fontWeight: 600 }}>
            {p?.source === "imported" ? "Imported from China" : "In stock in Lagos"}
          </div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>{name}</div>
          {p && (
            <div style={{ display: "flex", fontSize: 40, color: "rgba(255,255,255,0.85)" }}>
              {ogNaira(p.priceKobo)} · {p.deliveryDays[0]}–{p.deliveryDays[1]} day delivery
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
