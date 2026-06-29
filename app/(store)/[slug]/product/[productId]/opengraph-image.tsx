import { ImageResponse } from "next/og";
import { getProductById, getStorefront } from "@/lib/api/storefront";

export const alt = "Product Preview";
export const size = { width: 1200, height: 1200 };
export const contentType = "image/png";

/* ---------- helpers ---------- */

const fallback = (message: string) =>
  new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "#111827",
        }}
      >
        {message}
      </div>
    ),
    { ...size }
  );

async function safeImageDataUrl(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "image/jpeg";
    if (ct.includes("svg")) return null;
    const buf = await res.arrayBuffer();
    return `data:${ct};base64,${Buffer.from(buf).toString("base64")}`;
  } catch {
    return null;
  }
}

// Google Fonts serves TTF to server-side fetches (no browser UA),
// which satori can parse. Subsetted by `text` so it's small + fast.
async function loadFont(
  weight: number,
  text: string
): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&text=${encodeURIComponent(
      text
    )}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const css = await (await fetch(url, { signal: controller.signal })).text();
    clearTimeout(timeout);
    const match = css.match(/src: url\((.+?)\) format\(/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

/* ---------- icons (lucide paths) ---------- */

const Icon = ({
  d,
  size = 20,
  color = "#6b7280",
}: {
  d: string;
  size?: number;
  color?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d.split("|").map((p, i) => (
      <path key={i} d={p} />
    ))}
  </svg>
);

const ICONS = {
  shield:
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
  truck:
    "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2|M15 18H9|M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14|M5 20a2 2 0 1 0 4 0|M15 20a2 2 0 1 0 4 0",
  rotate: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8|M3 3v5h5",
  bag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z|M3 6h18|M16 10a4 4 0 0 1-8 0",
  store: "M3 9l1.5-5h15L21 9|M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9|M3 9h18",
  tag: "M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.41l8.7 8.7a2 2 0 0 0 2.83 0l6.59-6.59a2 2 0 0 0 0-2.83z|M7.5 7.5h.01",
  check: "M21.8 10A10 10 0 1 1 17 3.34|m9 11 3 3L22 4",
};

/* ---------- image ---------- */

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  try {
    const { slug, productId } = await params;

    const [product, storefront] = await Promise.all([
      getProductById(slug, productId),
      getStorefront(slug),
    ]);

    if (!product) return fallback("Product Not Found");

    const { store, categories } = storefront;
    const storeName = store?.storeName || "Webtray Store";
    const categoryName =
      categories.find((c: { id: number; name: string }) => c.id === product.categoryId)
        ?.name || "Store";

    const price = parseFloat(product.price) || 0;
    const original = Math.round(price * 1.2); // mockup shows a slashed compare-at price
    const fmt = (n: number) => `₦${n.toLocaleString("en-US")}`;
    const formattedPrice = fmt(price);
    const formattedOriginal = fmt(original);

    const inStock = (product.quantity ?? 0) > 0;
    const stockLabel = inStock ? "In Stock" : "Sold Out";
    const description = (product.description || "").trim();
    const shortDesc =
      description.length > 120 ? description.slice(0, 120).trimEnd() + "…" : description;

    // fetch product image + store logo in parallel
    const imageUrl = product.images?.[0];
    const [productImageSrc, logoSrc] = await Promise.all([
      imageUrl && !imageUrl.toLowerCase().endsWith(".svg")
        ? safeImageDataUrl(imageUrl)
        : Promise.resolve(null),
      store?.logoUrl && !store.logoUrl.toLowerCase().endsWith(".svg")
        ? safeImageDataUrl(store.logoUrl)
        : Promise.resolve(null),
    ]);

    // font subset: every glyph we render
    const glyphSource =
      product.name +
      shortDesc +
      storeName +
      categoryName +
      formattedPrice +
      formattedOriginal +
      stockLabel +
      "WEBTRAY MARKETPLACE Secure Payment Worldwide Delivery Easy Returns Official" +
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.…₦";
    const glyphText = Array.from(new Set(glyphSource.split(""))).join("");

    const [regular, semibold, bold] = await Promise.all([
      loadFont(400, glyphText),
      loadFont(600, glyphText),
      loadFont(800, glyphText),
    ]);

    const fonts = [
      regular && { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
      semibold && { name: "Inter", data: semibold, weight: 600 as const, style: "normal" as const },
      bold && { name: "Inter", data: bold, weight: 800 as const, style: "normal" as const },
    ].filter(Boolean) as {
      name: string;
      data: ArrayBuffer;
      weight: 400 | 600 | 800;
      style: "normal";
    }[];

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundColor: "#d9d4cc",
            padding: 28,
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              backgroundColor: "white",
              borderRadius: 36,
              overflow: "hidden",
            }}
          >
            {/* ===== Image area ===== */}
            <div
              style={{
                display: "flex",
                position: "relative",
                width: "100%",
                height: 660,
              }}
            >
              {productImageSrc ? (
                <img
                  src={productImageSrc}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#e5e7eb",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 140,
                  }}
                >
                  📦
                </div>
              )}

              {/* watermark */}
              <div
                style={{
                  position: "absolute",
                  top: -120,
                  left: -120,
                  right: -120,
                  bottom: -120,
                  display: "flex",
                  flexWrap: "wrap",
                  alignContent: "flex-start",
                  transform: "rotate(-22deg)",
                  opacity: 0.16,
                }}
              >
                {Array.from({ length: 90 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 30,
                      fontWeight: 800,
                      color: "#ffffff",
                      margin: "16px 26px",
                      letterSpacing: 2,
                    }}
                  >
                    WEBTRAY
                  </span>
                ))}
              </div>

              {/* store / category badge */}
              <div
                style={{
                  position: "absolute",
                  top: 28,
                  right: 28,
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.94)",
                  borderRadius: 20,
                  padding: "12px 18px 12px 12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: "#EEF2FF",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    marginRight: 12,
                  }}
                >
                  {logoSrc ? (
                    <img
                      src={logoSrc}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Icon d={ICONS.store} size={26} color="#365BEB" />
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>
                    {storeName}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 400, color: "#6b7280" }}>
                    {categoryName}
                  </span>
                </div>
              </div>
            </div>

            {/* ===== Details ===== */}
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                padding: "0 44px",
              }}
            >
              {/* name + description */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  paddingRight: 28,
                }}
              >
                <span
                  style={{
                    fontSize: 46,
                    fontWeight: 800,
                    color: "#111827",
                    lineHeight: 1.1,
                  }}
                >
                  {product.name}
                </span>
                <div
                  style={{
                    display: "flex",
                    width: 64,
                    height: 3,
                    backgroundColor: "#e5e7eb",
                    borderRadius: 2,
                    margin: "18px 0",
                  }}
                />
                {shortDesc ? (
                  <span style={{ fontSize: 22, color: "#6b7280", lineHeight: 1.45 }}>
                    {shortDesc}
                  </span>
                ) : null}
              </div>

              {/* feature chips */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 16,
                  padding: "0 30px",
                  borderLeft: "1px solid #f0f0f0",
                  borderRight: "1px solid #f0f0f0",
                }}
              >
                {[
                  { icon: ICONS.tag, label: categoryName },
                  { icon: ICONS.check, label: stockLabel },
                  { icon: ICONS.shield, label: "Official" },
                ].map((chip, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: "#f3f4f6",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon d={chip.icon} size={22} color="#365BEB" />
                    </div>
                    <span
                      style={{ fontSize: 18, fontWeight: 600, color: "#4b5563" }}
                    >
                      {chip.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* price */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingLeft: 28,
                }}
              >
                <span style={{ fontSize: 44, fontWeight: 800, color: "#111827" }}>
                  {formattedPrice}
                </span>
                {/* <span
                  style={{
                    fontSize: 24,
                    color: "#9ca3af",
                    textDecoration: "line-through",
                    marginTop: 4,
                  }}
                >
                  {formattedOriginal}
                </span> */}
              </div>
            </div>

            {/* ===== Bottom trust bar ===== */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "22px 44px",
                backgroundColor: "#ece8e1",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                {[
                  { icon: ICONS.shield, label: "Secure Payment" },
                  { icon: ICONS.truck, label: "Worldwide Delivery" },
                  { icon: ICONS.rotate, label: "Easy Returns" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center" }}>
                    {i > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          width: 1,
                          height: 22,
                          backgroundColor: "#cfc8ba",
                          margin: "0 22px",
                        }}
                      />
                    ) : null}
                    <Icon d={item.icon} size={22} color="#6b7280" />
                    <span
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        color: "#57534e",
                        marginLeft: 8,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* branding */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <Icon d={ICONS.bag} size={26} color="#111827" />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginLeft: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#111827",
                      lineHeight: 1,
                      letterSpacing: 1,
                    }}
                  >
                    WEBTRAY
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#6b7280",
                      letterSpacing: 3,
                    }}
                  >
                    MARKETPLACE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      { ...size, fonts: fonts.length ? fonts : undefined }
    );
  } catch {
    return fallback("Webtray");
  }
}
