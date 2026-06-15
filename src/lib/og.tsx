export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/**
 * Loads a Cyrillic-capable Inter font subset from Google Fonts containing only the
 * glyphs needed for `text`. Satori (used by next/og) only supports ttf/otf/woff,
 * which Google serves when no `Accept`/UA header signals woff2 support.
 */
export async function loadOgFont(text: string, weight: 400 | 700 = 700) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=${encodeURIComponent(text)}`
  ).then((res) => res.text());

  const fontUrl = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!fontUrl) return null;

  const res = await fetch(fontUrl);
  if (!res.ok) return null;
  return res.arrayBuffer();
}

export function OgCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#09090b",
        backgroundImage:
          "radial-gradient(circle at 85% 15%, rgba(59,130,246,0.25), transparent 50%), radial-gradient(circle at 0% 100%, rgba(124,58,237,0.25), transparent 50%)",
        padding: "64px",
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>
        <span style={{ color: "#AFA9EC" }}>qa</span>
        <span style={{ color: "#ffffff" }}>road</span>
        <span style={{ color: "#00FF94" }}>map</span>
        <span style={{ color: "#BF5FFF" }}>.dev</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {eyebrow && (
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 700,
              color: "#3b82f6",
              letterSpacing: 4,
            }}
          >
            {truncate(eyebrow, 40).toUpperCase()}
          </div>
        )}
        <div style={{ display: "flex", fontSize: 56, fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>
          {truncate(title, 90)}
        </div>
        {description && (
          <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa", lineHeight: 1.4 }}>
            {truncate(description, 140)}
          </div>
        )}
      </div>
    </div>
  );
}
