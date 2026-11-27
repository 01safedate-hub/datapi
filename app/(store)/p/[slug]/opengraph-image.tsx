import { ImageResponse } from "next/og";
import { getProduct, queryProducts } from "@/lib/catalog";
import { ogFonts, ogLogo, ogNaira } from "@/lib/og";

export const alt = "Alaba product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return queryProducts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  const name = p?.name ?? "Alaba";
  const logo = await ogLogo();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", fontFamily: "Geist", background: "#0a1a52", color: "white", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, fontWeight: 700 }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
            { }
            <img src={logo} width={58} height={58} alt="" />
          </div>
          Alaba
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 26, color: "#ff7a00", fontWeight: 600 }}>
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
