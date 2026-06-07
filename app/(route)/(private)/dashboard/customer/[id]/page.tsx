// app/customers/[id]/page.tsx
"use client";

import { use } from "react";
import { useCustomer } from "@/hooks/use-customer";
import { TableSkeleton } from "@/components/table-skeleton";
import { useState } from "react";
import { Mail, Phone, Calendar, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format-currency";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import CustomerOrdersTable from "@/components/customer/customer-order-table";
import CustomerActivityList from "@/components/customer/customer-activity-list";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  // this is just like using await in server, but in client use handle all that for you since it a promise
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabFromUrl = searchParams?.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  const { customers, isLoading } = useCustomer();
  // const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return <TableSkeleton />;
  }

  const customer = customers?.find((c) => c.id.toString() === id);

  if (!customer) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Not Found</h1>
      </div>
    );
  }

  const avgOrder =
    customer?.totalOrders > 0 ? customer?.totalSpent / customer.totalOrders : 0;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    router.push(`?tab=${tab}`, { scroll: false });
  };


  const repeatOrderRate = customer?.totalOrders > 0 ? (customer?.totalOrders / customer?.totalSpent) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="mx-4 md:mx-6 mt-6 p-4 md:p-6">
        <div className="space-y-4">
          {/* Header Content */}
          <div className="flex justify-between items-center">
            <div className="text-[#4D4D4D]">
              <p className="font-normal text-[12px] text-[#111827] mb-2 leading-6">
                Customers / Customer Profile
              </p>

              <div className="flex items-center gap-2 mb-2">
                <Link
                  href="/dashboard/customer"
                  className="text-[#4D4D4D] hover:text-[#111827]"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <h2 className="font-bold text-[20px] leading-6">
                  Customer Profile
                </h2>
              </div>

              <p className="font-normal text-[14px] sm:text-[16px] leading-6">
                View customer details and purchase history
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Card */}
      <div className="bg-white mx-4 md:mx-6 mt-6 px-4 md:px-6 py-5 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 shrink-0">
              <AvatarFallback className="text-lg font-semibold bg-gray-200 text-gray-700">
                {customer?.fullname
                  ? customer.fullname.slice(0, 2).toUpperCase()
                  : "NA"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="text-[18px] font-medium leading-[120%] text-[#343434] break-words">
                {customer?.fullname}
              </h2>
              <div className="flex items-center gap-2 mt-2 min-w-0">
                <Mail className="w-4 h-4 text-[#808080] shrink-0" />
                <span className="text-[12px] font-medium leading-[120%] text-[#1A1A1A] break-words">
                  {customer?.email}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 min-w-0">
                <Phone className="w-4 h-4 text-[#808080] shrink-0" />
                <span className="text-[12px] font-medium leading-[120%] text-[#1A1A1A] break-words">
                  {customer?.phone}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[#1A1A1A] min-w-0">
                <Calendar className="w-4 h-4 text-[#808080] shrink-0" />
                <span className="text-[12px] font-medium leading-[120%] text-[#1A1A1A]">
                  Member since{" "}
                  {new Date(customer?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-8 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 w-full lg:w-auto lg:flex lg:flex-row lg:justify-end">
            <div className="text-left lg:text-right min-w-0">
              <p className="text-[16px] font-bold mb-[8px] text-[#1A1A1A] leading-[100%] truncate">
                {customer?.totalOrders}
              </p>
              <p className="text-[12px] sm:text-sm font-normal leading-[120%] text-[#4D4D4D]">
                Total Orders
              </p>
            </div>
            <div className="text-left lg:text-right min-w-0">
              <p className="text-[16px] font-bold mb-[8px] text-[#1A1A1A] leading-[100%] truncate">
                {formatCurrency(customer?.totalSpent)}
              </p>
              <p className="text-[12px] sm:text-sm font-normal leading-[120%] text-[#4D4D4D]">
                Total Spent
              </p>
            </div>
            <div className="text-left lg:text-right min-w-0">
              <p className="text-[16px] font-bold text-[#1A1A1A] leading-[100%] mb-[8px] truncate">
                {formatCurrency(avgOrder)}
              </p>
              <p className="text-[12px] sm:text-sm font-normal leading-[120%] text-[#4D4D4D]">
                Avg. Order
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white mx-4 md:mx-6 mt-6 rounded-lg border-gray-200">
        <div className="flex overflow-x-auto scrollbar-none whitespace-nowrap justify-start md:justify-between px-2 rounded-lg py-2 items-center border-b bg-[#EBEBEB] border-gray-200 w-full">
          {["overview", "orders", "activity", "preferences"].map((tab) => (
            <Button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-shrink-0 px-4 md:px-8 py-2 md:py-4 font-normal shadow-none text-[#343434] hover:bg-white text-[14px] md:text-[16px] capitalize transition-colors ${
                activeTab === tab
                  ? "bg-white"
                  : "bg-[#EBEBEB] border-0 shadow-0"
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-6 px-4 md:px-6 bg-gray-50">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card className="shadow-none p-2 w-full">
                <CardHeader className="p-2">
                  <CardTitle className="text-[16px] font-semibold text-gray-900">
                    Contact Information
                  </CardTitle>
                  <CardDescription>Customer's contact details</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 p-2 min-w-0">
                  <div className="min-w-0">
                    <label className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <p className="text-gray-900 mt-1 break-all">{customer?.email}</p>
                  </div>

                  <div className="min-w-0">
                    <label className="text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <p className="text-gray-900 mt-1 break-all">{customer?.phone}</p>
                  </div>

                  <div className="min-w-0">
                    <label className="text-sm font-medium text-gray-700">
                      Joined Date
                    </label>
                    <p className="text-gray-900 mt-1">
                      Member since{" "}
                      {new Date(customer?.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <label className="text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <p className="text-gray-900 mt-1 break-words">
                      {customer?.address || "No Address"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Metrics */}
              <Card className="shadow-none p-2 w-full">
                <CardHeader className="p-2">
                  <CardTitle className="text-[16px] font-semibold text-gray-900">
                    Customer's Metrics
                  </CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 p-2 min-w-0">
                  <div className="min-w-0">
                    <label className="text-sm font-medium text-gray-700">
                      Lifetime Value
                    </label>
                    <p className="text-gray-900 mt-1 text-lg">{formatCurrency(customer?.totalSpent)}</p>
                  </div>

                  <div className="min-w-0">
                    <label className="text-sm font-medium text-gray-700">
                      Repeat Order Rate
                    </label>
                    <p className="text-gray-900 mt-1 text-lg">{repeatOrderRate.toFixed(2)}%</p>
                  </div>

                  <div className="min-w-0">
                    <label className="text-sm font-medium text-gray-700">
                      Last Order
                    </label>
                    <p className="text-gray-900 mt-1">
                      {new Date(customer?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="py-8">
              <CustomerOrdersTable customerId={customer?.id} />
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-[16px] font-semibold text-gray-900">
                  Recent Activity
                </h2>
                <p className="text-sm text-gray-500">Customer interactions and activities</p>
              </div>
              <CustomerActivityList customerId={customer?.id} />
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="text-center py-8 text-gray-600 bg-white rounded-lg border border-gray-200">
              <p>soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
