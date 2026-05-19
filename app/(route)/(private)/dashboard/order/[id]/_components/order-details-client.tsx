"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, MapPin, User, CreditCard, CheckCircle2, Circle, Loader2, ChevronUp, Mail, Phone } from "lucide-react";
import { useOrder } from "@/hooks/use-order";
import { formatCurrency } from "@/lib/format-currency";
import { getOrderStatus, getStatusColor } from "@/lib/orders/get-status";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function OrderDetailsClient() {
  const { id } = useParams();
  const router = useRouter();
  const { useOrderQuery, updateOrder, isUpdatingOrder } = useOrder();
  const { data: orderDetail, isLoading, error } = useOrderQuery(Number(id));

  const order = orderDetail?.order;
  const customer = orderDetail?.customer;
  const orderItems = orderDetail?.orderItems;
  const products = orderDetail?.products;

  const handleStatusChange = async (newStatus: string) => {
    if (order?.id) {
      try {
        await updateOrder(order.id, { status: newStatus });
      } catch (err) {
        console.error("Failed to update status", err);
      }
    }
  };

  const enrichedItems = orderItems?.map(item => ({
    ...item,
    product: products?.find(p => p.id === item.productId)
  }));

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-[24px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !orderDetail || !order) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500">Error loading order details. Please try again.</p>
        <Button onClick={() => router.back()} variant="link">Go Back</Button>
      </div>
    );
  }

  const timelineSteps = [
    { label: "Order Placed", status: "completed", date: order.createdAt },
    { label: "Payment Confirmed", status: order.status !== "pending" ? "completed" : "pending", date: order.updatedAt },
    { label: "Processing", status: ["processing", "shipped", "completed"].includes(order.status.toLowerCase()) ? "completed" : order.status === "paid" ? "active" : "pending", date: "In process" },
    { label: "Shipped", status: ["shipped", "completed"].includes(order.status.toLowerCase()) ? "completed" : "pending", date: "Expected: 15-19 Apr" },
    { label: "Delivered", status: order.status.toLowerCase() === "completed" ? "completed" : "pending", date: "Expected: 19-23 Apr" },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-4 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-[#676767]">
          <Link href="/dashboard/order" className="hover:text-gray-700">Orders</Link>
          <span> / Order details</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-[#4D4D4D] mr-2" />
            </button>
            <h1 className="text-xl sm:text-[20px] font-bold text-[#4D4D4D]">Order Details</h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                disabled={isUpdatingOrder} 
                className="bg-[#1A1A1A] hover:bg-black text-white text-[14px] rounded-full px-[15px] py-[8px] h-auto font-regular w-full sm:w-auto"
              >
                {isUpdatingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Order Status"
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-full sm:w-56 rounded-[16px]">
              <DropdownMenuRadioGroup value={order.status} onValueChange={handleStatusChange}>
                <DropdownMenuRadioItem value="pending">Order Placed</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="paid">Payment Confirmed</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="processing">Processing</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="shipped">Shipped</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="completed">Delivered</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-[#365BEB] rounded-[24px] p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="text-white text-[12px] font-regular">Order Status</span>
          <div className={cn(
            "backdrop-blur-md border border-white/30 rounded-full px-4 w-fit mx-auto md:mx-0 shadow-sm",
            getStatusColor(order.status)
          )}>
            <span className="font-regular text-[14px] capitalize">{order.status}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="text-white text-[12px] font-regular">Expected Delivery</span>
          <span className="text-white text-[16px] font-regular">3 - 7 Working Days</span>
        </div>
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="text-white text-[12px] font-regular">Order Total</span>
          <span className="text-white text-[16px] font-regular">{formatCurrency(Number(order.totalAmount))}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Left Column: Accordions */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Accordion type="single" collapsible className="w-full space-y-4 border-none">
            {/* Order Items */}
            <AccordionItem value="items" className="border rounded-[24px] bg-white px-4 py-2 overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#365BEB]" />
                  </div>
                  <span className="md:text-[16px] text-[14px] font-bold text-[#4D4D4D]">Order Items</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {enrichedItems?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start py4 border-b last:border-0">
                      <div className="flex flex-col gap1">
                        <span className="font-regular text-[14px] text-[#1A1A1A]">
                          {item.product?.name}: {item.product?.description}
                        </span>
                        <span className="text-[16px] text-[#999999] font-regular">
                          Quantity: <span className="text-[#1A1A1A]">{item.quantity}</span>
                        </span>
                      </div>
                      <span className="font-regular text-[14px] text-[#1A1A1A]">
                        NGN {Number(item.price).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  
                  <div className="pt-4 space-y-3">
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-[#1A1A1A]">Subtotal</span>
                      <span className="text-[#1A1A1A]">NGN {Number(order.totalAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[14px]">
                      <span className="text-[#999999]">Shipping</span>
                      <span className="text-[#1A1A1A]">NGN 0</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-gray-100">
                    <span className="font-bold text-[16px] text-[#1A1A1A]">Total</span>
                    <div className="bg-[#F8F8F8] px-4 py-1 rounded-full">
                      <span className="font-bold text-[16px] text-[#1A1A1A]">
                        NGN {Number(order.totalAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {(!enrichedItems || enrichedItems.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No items in this order.</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Shipping Address */}
            <AccordionItem value="address" className="border rounded-[24px] bg-white px-4 py-2 overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#365BEB]" />
                  </div>
                  <span className="md:text-[16px] text-[14px] font-bold text-[#4D4D4D]">Shipping Address</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] text-[#A4A4A4] font-regular">Full Name</span>
                    <span className="text-[16px] text-[#4D4D4D] font-regular">{customer?.fullname}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] text-[#A4A4A4] font-regular">Address</span>
                    <span className="text-[16px] text-[#4D4D4D] font-regular leading-relaxed">
                      {customer?.address || "No address provided"}
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Contact Information */}
            <AccordionItem value="contact" className="border rounded-[24px] bg-white px-4 py-2 overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <User className="w-6 h-6 text-[#365BEB]" />
                  </div>
                  <span className="md:text-[16px] text-[14px] font-bold text-[#4D4D4D]">Contact Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Mail className="w-5 h-5 text-[#365BEB]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] text-[#A4A4A4] font-regular">Email</span>
                      <span className="text-[16px] text-[#4D4D4D] font-regular underline underline-offset-2">
                        {customer?.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Phone className="w-5 h-5 text-[#365BEB]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] text-[#A4A4A4] font-regular">Phone</span>
                      <span className="text-[16px] text-[#4D4D4D] font-regular">
                        {customer?.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Payment Information */}
            <AccordionItem value="payment" className="border rounded-[24px] bg-white px-4 py-2 overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-[#365BEB]" />
                  </div>
                  <span className="text-[14px] md:text-[16px] font-bold text-[#4D4D4D]">Payment Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-[#A4A4A4] font-regular">Payment Method</span>
                    <span className="text-[16px] text-[#4D4D4D] font-regular text-right">Card Payment</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] text-[#A4A4A4] font-regular">Payment Status</span>
                    <div className="flex items-center gap-2">
                       {order.status === "paid" || order.status === "completed" ? (
                         <CheckCircle2 className="w-5 h-5 text-[#365BEB]" />
                       ) : null}
                       <span className="text-[16px] text-[#4D4D4D] font-regular capitalize">
                         {order.status === "paid" ? "Completed" : order.status}
                       </span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Right Column: Timeline */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 h-fit">
          <h2 className="text-[14px] md:text-[20px] font-bold text-[#4D4D4D] mb-[16px]">Order Timeline</h2>
          <div className="relative space-y-10">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="flex gap-4 relative group">
                {/* Vertical Line */}
                {idx !== timelineSteps.length - 1 && (
                  <div className={cn(
                    "absolute left-[13px] top-8 bottom-[-24px] w-[2px] bg-gray-100 group-last:hidden",
                    step.status === "completed" && "bg-blue-600"
                  )} />
                )}
                
                <div className="z-10 mt-1">
                  {step.status === "completed" ? (
                    <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-600">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    </div>
                  ) : step.status === "active" ? (
                    <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-400">
                      <div className="h-3 w-3 rounded-full bg-orange-400 animate-pulse" />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center border-2 border-gray-200">
                      <Circle className="w-4 h-4 text-gray-200" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <span className={cn(
                    "font-regular text-[16px]",
                    step.status === "completed" ? "text-gray-900" : "text-[#4D4D4D]"
                  )}>
                    {step.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {step.status === "completed" && step.date ? (
                        new Date(step.date).toLocaleString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })
                    ) : (
                        step.date
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-[#1A1A1A]">
          Need help with your order? <Link href="/contact" className="text-[#365BEB] font-bold hover:underline">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
