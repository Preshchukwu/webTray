"use client";

import ProductsTable from "@/components/product/products-table";
import { InventoryManagement } from "@/components/inventory-management";
import InventoryStatCard from "@/components/inventory/inventory-stat-card";
import { InventoryAccessBlocked } from "@/components/plan/inventory-access-blocked";
import { usePlanAccess } from "@/hooks/use-plan-access";
import InventoryPageSkeleton from "@/components/inventory-page-skeleton";

export function InventoryPageContent() {
  const { isFetchingSubscription, isInventoryLocked } = usePlanAccess();

  if (isFetchingSubscription) {
    return <InventoryPageSkeleton />;
  }

  if (isInventoryLocked) {
    return <InventoryAccessBlocked />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <InventoryManagement />
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <InventoryStatCard />
          <ProductsTable />
        </div>
      </div>
    </div>
  );
}
