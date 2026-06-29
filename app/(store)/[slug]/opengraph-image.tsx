import { ImageResponse } from "next/og";
import { getStoreBySlug } from "@/lib/api/storefront";

export const alt = "Store Preview";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) {
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
            fontFamily: "sans-serif",
          }}
        >
          Store Not Found
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 1000,
            height: 500,
            backgroundColor: "white",
            borderRadius: 40,
            padding: 60,
            border: "1px solid #f0f0f0",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Main Store Icon/Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 140,
              height: 140,
              background: "linear-gradient(135deg, #365BEB 0%, #9233EA 100%)",
              borderRadius: 35,
              marginBottom: 40,
              fontSize: 70,
              color: "white",
              fontWeight: "bold",
            }}
          >
            {store?.logoUrl && !store.logoUrl.toLowerCase().endsWith(".svg") ? (
              <img
                src={store.logoUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 35,
                }}
              />
            ) : (
              store?.storeName?.charAt(0).toUpperCase() || "W"
            )}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 90,
              fontWeight: "900",
              color: "#111827",
              marginBottom: 24,
            }}
          >
            {store?.storeName || "Webtray Store"}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#4b5563",
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            {store?.description || `Premium products from ${store?.storeName || "our store"}.`}
          </div>
        </div>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            fontSize: 24,
            color: "#9ca3af",
            fontWeight: "600",
          }}
        >
          webtray.ng
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
