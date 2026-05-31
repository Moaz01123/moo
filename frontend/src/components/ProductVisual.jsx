function hexToRgb(hex) {
  const h = (hex || "#1a1a1a").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Abstract editorial product visual — no photos, no people.
 * Renders a typographic composition over the product's accent color.
 */
export default function ProductVisual({ product, className = "", compact = false }) {
  const accent = product.accent || "#1a1a1a";
  const light = luminance(accent) > 0.6;
  const fg = light ? "#0d0d0d" : "#f4f1ea";
  const initials = product.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${accent} 0%, ${accent} 55%, rgba(0,0,0,0.18) 100%)`,
        color: fg,
      }}
    >
      {/* concentric abstract rings */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border opacity-20"
        style={{ borderColor: fg }}
      />
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border opacity-20"
        style={{ borderColor: fg }}
      />
      {/* thin grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(${fg} 1px, transparent 1px)`,
          backgroundSize: "100% 28px",
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-semibold uppercase tracking-ultra opacity-80"
            style={{ color: fg }}
          >
            {product.drop_label || "KAVO"}
          </span>
          <span className="h-2 w-2 rounded-full" style={{ background: fg }} />
        </div>

        <div className="leading-none">
          <div
            className={`font-display ${compact ? "text-5xl" : "text-7xl"} tracking-tight`}
            style={{ color: fg }}
          >
            {initials}
          </div>
        </div>

        <div
          className="text-[10px] font-medium uppercase tracking-ultra opacity-70"
          style={{ color: fg }}
        >
          KAVO® · LIMITED
        </div>
      </div>
    </div>
  );
}
