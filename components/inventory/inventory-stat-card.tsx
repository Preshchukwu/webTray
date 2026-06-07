"use client"
import { StatCard } from "@/components/stat-card";
import { useCategory } from "@/hooks/use-category";
import { useProduct } from "@/hooks/use-product";
import { TrendingDown, TrendingUp, Package } from "lucide-react";
import { formatNumber } from "@/lib/format-number";
import InventoryPageSkeleton from "../inventory-page-skeleton";
import { PageHeader } from "../page-header";
import { useAuthStore } from "@/store/useAuthStore";
import { formatCurrency } from "@/lib/format-currency";

export default function InventoryStatCard() {
  const {
    inventorySummary,
    isFetchingInventorySummary,
    inventorySummaryError,
  } = useCategory();
  const { isFetchingProducts } = useProduct();
  const { user } = useAuthStore(); // Add fetchingProfile

  const hasBusiness = user?.business != null;
  const isLoading = (isFetchingInventorySummary || isFetchingProducts) && hasBusiness;

  if (isLoading) {
    return <InventoryPageSkeleton />;
  }
  console.log("Inventory Summary", inventorySummary);

  if (inventorySummaryError) {
    return (
      <div className="">
        <PageHeader
          title="Inventory"
          subtitle="Manage your products and track stock levels"
        />
        <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-600">
            Failed to load dashboard data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Products",
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      value: formatNumber(inventorySummary?.noOfProducts || 0),
      note: "+4 new this week",
      minWidth: "min-w-[150px]",
    },
    {
      title: "Low Stock Items",
      icon: <TrendingDown className="h-4 w-4 text-red-500" />,
      value: formatNumber(inventorySummary?.noOfLowStocksItems || 0),
      note: "Need Attention",
      noteColor: "text-red-500",
    },
    {
      title: "Total Value",
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      value: formatCurrency(inventorySummary?.totalValueOfProducts || 0),
      note: "Inventory Value",
    },
    {
      title: "Category",
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      value: formatNumber(inventorySummary?.noOfCategories || 0),
      note: "Product Categories",
    },
  ];



  <div>
    <PageHeader
      title="Inventory"
      subtitle="Manage your products and track stock levels"
    />

    <div className="grid mt-6 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  </div>
}