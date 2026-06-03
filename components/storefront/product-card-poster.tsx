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

function Watermark() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ userSelect: "none" }}
    >
      {Array.from({ length: 15 }).map((_, i) => (
        <span
          key={i}
          className="absolute text-[13px] font-bold tracking-[0.15em] uppercase text-white/20 whitespace-nowrap rotate-[-28deg]"
          style={{
            top: `${(i % 5) * 22 - 8}%`,
            left: `${Math.floor(i / 5) * 40 - 15}%`,
          }}
        >
          webtray
        </span>
      ))}
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
      icon: <Tag className="w-3.5 h-3.5 text-indigo-500" />,
      label: capitalizeFirstLetter(categoryName || "Product"),
    },
    {
      icon: product.quantity > 0 ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-red-600" />
      ),
      label: product.quantity > 0 ? "In Stock" : "Out of Stock",
    },
    ...(product.feature
      ? [
          {
            icon: <Star className="w-3.5 h-3.5 text-indigo-500" />,
            label: "Featured",
          },
        ]
      : [
          {
            icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />,
            label: "Official",
          },
        ]),
  ];

  return (
    <div className="w-full rounded-xl bg-white overflow-hidden font-sans border">
      <div className="relative w-full aspect-[16/11] bg-white p-4 flex items-center justify-center overflow-hidden border-b">
        {imgSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgSrc}
            alt={product.name}
            crossOrigin="anonymous"
                className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#E8E3DC] to-[#D4CEC6] flex items-center justify-center">
            <Package className="w-16 h-16 text-[#A8A09A]" />
          </div>
        )}

        <Watermark />

        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-2 sm:gap-2.5 shadow-sm">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
            <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <div className="text-xs sm:text-sm font-extrabold text-gray-900 leading-tight">
              {storeName || "My Store"}
            </div>
            <div className="text-[9px] sm:text-[11px] text-gray-500 leading-tight">
              {capitalizeFirstLetter(categoryName || "Store")}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 sm:p-6 md:px-7 md:py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-0">
        
        <div className="flex-1 min-w-0 sm:pr-5 flex flex-col w-full">
          <h3 className="m-0 text-[20px] md:text-[28px] font-extrabold text-gray-900 leading-tight tracking-tight line-clamp-2 break-words">
            {capitalizeFirstLetter(product.name)}
          </h3>
          <div className="w-10 sm:w-12 h-[2px] bg-gray-200 my-3 sm:my-4" />
          <p className="m-0 text-sm text-gray-500 leading-relaxed line-clamp-2">
            {product.description || "No description provided."}
          </p>
        </div>

        <div className="flex flex-row sm:flex-col gap-3 sm:gap-3 sm:border-x border-gray-100 sm:px-5 shrink-0 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {featureBadges.map((b) => (
            <div key={b.label} className="flex items-center gap-2.5 bg-blue-50/50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg sm:rounded-none shrink-0">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                {b.icon}
              </div>
              <span className="text-[13px] font-semibold text-gray-600 whitespace-nowrap">
                {b.label}
              </span>
            </div>
          ))}
        </div>

        {/* Right: Price */}
        <div className="sm:pl-5 flex justify-start sm:justify-end shrink-0 w-full sm:w-auto">
          <span className="text-[20px] md:text-[28px] font-extrabold text-gray-900 tracking-tight whitespace-nowrap">
            ₦{price}
          </span>
        </div>

      </div>

      <div className="bg-[#EBE6DE] p-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row items-center sm:justify-between gap-5 sm:gap-0">
        <div className="flex items-center justify-around sm:justify-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" strokeWidth={1.5} />
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-600 leading-[1.2] flex flex-col">
              <span>Secure</span>
              <span>Payment</span>
            </span>
          </div>
          <div className="w-[1px] h-4 sm:h-5 bg-[#D1D5DB] hidden sm:block" />
          <div className="flex items-center gap-2">
            <TruckElectric className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" strokeWidth={1.5} />
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-600 leading-[1.2] flex flex-col">
              <span>Worldwide</span>
              <span>Delivery</span>
            </span>
          </div>
          <div className="w-[1px] h-4 sm:h-5 bg-[#D1D5DB] hidden sm:block" />
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" strokeWidth={1.5} />
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-600 leading-[1.2] flex flex-col">
              <span>Easy</span>
              <span>Returns</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 border-t border-gray-300 sm:border-0 pt-4 sm:pt-0 w-full sm:w-auto justify-center sm:justify-end">
          <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-900" strokeWidth={2} />
          <div className="flex flex-col">
            <div className="text-[11px] sm:text-[13px] font-extrabold text-gray-900 tracking-wider uppercase leading-none">
              webtray
            </div>
            <div className="text-[8px] sm:text-[9px] text-gray-600 tracking-wider leading-tight font-semibold mt-0.5">
              MARKETPLACE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <DialogContent className="max-w-[600px] w-[95vw] sm:w-full p-4 sm:p-6 rounded-[24px] gap-0 max-h-[95vh] overflow-y-auto">
        <DialogHeader className="mb-4 sm:mb-6">
          <DialogTitle className="text-base sm:text-[17px] font-semibold text-[#111827]">
            Product Card
          </DialogTitle>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
            Download or share a ready-to-post product card
          </p>
        </DialogHeader>

        <div className="flex w-full justify-center">
          <div ref={cardRef} className="w-full max-w-[500px]">
            <ProductPoster
              product={product}
              storeName={storeName}
              categoryName={categoryName}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={handleDownload}
            disabled={isExporting}
            className="flex-1 rounded-full bg-[#111827] hover:bg-slate-800 text-white gap-2 h-11"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting…" : "Download"}
          </Button>
          <Button
            onClick={() => setShareOpen(true)}
            disabled={isExporting}
            className="flex-1 rounded-full bg-[#365BEB] hover:bg-[#365BEB]/90 text-white gap-2 h-11"
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
