"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { TableSkeleton } from "@/components/table-skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/format-currency";
import { useCustomer } from "@/hooks/use-customer";
import type { Order } from "@/types";

export default function CustomerActivityList({
  customerId,
  limit = 4,
}: {
  customerId: number;
  limit?: number;
}) {
  const { useCustomerOrdersQuery } = useCustomer();
  const ordersQuery = useCustomerOrdersQuery(customerId);

  const orders = useMemo(() => {
    const list = (ordersQuery.data ?? []) as Order[];
    // Ensure descending by date and take the latest `limit`
    return list
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
  }, [ordersQuery.data, limit]);

  if (ordersQuery.isLoading) {
    return <TableSkeleton />;
  }

  if (ordersQuery.isError) {
    return (
      <div className="p-6 bg-white rounded shadow-sm text-center text-red-600">
        <p className="font-medium">Failed to load recent orders</p>
        <p className="text-sm mt-1">{(ordersQuery.error as Error)?.message}</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-6 bg-white rounded shadow-sm text-center text-gray-600">
        <p className="font-medium">No recent activity</p>
        <p className="text-sm mt-1">This customer has not placed orders recently.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4">
        {orders.map((order) => {
          const itemCount = (order.orderItems || []).reduce(
            (s, it) => s + (Number((it as any).quantity) || 0),
            0
          );
          const date = new Date(order.createdAt);
          const dateText = date.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={order.id}
              className="flex items-start gap-4 py-4 border-b last:border-b-0"
            >
              <div>
                <Avatar className="w-10 h-10 bg-gray-100">
                  <AvatarFallback>
                    <ShoppingCart className="w-4 h-4 text-gray-700" />
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="text-sm min-w-0">
                    <div className="font-medium text-gray-800 break-words">
                      Placed order #{order.id} for {formatCurrency(Number(order.totalAmount))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {itemCount} {itemCount === 1 ? "item" : "items"} · {dateText}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/dashboard/order/${order.id}`} className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full px-4 h-8 text-[#676767] border-gray-200 flex items-center gap-2 w-full sm:w-auto justify-center"
                      >
                        <Eye className="h-4 w-4 text-[#999999]" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}