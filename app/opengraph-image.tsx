import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og";

export const alt = "Shupzy — Imported and local products, priced in naira";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: "Geist", background: "#0b1b3f", color: "white", padding: 80 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 48, fontWeight: 700 }}>
          <div style={{ width: 76, height: 76, borderRadius: 18, background: "#1d3fd1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46 }}>S</div>
          Shupzy
        </div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 950 }}>
          Shop China and Nigeria, pay in naira.
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "rgba(255,255,255,0.8)" }}>
          Shipping shown upfront · Tracked to your door
        </div>
        <div style={{ display: "flex", marginTop: 40, width: 120, height: 8, borderRadius: 4, background: "#ff8a00" }} />
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
