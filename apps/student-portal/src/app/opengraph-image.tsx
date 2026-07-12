import { ImageResponse } from "next/og";
import { defaultTitle, siteTagline } from "@/lib/site";

export const runtime = "edge";
export const alt = defaultTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)",
          color: "#FFFFFF",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M24 6L38 26H29V34H19V26H10L24 6Z" fill="#E11D2E" />
            <path
              d="M10 38C16 43 32 43 38 38"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.02em" }}>
            scale<span style={{ color: "#E11D2E" }}>X</span> LaunchPad
          </div>
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 900,
            marginBottom: 24,
          }}
        >
          Amazon FBA Private Label Education
        </div>
        <div style={{ fontSize: 28, color: "#9CA3AF" }}>{siteTagline}</div>
      </div>
    ),
    { ...size }
  );
}
