import { ImageResponse } from "next/og";
import { getProductById, getStoreBySlug } from "@/lib/api/storefront";

export const alt = "Product Preview";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const product = await getProductById(slug, productId);
  const store = await getStoreBySlug(slug);

  if (!product) {
    return new ImageResponse(
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
          }}
        >
          Product Not Found
        </div>
      ),
      { ...size }
    );
  }

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
          backgroundImage: "radial-gradient(circle at 25px 25px, #f8f9fa 2%, transparent 0%)",
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
            }}
          >
            {product.images?.[0] && !product.images[0].toLowerCase().endsWith(".svg") ? (
              <img
                src={product.images[0]}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 24,
                }}
              />
            ) : (
              <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", fontSize: 160 }}>📦</div>
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
            <div style={{ fontSize: 24, fontWeight: "bold", color: "#365BEB", marginBottom: 12 }}>
              {store?.storeName || "Webtray"}
            </div>
            <div style={{ fontSize: 60, fontWeight: "900", color: "#111827", marginBottom: 20, lineHeight: 1.1 }}>
              {product.name}
            </div>
            <div style={{ fontSize: 48, fontWeight: "800", color: "#111827", marginTop: 20 }}>
              NGN {parseFloat(product.price).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
