import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

let logoCache: string | null | undefined;
async function logoDataUri(): Promise<string | null> {
  if (logoCache === undefined) {
    try {
      const buf = await readFile(join(process.cwd(), "public/brand/logo-white.png"));
      logoCache = `data:image/png;base64,${buf.toString("base64")}`;
    } catch {
      logoCache = null; // fall back to a text wordmark
    }
  }
  return logoCache;
}

/** Branded 1200×630 card: navy, grid lines, orange accent, large condensed-style headline. */
export async function renderOg({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  const logo = await logoDataUri();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#0a1f3d",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          color: "#ffffff",
          fontFamily: "sans-serif",
          borderBottomRightRadius: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} width={196} height={84} alt="" />
          ) : (
            <div style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>ADS GLOBAL</div>
          )}
          <div style={{ display: "flex", color: "#ff6700", fontSize: 24, letterSpacing: 4, textTransform: "uppercase", fontWeight: 700 }}>{eyebrow}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: title.length > 28 ? 76 : 96, fontWeight: 800, lineHeight: 0.95, textTransform: "uppercase", letterSpacing: -1 }}>{title}</div>
          {subtitle ? <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: "#a9b8cc", maxWidth: 900 }}>{subtitle}</div> : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 24, color: "#a9b8cc" }}>
          <div style={{ display: "flex", width: 56, height: 6, backgroundColor: "#ff6700" }} />
          China · Nigeria — Import · Export · Sourcing · Logistics
        </div>
      </div>
    ),
    ogSize,
  );
}
