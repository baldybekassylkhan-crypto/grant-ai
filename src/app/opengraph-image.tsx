import { ImageResponse } from "next/og";
export const dynamic = "force-static";

export const alt = "grant.ai — ҰБТ / ЕНТ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#F8FAFE" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 132, height: 96, borderRadius: 48, background: "#FF4B3C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 90, height: 48, borderRadius: 24, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
              <div style={{ width: 11, height: 11, borderRadius: 6, background: "#030A19" }} />
              <div style={{ width: 11, height: 11, borderRadius: 6, background: "#030A19" }} />
            </div>
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, color: "#030A19" }}>grant.ai</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 56, fontWeight: 800, color: "#030A19", maxWidth: 900, lineHeight: 1.1 }}>
          ҰБТ / ЕНТ · 140
        </div>
      </div>
    ),
    size,
  );
}
