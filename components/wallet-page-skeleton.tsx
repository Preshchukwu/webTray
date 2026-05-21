"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton } from "./header-skeleton";

export default function WalletPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 w-full animate-pulse">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton />

      {/* Balance Card Skeleton */}
      <div className="bg-[#365BEB]/10 border border-blue-100 rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-28 bg-blue-200/50" />
          <Skeleton className="h-10 w-48 bg-blue-200/50" />
          <Skeleton className="h-4 w-32 bg-blue-200/50" />
        </div>
        <div className="flex flex-row md:flex-col gap-3 md:justify-center">
          <Skeleton className="h-10 w-32 rounded-full bg-blue-200/50" />
          <Skeleton className="h-10 w-32 rounded-full bg-blue-200/50" />
        </div>
      </div>

      {/* Mid Cards Grid */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Payment Link Card Skeleton */}
        <div className="bg-white rounded-[24px] border border-gray-200 p-6 flex-1 flex flex-col gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-full" />
            <Skeleton className="h-10 flex-1 rounded-full" />
          </div>
        </div>

        {/* Withdrawal Bank Accounts Skeleton */}
        <div className="bg-white rounded-[24px] border border-gray-200 p-6 flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-10 w-36 rounded-full" />
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>

      {/* Transaction History Skeleton */}
      <div className="bg-white rounded-[24px] border border-gray-200 p-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-48 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
