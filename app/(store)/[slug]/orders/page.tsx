// ============================================
// FILE: app/store/[slug]/orders/page.tsx
// ============================================

'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';
import { useCustomerOrders, getCustomerToken, Order } from '@/hooks/use-customer-orders';
import { StorefrontOrdersTable } from '@/lib/storefront-orders/data-table';
import { createStorefrontOrderColumns } from '@/lib/storefront-orders/columns';

interface OrdersPageProps {
  params: Promise<{ slug: string }>;
}

// Mock data for UI development — remove when backend is ready
const MOCK_ORDERS: Order[] = Array.from({ length: 40 }, (_, i) => ({
  id: `ord-${i + 1}`,
  orderNumber: `ORD NO ${2231 + i}`,
  status: (['processing', 'shipped', 'delivered', 'cancelled'] as const)[i % 4],
  total: 4500 + Math.floor(Math.random() * 10000),
  itemCount: Math.floor(Math.random() * 9) + 1,
  items: [],
  shippingAddress: '123 Main Street, Ikeja, Lagos',
  deliveryFee: 2000,
  paymentMethod: 'card',
  createdAt: new Date(2026, 2, 17 - (i % 10)).toISOString(),
  updatedAt: new Date(2026, 2, 17 - (i % 10)).toISOString(),
}));

export default function OrdersPage({ params }: OrdersPageProps) {
  const router = useRouter();
  const { slug } = use(params);

  const customerToken = getCustomerToken(slug);

  // Real API call (will return empty until backend is ready)
  // const { data, isLoading } = useCustomerOrders(slug, currentPage, statusFilter);

  // Use mock data for now
  const useMockData = true; // Set to false when backend is ready
  const orders: Order[] = useMockData ? MOCK_ORDERS : [];

  const columns = createStorefrontOrderColumns();

  // If no customer token, show a prompt
  if (!customerToken && !useMockData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 text-sm px-3 py-1.5 border rounded hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Order History Found</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn&apos;t find any orders linked to this browser. Place an order or use the &quot;Find My Orders&quot; feature to recover your order history.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push(`/store/${slug}`)}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Nav */}
      <div className="max-w-7xl mx-auto px-4 py-3 my-2 flex items-center relative">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/store/${slug}`)}
          className="flex items-center gap-2 text-gray-700 text-sm px-3 py-1.5 border rounded hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Breadcrumb - centered */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Shopping Cart</span>
            <span>&gt;</span>
            <span className="font-semibold text-gray-900">Orders</span>
            <span>&gt;</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <h1 className="text-[20px] leading-[100%] text-[#4D4D4D] font-bold mb-6">Orders</h1>

        <StorefrontOrdersTable columns={columns} data={orders} />
      </div>
    </div>
  );
}
