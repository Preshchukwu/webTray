"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Package } from "lucide-react";
import { Product, useStorefront } from "@/hooks/use-customer-store";

interface ProductCardProps {
  product: Product;
  slug: string; // Add slug prop
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  slug,
  onAddToCart,
}) => {
  const router = useRouter();
  const { store } = useStorefront(slug);
  const isOutOfStock = product.quantity === 0;

  const handleViewDetails = () => {
    router.push(`/${slug}/product/${product.id}`);
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const productUrl = `${origin}/store/${slug}/product/${product.id}`;
    const shareText = `Check out ${product.name}${store?.storeName ? ` on ${store.storeName}` : ""} — ₦${parseFloat(product.price).toLocaleString()}`;
    const whatsappMessage = encodeURIComponent(`${shareText}\n${productUrl}`);
    const phone = store?.phone ? store.phone.replace(/[^0-9]/g, '') : '';
    window.open(`https://wa.me/${phone}?text=${whatsappMessage}`, "_blank");
  };

  return (
    <>
      <div
        className="group bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleViewDetails}
      >
        <div className="relative h-48 bg-gray-100 flex items-center justify-center">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <Package className="w-12 h-12 text-gray-300" />
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                Out of Stock
              </span>
            </div>
          )}
          {product.feature && !isOutOfStock && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Featured
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
          {product.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              ₦{parseFloat(product.price).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {product.quantity} in stock
            </p>
          </div>
          <button
            onClick={handleWhatsAppShare}
            className="w-9 h-9 rounded-full bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white flex items-center justify-center transition-all shrink-0"
            aria-label="Contact store owner on WhatsApp"
            title="Contact store owner on WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413Z"/>
            </svg>
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              sessionStorage.setItem('buyNowProduct', JSON.stringify(product));
              router.push(`/${slug}/checkout?buyNow=${product.id}`);
            }}
            disabled={isOutOfStock}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product);
            }}
            disabled={isOutOfStock}
            className={`p-2 border rounded-md transition ${
              isOutOfStock
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </>
  );
};

export default ProductCard;
