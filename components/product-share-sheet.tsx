"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, Copy, Link2, Package } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ShareProduct {
  id: number;
  name: string;
  price: string | number;
  description?: string;
  images?: string[];
}

interface ProductShareSheetProps {
  open: boolean;
  onClose: () => void;
  product: ShareProduct | null;
  slug: string | null | undefined;
  storeName?: string | null;
}

// ─── Brand icons ──────────────────────────────────────────────────────────────
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ProductShareSheet({
  open,
  onClose,
  product,
  slug,
  storeName,
}: ProductShareSheetProps) {
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const productUrl = slug ? `${origin}/store/${slug}/product/${product.id}` : null;
  const price = parseFloat(String(product.price)).toLocaleString();
  const shareText = `Check out ${product.name}${storeName ? ` on ${storeName}` : ""} — ₦${price}`;

  const socials = [
    {
      label: "WhatsApp",
      icon: <WhatsAppIcon />,
      iconColor: "text-[#25D366]",
      bg: "bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20",
      action: () =>
        productUrl &&
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${productUrl}`)}`,
          "_blank"
        ),
    },
    {
      label: "X (Twitter)",
      icon: <XIcon />,
      iconColor: "text-black",
      bg: "bg-gray-100 hover:bg-gray-200 border border-gray-200",
      action: () =>
        productUrl &&
        window.open(
          `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`,
          "_blank"
        ),
    },
    {
      label: "Facebook",
      icon: <FacebookIcon />,
      iconColor: "text-[#1877F2]",
      bg: "bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20",
      action: () =>
        productUrl &&
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
          "_blank"
        ),
    },
  ];

  function handleCopy() {
    if (!productUrl) return;
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    toast.success("Product link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleNativeShare() {
    if (!productUrl || !navigator.share) return;
    navigator.share({ title: product!.name, text: shareText, url: productUrl });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-[28px] px-0 pt-0 pb-10 max-h-[90vh] border-0 shadow-2xl"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-5">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-6 flex flex-col gap-5">
          <SheetHeader className="text-left p-0">
            <SheetTitle className="text-[18px] font-bold text-[#111827]">
              Share Product
            </SheetTitle>
          </SheetHeader>

          {/* Product preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-[60px] h-[60px] rounded-xl overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  width={60}
                  height={60}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Package className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#111827] truncate text-sm">{product.name}</p>
              {product.description && (
                <p className="text-xs text-[#808080] mt-0.5 line-clamp-1">{product.description}</p>
              )}
              <p className="text-[#365BEB] font-bold mt-1">₦{price}</p>
            </div>
          </div>

          {/* Copy link row */}
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-gray-200 bg-white">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#808080] uppercase tracking-wide mb-0.5">
                Product link
              </p>
              <p className="text-sm text-[#4D4D4D] truncate">
                {productUrl ?? "Store slug not configured"}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleCopy}
              disabled={!productUrl}
              className={cn(
                "rounded-full h-9 px-4 gap-1.5 shrink-0 transition-all",
                copied
                  ? "bg-green-500 hover:bg-green-500 text-white"
                  : "bg-[#365BEB] hover:bg-[#365BEB]/90 text-white"
              )}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          {/* Social buttons */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-[#808080] uppercase tracking-wider">
              Share via
            </p>
            <div className="grid grid-cols-3 gap-3">
              {socials.map((s) => (
                <button
                  key={s.label}
                  onClick={s.action}
                  disabled={!productUrl}
                  className={cn(
                    "flex flex-col items-center gap-2 py-4 rounded-2xl transition-all disabled:opacity-40",
                    s.bg
                  )}
                >
                  <span className={cn("flex items-center justify-center", s.iconColor)}>
                    {s.icon}
                  </span>
                  <span className="text-xs font-medium text-[#4D4D4D]">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Native share */}
          {typeof navigator !== "undefined" && "share" in navigator && productUrl && (
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-gray-200 text-[#4D4D4D] text-sm font-medium hover:bg-gray-50 transition-all"
            >
              <Link2 className="w-4 h-4" />
              More options
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
