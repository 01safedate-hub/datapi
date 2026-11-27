import { ImageResponse } from "next/og";
import { ogFonts, ogLogo } from "@/lib/og";

export const alt = "Alaba — Buy direct from Nigerian manufacturers and sellers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await ogLogo();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: "Geist", background: "#0a1a52", color: "white", padding: 80 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 56, fontWeight: 700 }}>
          <div style={{ display: "flex", width: 110, height: 110, borderRadius: 24, background: "white", alignItems: "center", justifyContent: "center" }}>
            { }
            <img src={logo} width={90} height={90} alt="" />
          </div>
          Alaba
        </div>
        <div style={{ display: "flex", marginTop: 44, fontSize: 70, fontWeight: 700, lineHeight: 1.05, maxWidth: 1000 }}>
          Buy direct from Nigerian manufacturers and sellers.
        </div>
        <div style={{ display: "flex", marginTop: 26, fontSize: 32, color: "rgba(255,255,255,0.8)" }}>
          No middlemen · Alaba Buyer Protection · alaba.ng
        </div>
        <div style={{ display: "flex", marginTop: 36, width: 140, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#ff3d00,#ff7a00,#ffc400)" }} />
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
