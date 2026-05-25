'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Package, Share2 } from 'lucide-react';
import { Product } from '@/hooks/use-customer-store';
import { ProductShareSheet } from './product-share-sheet';

interface ProductCardProps {
  product: Product;
  slug: string; // Add slug prop
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, slug, onAddToCart }) => {
  const router = useRouter();
  const isOutOfStock = product.quantity === 0;
  const [shareOpen, setShareOpen] = useState(false);

  const handleViewDetails = () => {
    router.push(`/store/${slug}/product/${product.id}`);
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
            onClick={(e) => { e.stopPropagation(); setShareOpen(true); }}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#365BEB] hover:text-white flex items-center justify-center text-gray-500 transition-all shrink-0"
            aria-label="Share product"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              sessionStorage.setItem('buyNowProduct', JSON.stringify(product));
              router.push(`/store/${slug}/checkout?buyNow=${product.id}`);
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
    <ProductShareSheet
      open={shareOpen}
      onClose={() => setShareOpen(false)}
      product={product}
      slug={slug}
    />
    </>
  );
};

export default ProductCard;