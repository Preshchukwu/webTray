"use client";

import React, { useRef, useState } from "react";
import { Download, Share2, Package, Store } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StoreProduct } from "@/types";
import { capitalizeFirstLetter } from "@/lib/capitalize";

interface ProductCardPosterProps {
  open: boolean;
  onClose: () => void;
  product: StoreProduct;
  storeName?: string | null;
  categoryName?: string;
  slug?: string | null;
}

/* ─── Watermark ─────────────────────────────────────────────────── */
function Watermark() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ userSelect: "none" }}
    >
      {Array.from({ length: 15 }).map((_, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: `${(i % 5) * 22 - 8}%`,
            left: `${Math.floor(i / 5) * 40 - 15}%`,
            transform: "rotate(-28deg)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "white",
            opacity: 0.18,
            whiteSpace: "nowrap",
          }}
        >
          webtray
        </span>
      ))}
    </div>
  );
}

/* ─── Trust badge ────────────────────────────────────────────────── */
function TrustBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <span style={{ fontSize: "13px" }}>{icon}</span>
      <span
        style={{
          fontSize: "9px",
          color: "#7A7365",
          lineHeight: 1.3,
          whiteSpace: "pre-line",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Feature circle ─────────────────────────────────────────────── */
function FeatureBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        padding: "8px 10px",
        borderRadius: "50px",
        border: "1px solid #E8E3DC",
        background: "#FAF8F5",
        minWidth: "60px",
      }}
    >
      <span style={{ fontSize: "14px" }}>{icon}</span>
      <span
        style={{
          fontSize: "8.5px",
          color: "#7A7365",
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── The actual product card (captured by html-to-image) ─────────── */
function ProductPoster({
  product,
  storeName,
  categoryName,
}: {
  product: StoreProduct;
  storeName?: string | null;
  categoryName?: string;
}) {
  const price = Number(product.price).toLocaleString();
  const imgSrc = product.images?.[0];

  const featureBadges = [
    { icon: "🛍️", label: capitalizeFirstLetter(categoryName || "Product") },
    { icon: product.quantity > 0 ? "✅" : "❌", label: product.quantity > 0 ? "In Stock" : "Out of Stock" },
    ...(product.feature ? [{ icon: "⭐", label: "Featured" }] : [{ icon: "🏪", label: "Official" }]),
  ];

  return (
    <div
      style={{
        width: "360px",
        background: "#F5F0EA",
        borderRadius: "24px",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      }}
    >
      {/* ── Image area ─────────────────────────────────────── */}
      <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
        {imgSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgSrc}
            alt={product.name}
            crossOrigin="anonymous"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #E8E3DC 0%, #D4CEC6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Package style={{ width: 56, height: 56, color: "#A8A09A" }} />
          </div>
        )}

        <Watermark />

        {/* Top-left badge */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: "rgba(74, 103, 65, 0.90)",
            color: "white",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "6px 10px",
            borderRadius: "50px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            backdropFilter: "blur(4px)",
          }}
        >
          <span>🌿</span>
          <span>{product.feature ? "Featured Pick" : capitalizeFirstLetter(categoryName || "Product")}</span>
        </div>

        {/* Top-right store badge */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(255,255,255,0.92)",
            borderRadius: "14px",
            padding: "7px 10px",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            backdropFilter: "blur(4px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "#F5F0EA",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Store style={{ width: 16, height: 16, color: "#7A7365" }} />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              {storeName || "My Store"}
            </div>
            <div style={{ fontSize: "9px", color: "#7A7365", lineHeight: 1.2 }}>
              {capitalizeFirstLetter(categoryName || "Store")}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content area ───────────────────────────────────── */}
      <div style={{ background: "white", padding: "16px 18px 14px" }}>
        {/* Name + price row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827", lineHeight: 1.25, marginBottom: "2px" }}>
              {capitalizeFirstLetter(product.name)}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#111827" }}>
              ₦{price}
            </div>
          </div>
        </div>

        {/* Decorative divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <div style={{ flex: 1, height: "1px", background: "#E8E3DC" }} />
          <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
            <path d="M0 5 C3 1 7 9 10 5 C13 1 17 9 20 5" stroke="#D4CEC6" strokeWidth="1.5"/>
          </svg>
          <div style={{ flex: 1, height: "1px", background: "#E8E3DC" }} />
        </div>

        {product.description && (
          <div
            style={{
              fontSize: "11px",
              color: "#7A7365",
              lineHeight: 1.6,
              marginBottom: "12px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </div>
        )}

        {/* Feature badges */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {featureBadges.map((b) => (
            <FeatureBadge key={b.label} icon={b.icon} label={b.label} />
          ))}
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div
        style={{
          background: "#EDE8E1",
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <TrustBadge icon="🔒" label={"Secure\nPayment"} />
          <div style={{ width: "1px", height: "22px", background: "#D4CEC6" }} />
          <TrustBadge icon="🚚" label={"Fast\nDelivery"} />
          <div style={{ width: "1px", height: "22px", background: "#D4CEC6" }} />
          <TrustBadge icon="↩️" label={"Easy\nReturns"} />
        </div>

        {/* WebTray branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              background: "#365BEB",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="0 0 24 24" width="11" height="11" fill="white">
              <path d="M6 2a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2V4a2 2 0 00-2-2H6zm0 2h12v13.5l-2-1-4 2-4-2-2 1V4z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "9px", fontWeight: 800, color: "#111827", letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1 }}>
              webtray
            </div>
            <div style={{ fontSize: "7px", color: "#7A7365", letterSpacing: "0.04em", lineHeight: 1.2 }}>
              MARKETPLACE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Modal ──────────────────────────────────────────────────────── */
export function ProductCardPoster({
  open,
  onClose,
  product,
  storeName,
  categoryName,
  slug,
}: ProductCardPosterProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const price = Number(product.price).toLocaleString();
  const productUrl =
    slug && typeof window !== "undefined"
      ? `${window.location.origin}/store/${slug}/product/${product.id}`
      : null;

  async function captureCard(): Promise<string | null> {
    if (!cardRef.current) return null;
    try {
      return await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: false,
      });
    } catch (err) {
      console.error("Card capture failed:", err);
      return null;
    }
  }

  async function handleDownload() {
    setIsExporting(true);
    try {
      const dataUrl = await captureCard();
      if (!dataUrl) { toast.error("Failed to export card"); return; }
      const link = document.createElement("a");
      link.download = `${product.name.replace(/\s+/g, "-").toLowerCase()}-webtray-card.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Card downloaded!");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleShare() {
    setIsExporting(true);
    try {
      const dataUrl = await captureCard();
      if (!dataUrl) { toast.error("Failed to export card"); return; }

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `${product.name}-card.png`, { type: "image/png" });

      const shareText = `Check out *${product.name}* — ₦${price}${productUrl ? `\n\n${productUrl}` : ""}`;

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: product.name,
          text: shareText,
          files: [file],
        });
      } else {
        // Fallback: WhatsApp
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Share failed. Try downloading instead.");
      }
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[420px] p-6 rounded-[24px] gap-0">
        <DialogHeader className="mb-5">
          <DialogTitle className="text-[17px] font-semibold text-[#111827]">
            Product Card
          </DialogTitle>
          <p className="text-xs text-[#808080] mt-0.5">
            Download or share a ready-to-post product card
          </p>
        </DialogHeader>

        {/* Card preview */}
        <div className="flex justify-center overflow-auto">
          <div ref={cardRef}>
            <ProductPoster
              product={product}
              storeName={storeName}
              categoryName={categoryName}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <Button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 rounded-full bg-[#111827] hover:bg-slate-800 text-white gap-2 h-10"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting…" : "Download"}
          </Button>
          <Button
            onClick={handleShare}
            disabled={isExporting}
            className="flex-1 rounded-full bg-[#365BEB] hover:bg-[#365BEB]/90 text-white gap-2 h-10"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
