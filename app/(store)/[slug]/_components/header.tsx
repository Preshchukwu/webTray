// app/store/[slug]/_components/header.tsx
"use client";

import { ShoppingCart } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/use-cart-store";
import { useStorefront } from "@/hooks/use-customer-store";
import CartSidebar from "./cart-sidebar";

export default function StoreHeader() {
  const [showCart, setShowCart] = useState(false);
  const [storeName, setStoreName] = useState("Store");
  const params = useParams();
  const slug = params.slug as string;

  const { allProducts, categories, store } = useStorefront(slug);
  
  // Resolve storeId from fetched data
  const storeId = categories[0]?.storeId || allProducts[0]?.storeId || store?.id;

  const cart = useCartStore((state) => state.cart);
  // Filter cart by current store
  const storeCart = cart.filter(item => item.storeId === storeId);
  const cartCount = storeCart.reduce((sum, item) => sum + item.cartQuantity, 0);

  useEffect(() => {
    if (store?.storeName) {
      setStoreName(store.storeName);
    } else if (slug) {
      // Fallback: Format the slug to a readable name
      const formattedName = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setStoreName(formattedName);
    }
  }, [slug, store?.storeName]);

  const handleContactOwner = () => {
    if (!store?.phone) return;
    
    // Clean phone number (remove +, spaces, etc) for WhatsApp link
    const cleanPhone = store.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left section */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                {store?.logoUrl && (
                  <div className="relative w-10 h-10 overflow-hidden rounded-md border border-gray-100">
                    <Image 
                      src={store.logoUrl} 
                      alt={storeName} 
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h1 className="text-xl font-bold tracking-tight text-gray-900">{storeName}</h1>
              </div>
              <nav className="hidden md:flex gap-6">
                <Link href={`/store/${slug}`} className="text-sm text-gray-600 hover:text-gray-900">
                  Home
                </Link>
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Products
                </button>
              </nav>
            </div>
            {/* Right section */}
            <div className="flex items-center gap-4">
              <Link
                href={`/store/${slug}/orders`}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium hidden md:block"
              >
                Orders
              </Link>
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button 
                onClick={handleContactOwner}
                disabled={!store?.phone}
                className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition disabled:opacity-50"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </header>
      <CartSidebar showCart={showCart} setShowCart={setShowCart} />
    </>
  );
}