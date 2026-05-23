"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InventoryAccessBlocked() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 px-6 text-center max-w-lg mx-auto">
      <div className="h-16 w-16 rounded-full bg-[#365BEB]/10 flex items-center justify-center">
        <Lock className="w-8 h-8 text-[#365BEB]" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-[20px] font-bold text-[#111827]">
          Inventory is not on your plan
        </h1>
        <p className="text-[14px] text-[#808080] leading-relaxed">
          Inventory management is available on Growth and Business plans. Upgrade
          to track products, stock levels, and categories.
        </p>
      </div>
      <Button
        asChild
        className="rounded-full bg-[#365BEB] hover:bg-blue-700 text-white px-8"
      >
        <Link href="/dashboard/subscription">Upgrade plan</Link>
      </Button>
    </div>
  );
}
