// app/store/[slug]/_components/cart-sidebar.tsx
"use client";

import React from "react";
import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useCartStore } from "@/store/use-cart-store";
import { useStorefront } from "@/hooks/use-customer-store";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CartSidebarProps {
  showCart: boolean;
  setShowCart: (show: boolean) => void;
}

export default function CartSidebar({ showCart, setShowCart }: CartSidebarProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  
  const { allProducts, categories } = useStorefront(slug);
  const storeId = categories[0]?.storeId || allProducts[0]?.storeId;

  const cart = useCartStore((state) => state.cart);
  // Filter cart by current store
  const storeCart = cart.filter(item => item.storeId === storeId);
  
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  
  // Calculate totals from filtered cart
  const cartTotal = storeCart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.cartQuantity,
    0
  );
  
  const cartCount = storeCart.reduce(
    (sum, item) => sum + item.cartQuantity,
    0
  );

  const handleRemoveFromCart = (productId: number, productName: string) => {
    removeFromCart(productId);
    toast.success(`${productName} removed from cart`);
  };

  return (
    <Sheet open={showCart} onOpenChange={setShowCart}>
      <SheetContent className="w-full max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-xl font-bold">
            Shopping Cart ({cartCount})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {storeCart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Your cart is empty</p>
              <p className="text-gray-500 text-sm mt-2">
                Add products to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {storeCart.map((item) => {
                const imageUrl = item.images?.[0];
                const hasValidImage = imageUrl && imageUrl.trim() !== '';
                
                return (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-white rounded flex-shrink-0 overflow-hidden border">
                        {hasValidImage ? (
                          <Image
                            width={100}
                            height={100}
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <ShoppingCart className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate text-sm">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-semibold">
                          ₦{parseFloat(item.price).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            onClick={() => updateQuantity(item.id, -1)}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-medium w-8 text-center text-sm">
                            {item.cartQuantity}
                          </span>
                          <Button
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={item.cartQuantity >= item.quantity}
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleRemoveFromCart(item.id, item.name)}
                            variant="ghost"
                            size="icon"
                            className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase">
                          Stock: {item.quantity} available
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {storeCart.length > 0 && (
          <div className="border-t p-4 bg-white">
            <div className="flex justify-between leading-[100%] items-center mb-4">
              <span className="text-lg text-[#4D4D4D] text-[20px] font-bold">Total:</span>
              <span className="text-[26px] font-bold text-[#1A1A1A]">
                ₦{cartTotal.toLocaleString()}
              </span>
            </div>
            <Button
              onClick={() => {
                setShowCart(false);
                router.push(`/store/${slug}/checkout`);
              }}
              className="w-full bg-[#111827] text-white py-3 text-[16px] rounded-lg font-bold transition shadow-lg hover:bg-[#1f2937]"
            >
              Proceed to Checkout
            </Button>
            <div>
              <p className="text-center text-[14px] font-bold text-[#4D4D4D] mt-2">
                We accept Bank Transfer, USSD, Debit/Credit Cards
              </p>
              <div className="flex justify-center items-center gap-3 mt-3">
                <Image
                  src="/visa.png"
                  alt="Visa"
                  width={30}
                  height={28}
                  className="object-contain"
                />  
                <Image
                  src="/master.png"
                  alt="Mastercard"
                  width={30}
                  height={28}
                  className="object-contain"
                />  
                <Image
                  src="/paypal.png"
                  alt="PayPal"
                  width={40}
                  height={28}
                  className="object-contain"
                />  
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}