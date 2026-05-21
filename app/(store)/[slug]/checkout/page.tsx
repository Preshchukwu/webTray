// ============================================
// FILE: app/store/[slug]/checkout/page.tsx
// ============================================

'use client';

import React, { useState, use, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShoppingCart, X } from 'lucide-react';
import { useCartStore } from '@/store/use-cart-store';
import { useStorefront } from '@/hooks/use-customer-store';
import { toast } from 'sonner';
import * as yup from 'yup';
import Image from 'next/image';
import { initializePaystackOrder } from '@/lib/api/storefront';
import { Loader2, Trash2, Plus, Minus } from 'lucide-react';
import { useNigeriaLocations } from '@/hooks/use-nigeria-locations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

// Yup validation schema
const shippingSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters'),
  email: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  state: yup
    .string()
    .required('Please select a state'),
  city: yup
    .string()
    .required('Please select a city'),
  address: yup
    .string()
    .required('Street address is required')
    .min(10, 'Please provide a detailed address (at least 10 characters)'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9+\s()-]+$/, 'Please enter a valid phone number')
    .min(11, 'Phone number must be at least 11 digits'),
  whatsapp: yup
    .string()
    .matches(/^[0-9+\s()-]*$/, 'Please enter a valid phone number')
    .test('min-length', 'WhatsApp number must be at least 11 digits', function(value) {
      if (!value) return true; // Optional field
      return value.length >= 11;
    }),
});

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { slug } = use(params);
  const buyNowId = searchParams?.get('buyNow');

  const { allProducts, categories, store, isFetchingStore } = useStorefront(slug);
  const storeId = categories[0]?.storeId || allProducts[0]?.storeId || store?.id;

  const cart = useCartStore((state) => state.cart);
  
  // Determine the effective cart based on whether it's a "Buy Now" checkout
  const effectiveCart = useMemo(() => {
    if (buyNowId) {
      try {
        const stored = sessionStorage.getItem('buyNowProduct');
        if (stored) {
          const product = JSON.parse(stored);
          if (product && product.id === parseInt(buyNowId)) {
            return [{
              ...product,
              cartQuantity: 1
            }];
          }
        }
      } catch (e) {
        // fallback to cart if sessionStorage fails
      }
    }
    // Filter cart by current store for normal checkouts
    return cart.filter((item) => item.storeId === storeId);
  }, [buyNowId, cart, storeId]);

  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [step, setStep] = useState<'address' | 'review'>('address');
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync with persistent store on mount
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  const subtotal = effectiveCart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.cartQuantity,
    0
  );
  const itemCount = effectiveCart.reduce((sum, item) => sum + item.cartQuantity, 0);

  const { states, cities, isLoadingCities, fetchCities } = useNigeriaLocations();

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    state: '',
    city: '',
    address: '',
    phone: '',
    whatsapp: '',
  });

  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [shippingMethod, setShippingMethod] = useState('normal');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isDelivery, setIsDelivery] = useState<boolean | null>(null);

  const handleInputChange = (field: string, value: string) => {
    const newInfo = { ...shippingInfo, [field]: value };
    
    // If state changes, fetch cities and reset city selection
    if (field === 'state') {
      newInfo.city = '';
      fetchCities(value);
    }
    
    setShippingInfo(newInfo);
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleContinue = async () => {
    // First check delivery preference
    if (isDelivery === null) {
      setErrors((prev) => ({ ...prev, isDelivery: 'Please select whether to include the delivery fee' }));
      return;
    }
    try {
      // Validate all fields
      await shippingSchema.validate(shippingInfo, { abortEarly: false });
      
      // If validation passes, clear errors and proceed
      setErrors({});
      setStep('review');
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        // Convert validation errors to object
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      }
    }
  };

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'card') {
      setIsPlacingOrder(true);
      try {
        const payload = {
          callbackUrl: `${window.location.origin}/store/${slug}/order-success`,
          isDelivery,
          customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          phone: shippingInfo.phone,
          email: shippingInfo.email,
          address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}`,
          orderItems: effectiveCart.map(item => ({
            productId: item.id,
            quantity: item.cartQuantity
          }))
        };

        console.log(payload);
        
        const response = await initializePaystackOrder(slug, payload);
        
        // Redirect to Paystack's authorization URL
        window.location.href = response.payment.authorizationUrl;
      } catch (error: any) {
        console.error('Payment initialization failed:', error);
        toast.error(error.message || 'Failed to initialize payment. Please try again.');
      } finally {
        setIsPlacingOrder(false);
      }
      return;
    }

    // Handle other payment methods (e.g. Cash On Delivery)
    console.log('Order placed (COD):', { 
      shippingInfo, 
      shippingMethod, 
      paymentMethod, 
      items: effectiveCart,
      subtotal,
      isDelivery,
    });
    
    // TODO: Implement actual COD order creation endpoint if available
    toast.success('Order placed successfully!');
    if (!buyNowId && storeId) {
      clearCart(storeId);
    }
    
    // Redirect to success page for simple completion
    router.push(`/store/${slug}/order-success`);
  };

  const handleRemoveItem = (productId: number, productName: string) => {
    if (buyNowId) {
      router.push(`/store/${slug}`);
      return;
    }
    removeFromCart(productId);
    toast.success(`${productName} removed from cart`);
    
    if (cart.length === 1) {
      router.push(`/store/${slug}`);
    }
  };

  const whatsappMessage = useMemo(() => {
    if (!store || effectiveCart.length === 0) return "";

    const itemsList = effectiveCart
      .map(
        (item) =>
          `- ${item.cartQuantity}x ${item.name} (₦ ${parseFloat(
            item.price
          ).toLocaleString()})`
      )
      .join("\n");

    const storeBaseUrl = typeof window !== "undefined" ? window.location.origin : "";
    
    // Use the first product's URL to ensure WhatsApp picks up its OG image
    const firstProductUrl = effectiveCart[0]?.id 
      ? `${storeBaseUrl}/store/${slug}/product/${effectiveCart[0].id}`
      : `${storeBaseUrl}/store/${slug}`;

    const message = `Hello! I'm interested in the following items from *${store.storeName || "your store"}*:\n\n${itemsList}\n\n*Subtotal:* ₦ ${subtotal.toLocaleString()}\n\n*View more details here:* ${firstProductUrl}`;

    return encodeURIComponent(message);
  }, [store, effectiveCart, subtotal, slug]);

  if (!isHydrated || isFetchingStore) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Checking your cart...</p>
        </div>
      </div>
    );
  }

  if (effectiveCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some products to your cart before checking out
          </p>
          <button
            onClick={() => router.push(`/store/${slug}`)}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // REVIEW STEP
  if (step === 'review') {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Shopping Cart</span>
              <span>/</span>
              <span className="font-semibold text-gray-900">Secure Checkout</span>
              <span>/</span>
              <span>Order Complete</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => setStep('address')}
            className="flex items-center gap-2 text-gray-700 text-sm px-3 py-1.5 border rounded hover:bg-gray-50"
          >
            ← Back to Shipping Info
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-8">
          <h1 className="text-2xl font-bold mb-6">Review Your Order</h1>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold">SHIPPING ADDRESS</h2>
                  <button 
                    onClick={() => setStep('address')}
                    className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {shippingInfo.firstName} {shippingInfo.lastName}</p>
                  <p><span className="font-medium">Email:</span> {shippingInfo.email}</p>
                  <p><span className="font-medium">Phone:</span> {shippingInfo.phone}</p>
                  {shippingInfo.whatsapp && (
                    <p><span className="font-medium">WhatsApp:</span> {shippingInfo.whatsapp}</p>
                  )}
                  <p><span className="font-medium">Address:</span> {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h2 className="font-bold mb-4">ORDER ITEMS ({itemCount})</h2>
                <div className="space-y-3">
                  {effectiveCart.map((item) => {
                    const imageUrl = item.images?.[0];
                    const hasValidImage = imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '';

                    return (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded border">
                      {hasValidImage ? (
                        <Image 
                          src={imageUrl} 
                          alt={item.name || "product image"}
                          width={100}
                          height={100}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center shrink-0">
                          <ShoppingCart className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <button
                            onClick={() => handleRemoveItem(item.id, item.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-600">
                            ₦{parseFloat(item.price).toLocaleString()}
                          </p>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              {!buyNowId && (
                                <button 
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-5 h-5 flex items-center justify-center border rounded hover:bg-gray-100 text-gray-600"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              )}
                              <span className="text-sm font-bold w-4 text-center">{item.cartQuantity}</span>
                              {!buyNowId && (
                                <button 
                                  onClick={() => updateQuantity(item.id, 1)}
                                  disabled={item.cartQuantity >= item.quantity}
                                  className="w-5 h-5 flex items-center justify-center border rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 font-medium">
                              Stock: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold mt-2">
                          ₦ {(parseFloat(item.price) * item.cartQuantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h2 className="font-bold mb-4">SHIPPING METHOD</h2>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value="normal"
                        checked={shippingMethod === 'normal'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-sm">Normal Shipping: 3-7 working days</p>
                      </div>
                    </div>
                    <p className="font-bold">₦ —</p>
                  </label>
                </div>

                {/* Delivery fee preference — confirmed on previous step */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <p className="text-sm text-gray-600">Delivery fee</p>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isDelivery ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isDelivery ? 'Included' : 'Not included'}
                  </span>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h2 className="font-bold mb-4">PAYMENT METHOD</h2>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-sm">Pay with Cards, Bank Transfer or USSD</p>
                        <p className="text-xs text-gray-500">100% Delivery Guarantee</p>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div>
                        <p className="font-medium text-sm">Cash On Delivery</p>
                        <p className="text-xs text-gray-500">100% Delivery Guarantee</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="border rounded-lg p-4 sticky top-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <h2 className="font-bold text-[#4D4D4D] leading-[100%] text-[16px]">ORDER SUMMARY</h2>
                  {!buyNowId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button 
                          className="text-red-500 hover:text-red-600 p-1"
                          title="Clear Cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear Shopping Cart?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove all items from your current store cart. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => clearCart(storeId)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Clear Cart
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span>Total Quantity</span>
                    <span className="font-bold">{itemCount} Items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold">₦ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-gray-500 text-xs italic">
                      {isDelivery === true ? 'Included (set by store)' : isDelivery === false ? 'Not included' : 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t font-bold text-base">
                    <span>Total</span>
                    <span className="text-blue-600">₦ {subtotal.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="w-full bg-gray-900 text-white py-2 rounded font-bold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  By placing your order, you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADDRESS STEP
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Shopping Cart</span>
            <span>/</span>
            <span className="font-semibold text-gray-900">Secure Checkout</span>
            <span>/</span>
            <span>Order Complete</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 text-sm px-3 py-1.5 border rounded hover:bg-gray-50"
        >
          ← Back to Store
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        <h1 className="text-[20px] leading-[100%] text-[#4D4D4D] font-bold mb-[32px]">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-6">
              <h2 className="font-bold text-[#4D4D4D] text-[16px] leading-[100%] mb-6">SHIPPING INFORMATION</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5 font-medium">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                        errors.firstName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'focus:ring-blue-500'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5 font-medium">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                        errors.lastName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'focus:ring-blue-500'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1.5 font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                      errors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'focus:ring-blue-500'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1.5 font-medium">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                        errors.state 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'focus:ring-blue-500'
                      }`}
                    >
                      <option value="">Select state</option>
                      {states.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-xs text-red-600 mt-1">{errors.state}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5 font-medium">
                      City <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                        errors.city 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'focus:ring-blue-500'
                      }`}
                    >
                      <option value="">
                        {isLoadingCities ? "Loading cities..." : "Choose city"}
                      </option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="text-xs text-red-600 mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1.5 font-medium">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                      errors.address 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'focus:ring-blue-500'
                    }`}
                    placeholder="Enter your street address"
                  />
                  {errors.address && (
                    <p className="text-xs text-red-600 mt-1">{errors.address}</p>
                  )}
                  {!errors.address && (
                    <p className="text-xs text-blue-600 mt-1">
                      Detailed street address can help our delivery find you quickly.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1.5 font-medium">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                      errors.phone 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'focus:ring-blue-500'
                    }`}
                    placeholder="Please provide your phone number"
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1.5 font-medium">
                    WhatsApp Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                      errors.whatsapp 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'focus:ring-blue-500'
                    }`}
                    placeholder="For backup contact"
                  />
                  {errors.whatsapp && (
                    <p className="text-xs text-red-600 mt-1">{errors.whatsapp}</p>
                  )}
                </div>
              </div>

              {/* Delivery fee preference */}
              <div className="border rounded-lg p-4 my-4">
                <h2 className="font-bold text-[#4D4D4D] text-[14px] leading-[100%] mb-3">INCLUDE DELIVERY FEE?</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    id="delivery-yes"
                    type="button"
                    onClick={() => {
                      setIsDelivery(true);
                      if (errors.isDelivery) setErrors((prev) => ({ ...prev, isDelivery: '' }));
                    }}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                      isDelivery === true
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-600'
                    }`}
                  >
                    Yes, include it
                  </button>
                  <button
                    id="delivery-no"
                    type="button"
                    onClick={() => {
                      setIsDelivery(false);
                      if (errors.isDelivery) setErrors((prev) => ({ ...prev, isDelivery: '' }));
                    }}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                      isDelivery === false
                        ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-600'
                    }`}
                  >
                    No, exclude it
                  </button>
                </div>
                {errors.isDelivery && (
                  <p className="text-xs text-red-500 mt-2">{errors.isDelivery}</p>
                )}
                {isDelivery !== null && (
                  <p className="text-xs text-gray-500 mt-2">
                    {isDelivery
                      ? 'Delivery fee will be calculated by the store and added to your total.'
                      : 'You will pay only for the items. Delivery fee will not be charged.'}
                  </p>
                )}
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-gray-900 text-white py-3 rounded font-bold mt-2 hover:bg-gray-800 transition"
              >
                Continue to checkout
              </button>
                  <p className="text-center text-sm text-muted-foreground mt-3">or</p>
              <a
                href={`https://wa.me/${store?.phone ? store.phone.replace(/[^0-9]/g, '') : ''}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white py-3 rounded font-bold mt-3 hover:bg-[#20b858] transition flex items-center justify-center gap-2 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413Z"/>
                </svg>
                Contact Store Owner on WhatsApp
              </a>

            <div>
                          <p className="text-center text-[14px] font-bold text-[#4D4D4D] mt-6">
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
          </div>

          <div className="lg:col-span-1">
            <div className="border rounded-lg p-4 sticky top-4 animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h2 className="font-bold text-[#4D4D4D] leading-[100%] text-[16px]">ORDER SUMMARY</h2>
                {!buyNowId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button 
                        className="text-red-500 hover:text-red-600 p-1"
                        title="Clear Cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear Shopping Cart?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove all items from your current store cart. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => clearCart(storeId)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Clear Cart
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              
              <div className="mb-4 max-h-64 overflow-y-auto">
               {effectiveCart.map((item) => {
  const imageUrl = item.images?.[0];
  const hasValidImage = imageUrl && imageUrl.trim() !== '';
  
  return (
    <div key={item.id} className="flex gap-2 mb-3 pb-3 border-b last:border-b-0">
      {hasValidImage ? (
        <Image 
          src={imageUrl}
          alt={item.name}
          width={48}
          height={48}
          className="w-12 h-12 object-cover rounded"
        />
      ) : (
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className="text-xs font-medium truncate">{item.name}</p>
          {!buyNowId && (
            <button 
              onClick={() => handleRemoveItem(item.id, item.name)}
              className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
              title="Remove Item"
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-600">
            ₦{parseFloat(item.price).toLocaleString()}
          </p>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              {!buyNowId && (
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-5 h-5 flex items-center justify-center border rounded hover:bg-gray-100 text-gray-600"
                >
                  <Minus className="w-3 h-3" />
                </button>
              )}
              <span className="text-xs font-bold w-4 text-center">{item.cartQuantity}</span>
              {!buyNowId && (
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  disabled={item.cartQuantity >= item.quantity}
                  className="w-5 h-5 flex items-center justify-center border rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-500 font-medium">
              Stock: {item.quantity}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
})}
              </div>

              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between">
                  <span>Total Quantity</span>
                  <span className="font-bold">{itemCount} Items</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">₦ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-3 border-t font-bold text-base">
                  <span>Total</span>
                  <span className="text-blue-600">₦ {subtotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}