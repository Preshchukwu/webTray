"use client";

import React, { useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  ChevronLeft,
  ChevronRight,
  Package
} from "lucide-react";
import Image from "next/image";
import { useStorefront } from "@/hooks/use-customer-store";
import { useCartStore } from "@/store/use-cart-store";
import { toast } from "sonner";

interface ProductClientProps {
  slug: string;
  productId: string;
}

// Product Detail Loading Skeleton
const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-7 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-7 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="h-8 w-20 bg-gray-200 rounded"></div>
      </div>

      {/* Product Content */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Images Section */}
          <div className="flex gap-3">
            {/* Main Image */}
            <div className="flex-1">
              <div className="bg-gray-200 rounded-lg aspect-square"></div>
            </div>

            {/* Thumbnails */}
            <div className="flex flex-col gap-2 w-16">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-gray-200 rounded aspect-square"
                ></div>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div>
            <div className="h-5 w-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-3/4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-32 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mb-3"></div>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="w-8 h-6 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-gray-200 rounded"></div>
              <div className="w-24 h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mb-8">
          <div className="h-6 w-32 bg-gray-200 rounded mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Related Products Section */}
        <div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                  <div className="h-5 w-20 bg-gray-200 rounded"></div>
                  <div className="flex gap-1.5">
                    <div className="flex-1 h-7 bg-gray-200 rounded"></div>
                    <div className="w-7 h-7 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductClient = ({ slug, productId }: ProductClientProps) => {
  const router = useRouter();
  const { allProducts, isFetchingAllProducts, categories } = useStorefront(slug);
  const addToCart = useCartStore((state) => state.addToCart);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = useMemo(() => {
    return allProducts.find((p) => p.id === parseInt(productId));
  }, [allProducts, productId]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(
        (p) =>
          p.categoryId === product.categoryId &&
          p.id !== product.id &&
          p.visible
      );
  }, [allProducts, product]);

  const getCategoryName = (categoryId: number) => {
    const category = categories?.find((c) => c.id === categoryId);
    return category?.name || "Category";
  };

  if (isFetchingAllProducts) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <button
            onClick={() => router.push(`/store/${slug}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.quantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    const result = addToCart(product, quantity);

    if (result === "added") {
      toast.success(`${product.name} (${quantity}) added to your cart.`);
      setQuantity(1);
    } else if (result === "incremented") {
      toast(`${product.name} is already in your cart.`, {
        description: `We've added ${quantity} more to your cart!`,
        icon: <ShoppingCart className="h-4 w-4" />,
      });
      setQuantity(1);
    } else {
      toast.error(`Cannot add more of ${product.name} to the cart.`, {
        description: "Stock limit reached.",
      });
    }
  };

  const handleBuyNow = () => {
    const result = addToCart(product, quantity);

    if (result !== "no_stock") {
      router.push(`/store/${slug}/checkout`);
    } else {
      toast.error(`Cannot add more of ${product.name} to the cart.`);
    }
  };

  const handleRelatedProductAddToCart = (relatedProduct: typeof product) => {
    const result = addToCart(relatedProduct, 1);
    
    if (result === "added") {
      toast.success(`${relatedProduct.name} added to cart.`);
    } else if (result === "incremented") {
      toast(`${relatedProduct.name} updated in cart.`, {
        description: "Quantity incremented!",
        icon: <ShoppingCart className="h-4 w-4" />,
      });
    } else {
      toast.error(`Cannot add more of ${relatedProduct.name} to the cart.`);
    }
  };

  const productImages = product.images || [];
  const selectedImage = productImages[selectedImageIndex] || productImages[0];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === productImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 text-sm px-3 py-1.5 border rounded hover:bg-gray-50"
        >
          ← Back
        </button>
      </div>

      {/* Product Content */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Images Section - Main image LEFT, Thumbnails RIGHT */}
          <div className="flex gap-3">
            {/* Main Image with Navigation */}
            <div className="flex-1 relative">
              <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-1.5 rounded-full shadow"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Column on RIGHT */}
            {productImages.length > 1 && (
              <div className="flex flex-col gap-2 w-16">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative border rounded overflow-hidden aspect-square transition ${
                      selectedImageIndex === index
                        ? "border-gray-900 ring-1 ring-gray-900"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            {/* Category Badge */}
            <span className="inline-block text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded mb-2">
              {getCategoryName(product.categoryId)}
            </span>

            {/* Product Name & Wishlist */}
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {product.name}
              </h1>
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <Heart className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Price */}
            <div className="text-2xl font-bold text-gray-900 mb-3">
              ₦ {parseFloat(product.price).toLocaleString()}
            </div>

            {/* Delivery Info */}
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
              <span className="text-sm">ⓘ</span>
              <span>Order in 04:30:26 to get free delivery</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4].map((star) => (
                  <span key={star} className="text-yellow-400 text-sm">
                    ★
                  </span>
                ))}
                <span className="text-gray-300 text-sm">★</span>
              </div>
              <span className="text-xs text-blue-600 hover:underline cursor-pointer">
                (See ratings)
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 border rounded hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.quantity}
                  className="w-8 h-8 border rounded hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm font-semibold text-gray-500">
                Stock Available: {product.quantity}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleBuyNow}
                disabled={product.quantity === 0}
                className="flex-1 bg-gray-900 text-white py-2 px-4 rounded text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 flex items-center justify-center gap-1"
              >
                Buy Now
                <span>→</span>
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className="py-2 px-4 border border-gray-900 rounded hover:bg-gray-50 disabled:border-gray-300 flex items-center gap-1 text-sm"
              >
                Add to Cart
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3">Product Details</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {product.description ||
              "High-quality premium organic green tea leaves, carefully harvested from the lush hills of Japan, known for their vibrant color and rich flavor."}
          </p>
        </div>

        {/* You Might Also Like Section */}
         {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">You might also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition"
                >
                  <div 
                    className="aspect-square bg-gray-50 cursor-pointer relative flex items-center justify-center"
                    onClick={() => router.push(`/store/${slug}/product/${item.id}`)}
                  >
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="p-3">
                    <h4 
                      className="font-semibold text-sm text-gray-900 mb-1 truncate cursor-pointer"
                      onClick={() => router.push(`/store/${slug}/product/${item.id}`)}
                    >
                      {item.name}
                    </h4>
                    <span className="inline-block text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded mb-1">
                      {getCategoryName(item.categoryId)}
                    </span>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                      {item.description || 'High-quality product'}
                    </p>
                    <p className="text-base font-bold text-gray-900 mb-2">
                      ₦ {parseFloat(item.price).toLocaleString()}
                    </p>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => {
                          const result = addToCart(item, 1);
                          if (result !== "no_stock") {
                            router.push(`/store/${slug}/checkout`);
                          } else {
                            toast.error(`Cannot add more of ${item.name} to the cart.`);
                          }
                        }}
                        className="flex-1 bg-gray-900 text-white py-1.5 rounded text-xs font-medium hover:bg-gray-800 flex items-center justify-center gap-1"
                      >
                        Buy Now
                        <span className="text-[10px]">→</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRelatedProductAddToCart(item);
                        }}
                        className="px-2 py-1.5 border border-gray-900 rounded hover:bg-gray-50"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
