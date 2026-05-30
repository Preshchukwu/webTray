import { ImageResponse } from "next/og";
import { getProductById, getStoreBySlug } from "@/lib/api/storefront";

export const alt = "Product Preview";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

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
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (contentType.includes("svg")) return null;
    const base64 = Buffer.from(buf).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  try {
    const { slug, productId } = await params;

    const [product, store] = await Promise.all([
      getProductById(slug, productId),
      getStoreBySlug(slug),
    ]);

    if (!product) return fallback("Product Not Found");

    const imageUrl = product.images?.[0];
    const productImageSrc =
      imageUrl && !imageUrl.toLowerCase().endsWith(".svg")
        ? await safeImageDataUrl(imageUrl)
        : null;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fff",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, #f8f9fa 2%, transparent 0%)",
            backgroundSize: "50px 50px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              width: 1050,
              height: 520,
              backgroundColor: "white",
              borderRadius: 32,
              padding: 50,
              border: "1px solid #f0f0f0",
            }}
          >
            {/* Product Image */}
            <div
              style={{
                display: "flex",
                width: 420,
                height: 420,
                backgroundColor: "#f9fafb",
                borderRadius: 24,
                marginRight: 50,
                border: "1px solid #f3f4f6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {productImageSrc ? (
                <img
                  src={productImageSrc}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 24,
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 160,
                  }}
                >
                  📦
                </div>
              )}
            </div>

            {/* Details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 480,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "#365BEB",
                  marginBottom: 12,
                }}
              >
                {store?.storeName || "Webtray"}
              </div>
              <div
                style={{
                  fontSize: 60,
                  fontWeight: "900",
                  color: "#111827",
                  marginBottom: 20,
                  lineHeight: 1.1,
                }}
              >
                {product.name}
              </div>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: "800",
                  color: "#111827",
                  marginTop: 20,
                }}
              >
                NGN {parseFloat(product.price).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ),
      { ...size }
    );
  } catch {
    return fallback("Webtray");
  }
}
