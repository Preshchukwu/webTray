'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Package, Mail, Bell, Loader2, XCircle, ArrowLeft } from 'lucide-react';
import { verifyPaystackPayment, PaystackVerifyResponse } from '@/lib/api/storefront';
import { useStorefront } from '@/hooks/use-customer-store';
import { useCartStore } from '@/store/use-cart-store';
import { toast } from 'sonner';

interface OrderSuccessPageProps {
  params: Promise<{ slug: string }>;
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { slug } = use(params);
  
  const reference = searchParams?.get('reference') || searchParams?.get('trxref');
  
  const [isVerifying, setIsVerifying] = useState(!!reference);
  const [verificationResult, setVerificationResult] = useState<PaystackVerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const clearCart = useCartStore((state) => state.clearCart);
  const { store } = useStorefront(slug);
  const storeId = store?.id;

  useEffect(() => {
    if (!reference) return;

    const verify = async () => {
      try {
        const result = await verifyPaystackPayment(slug, reference);
        setVerificationResult(result);
      } catch (err: any) {
        console.error('Verification failed:', err);
        setError(err.message || 'Failed to verify payment');
        toast.error('Payment verification failed');
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [reference, slug, storeId, clearCart]);

  // Effect to clear cart after successful verification or for COD
  useEffect(() => {
    // For Paystack: Clear if verification succeeded
    // For COD: Clear if there's no reference (meaning we arrived here from checkout COD path)
    if ((verificationResult && storeId) || (!reference && storeId)) {
      clearCart(storeId);
      sessionStorage.removeItem('buyNowProduct');
    }
  }, [verificationResult, reference, storeId, clearCart]);

  // Generate a placeholder order number if NOT verifying (e.g. for COD)
  const displayOrderNumber = verificationResult?.order?.id 
    ? `ORD-${verificationResult.order.id}` 
    : `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h1>
          <p className="text-gray-600">Please wait while we confirm your transaction with Paystack...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => router.push(`/store/${slug}/checkout`)}
            className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Checkout
          </button>
        </div>
      </div>
    );
  }


  const handleContactSupport = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!store?.phone) return;
    const cleanPhone = store.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-6">
            <div className="w-14 h-14 bg-[#E6F9F0] rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-[#00BA71]" strokeWidth={3} />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-[16px] md:text-[32px] font-bold text-[#343434] mb-2 leading-tight">
            {reference ? 'Payment Confirmed' : 'Order Placed'}
          </h1>
          <p className="text-[#343434] font-medium text-[16px] md:text-lg mb-10 max-w-md mx-auto">
            {reference 
              ? 'Your payment was successful and your order is being processed.'
              : 'Thank you for your purchase. Your order has been received and is being processed.'}
          </p>

          {/* Order Number */}
          <div className="bg-[#F8F9FA] rounded-[16px] p-6 mb-8 w-full">
            <p className="text-sm text-[#343434] mb-2 font-medium">Order Number</p>
            <p className="text-3xl font-bold text-[#343434] tracking-tight">{displayOrderNumber}</p>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
            <div className="bg-white border border-[#E9ECEF] rounded-[12px] p-5 hover:border-blue-100 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#EDF2F7]">
                  <Mail className="w-4 h-4 text-[#3366FF]" />
                </div>
                <h3 className="font-semibold text-[#343434] text-sm mt-1">Email Confirmation</h3>
              </div>
              <p className="text-sm text-[#808080] leading-relaxed">
                A confirmation email has been sent to your registered email address
              </p>
            </div>

            <div className="bg-white border border-[#E9ECEF] rounded-[12px] p-5 hover:border-blue-100 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#EDF2F7]">
                  <Package className="w-4 h-4 text-[#3366FF]" />
                </div>
                <h3 className="font-semibold text-[#343434] text-sm mt-1">Processing</h3>
              </div>
              <p className="text-sm text-[#808080] leading-relaxed">
                We're preparing your order for shipment
              </p>
            </div>

            <div className="bg-white border border-[#E9ECEF] rounded-[12px] p-5 hover:border-blue-100 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#EDF2F7]">
                  <Bell className="w-4 h-4 text-[#3366FF]" />
                </div>
                <h3 className="font-semibold text-[#343434] text-sm mt-1">Stay Updated</h3>
              </div>
              <p className="text-sm text-[#808080] leading-relaxed">
                We'll keep you informed via SMS and email
              </p>
            </div>
          </div>

          {/* Expected Delivery */}
          <div className="bg-[#365BEB] text-white rounded-[16px] p-6 mb-10 shadow-lg shadow-blue-100">
            <p className="text-xs uppercase tracking-[0.1em] font-bold opacity-80 mb-2">Expected Delivery</p>
            <p className="text-3xl font-bold tracking-tight">3-7 Working Days</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push(`/store/${slug}`)}
              className="bg-[#111827] text-white px-10 py-4 rounded-full font-bold hover:bg-[#1E293B] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => router.push(`/store/${slug}/orders`)}
              className="bg-white border-2 border-[#111827] text-[#0F172A] px-10 py-3.5 rounded-full font-bold hover:bg-gray-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              View Order History
            </button>
          </div>

          {/* Support Text */}
          <div className="mt-10 pt-8 border-t border-[#F1F5F9]">
            <p className="text-sm text-[#64748B]">
              Need help with your order?{' '}
              <button 
                onClick={handleContactSupport}
                className="text-[#3366FF] hover:underline font-bold disabled:opacity-50"
                disabled={!store?.phone}
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Keep your order number safe for tracking and customer support
          </p>
        </div>
      </div>
    </div>
  );
}