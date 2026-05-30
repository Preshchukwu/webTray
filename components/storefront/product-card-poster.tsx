"use client";

import React, { useRef, useState } from "react";
import { Download, Share2, Package, Store, LeafyGreen, ShieldCheck, TruckElectric, RefreshCcw, ShoppingBag, Tag, CheckCircle2, XCircle, Star } from "lucide-react";
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
import { ProductShareSheet } from "@/components/product-share-sheet";

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
function FeatureBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        padding: "1px 2px",
        borderRight: "1px solid #E8E3DC",
        flexShrink: 1,
        minWidth: 0,
        maxWidth: "36px",
      }}
    >
      <span style={{ 
        fontSize: "12px",
        background: "#EDE8E1",
        borderRadius: "50%",
        width: "20px",
        height: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>{icon}</span>
      <span
        style={{
          fontSize: "7px",
          color: "#7A7365",
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.1,
          whiteSpace: "normal",
          wordBreak: "break-word",
        }}
      >
        {label}
      </span>
    </div>
  );
}


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
    {
      icon: <Tag style={{ width: 16, height: 16, color: "#7A7365" }} />,
      label: capitalizeFirstLetter(categoryName || "Product"),
    },
    {
      icon: product.quantity > 0 ? (
        <CheckCircle2 style={{ width: 16, height: 16, color: "#7A7365" }} />
      ) : (
        <XCircle style={{ width: 16, height: 16, color: "#7A7365" }} />
      ),
      label: product.quantity > 0 ? "In Stock" : "Out of Stock",
    },
    ...(product.feature
      ? [
          {
            icon: <Star style={{ width: 16, height: 16, color: "#7A7365" }} />,
            label: "Featured",
          },
        ]
      : [
          {
            icon: <ShieldCheck style={{ width: 16, height: 16, color: "#7A7365" }} />,
            label: "Official",
          },
        ]),
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "390px",
        minWidth: "300px",
        borderRadius: "6px",
        padding: "5px",
        border: "1px solid #E8E3DC",
        background: "white",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        boxShadow: "rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset"
      }}
    >
      {/* box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 8px; */}
      {/* ── Image area ─────────────────────────────────────── */}
      <div style={{ position: "relative", aspectRatio: "390 / 220", width: "100%", overflow: "hidden", borderRadius: "6px", border: "1px solid #E8E3DC" }}>
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
            top: "0px",
            left: "12px",
            background: "rgba(74, 103, 65, 0.90)",
            color: "white",
            fontSize: "8px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 10px 0px 10px",
            borderTopRightRadius: "0px",
            borderTopLeftRadius: "0px",
            borderBottomRightRadius: "50px",
            borderBottomLeftRadius: "50px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "5px",
            backdropFilter: "blur(4px)",
            // border: "3px solid red",
            height: "55px",
          }}
        >
          <LeafyGreen style={{ width: 16, height: 16, color: "white" }} />
          <span>{product.feature ? "Featured Pick" : capitalizeFirstLetter(categoryName || "Product")}</span>
        </div>

        {/* Top-right store badge */}
        <div
          style={{
            position: "absolute",
            top: "6px",
            right: "12px",
            // background: "rgba(255,255,255,0.92)",
            // borderRadius: "14px",
            padding: "7px 10px",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            // backdropFilter: "blur(4px)",
            // boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "#F5F0EA",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Store style={{ width: 16, height: 16, color: "#7A7365" }} />
          </div>
          <div 
          style={{ background: "#F5F0EA", padding: "4px 8px", borderRadius: "8px" }}
          >
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
      <div style={{ background: "white", padding: "8px 12px", display: "flex", gap: "12px", flexGrow: 1, alignItems: "center" }}>
        <div style={{ width: "50%", minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.25 }}>
            {capitalizeFirstLetter(product.name)}
          </h3>
          <div style={{ position: "relative", textAlign: "center", margin: "8px 0" }}>
            <hr style={{ border: "1px solid #E8E3DC", margin: 0 }} />
          </div>
          <p style={{ margin: 0, fontSize: "12px", color: "#4F4F4F", lineHeight: 1.4, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", wordBreak: "break-word" }}>
            {product.description}
          </p>
        </div>

        <div style={{ width: "1px", background: "#D4CEC6", alignSelf: "stretch" }} />

        <div style={{ width: "50%", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0, flexWrap: "nowrap", padding: "2px 0", overflow: "visible" }}>
            {featureBadges.map((b) => (
              <FeatureBadge key={b.label} icon={b.icon} label={b.label} />
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "1px", flexShrink: 0 }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
              ₦{price}
            </span>
            <span style={{ fontSize: "12px", color: "#7A7365", textDecoration: "line-through", whiteSpace: "nowrap" }}>
              ₦{Math.round(Number(product.price) * 1.2).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div
        style={{
          background: "#EDE8E1",
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          borderRadius: "10px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck style={{ width: 16, height: 16, color: "#000000" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", color: "#111827", fontSize: "8px", fontWeight: 600, lineHeight: 1.1 }}>
                <span>Secure</span>
                <span>Payment</span>
              </div>
            </div>
            <div style={{ width: "1px", height: "22px", background: "#D4CEC6" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <TruckElectric style={{ width: 16, height: 16, color: "#000000" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", color: "#111827", fontSize: "8px", fontWeight: 600, lineHeight: 1.1 }}>
                <span>Free</span>
                <span>Delivery</span>
              </div>
            </div>
            <div style={{ width: "1px", height: "22px", background: "#D4CEC6" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <RefreshCcw style={{ width: 16, height: 16, color: "#000000" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "1px", color: "#111827", fontSize: "8px", fontWeight: 600, lineHeight: 1.1 }}>
                <span>Easy</span>
                <span>Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* WebTray branding */}
        <div style={{ display: "flex", alignItems: "center", gap: "0px" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShoppingBag style={{ width: 14, height: 14, color: "#111827" }} />
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
  const [shareOpen, setShareOpen] = useState(false);

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



  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[420px] p-6 rounded-[24px] gap-0">
        <DialogHeader className="mb-8">
          <DialogTitle className="text-[17px] font-semibold text-[#111827]">
            Product Card
          </DialogTitle>
          <p className="text-xs text-[#808080] mt-0.5">
            Download or share a ready-to-post product card
          </p>
        </DialogHeader>

        {/* Card preview */}
        <div className="flex w-full justify-center overflow-auto md:overflow-hidden">
          <div ref={cardRef} className="w-full max-w-[390px]">
            <ProductPoster
              product={product}
              storeName={storeName}
              categoryName={categoryName}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <Button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 rounded-full bg-[#111827] hover:bg-slate-800 text-white gap-2 h-10"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting…" : "Download"}
          </Button>
          <Button
            onClick={() => setShareOpen(true)}
            disabled={isExporting}
            className="flex-1 rounded-full bg-[#365BEB] hover:bg-[#365BEB]/90 text-white gap-2 h-10"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </DialogContent>
      
      <ProductShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        product={product}
        slug={slug}
        storeName={storeName}
      />
    </Dialog>
  );
}
