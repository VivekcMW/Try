import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt     = "Lokul.club — Your Neighborhood, Connected";
export const size    = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display:    "flex",
          width:      "100%",
          height:     "100%",
          background: "linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0a0e27 100%)",
          alignItems: "center",
          justifyContent: "center",
          flexDirection:  "column",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
          position:   "relative",
        }}
      >
        {/* Grid dots background */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.08,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize:  "40px 40px",
          display: "flex",
        }} />

        {/* Glow blobs */}
        <div style={{
          position: "absolute", top: 80, left: 80,
          width: 400, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 70%)",
          display: "flex",
        }} />
        <div style={{
          position: "absolute", bottom: 80, right: 80,
          width: 300, height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)",
          display: "flex",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 64, height: 64, borderRadius: 16,
            background: "linear-gradient(135deg, #6366f1, #4338ca)",
            fontSize: 28, fontWeight: 700, color: "white",
          }}>L</div>
          <span style={{ fontSize: 36, fontWeight: 700, color: "white", letterSpacing: "-1px" }}>
            lokul<span style={{ color: "#818cf8" }}>.club</span>
          </span>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 60, fontWeight: 800, color: "white", textAlign: "center",
          letterSpacing: "-2px", lineHeight: 1.1, maxWidth: 900,
          display: "flex", flexDirection: "column",
        }}>
          Your Neighborhood,{"\n"}
          <span style={{ color: "#818cf8" }}>Connected.</span>
        </div>

        {/* Sub */}
        <p style={{
          marginTop: 24, fontSize: 24, color: "rgba(255,255,255,0.65)",
          textAlign: "center", maxWidth: 700,
        }}>
          Safety alerts · RWA notices · Local businesses · Community feed
        </p>

        {/* Badge */}
        <div style={{
          marginTop: 40,
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 100, padding: "12px 24px",
          color: "rgba(255,255,255,0.9)", fontSize: 18,
        }}>
          ⚡ Join 50,000+ neighbors on the waitlist
        </div>
      </div>
    ),
    { ...size }
  );
}
