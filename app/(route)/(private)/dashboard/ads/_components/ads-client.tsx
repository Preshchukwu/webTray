"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Plus, TrendingUp, Users, Copy, Loader2 } from "lucide-react";
import { IconSpeakerphone } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PlaceAdModal } from "./place-ad-modal";
import { useAds } from "@/hooks/use-ads";
import { useAuthStore } from "@/store/useAuthStore";
import { useSearchParams, useRouter } from "next/navigation";

const fmt = (n: number) => `₦${n.toLocaleString()}`;

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "live") return "bg-green-100 text-green-700";
  if (s === "pending") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-500";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdsClient() {
  const { activeStore } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");

  const [tab, setTab] = useState<"active" | "history">("active");
  const [modalOpen, setModalOpen] = useState(false);

  const {
    adsHistory,
    isFetchingHistory,
    adsOverview,
    isFetchingOverview,
    refetchHistory,
    refetchOverview,
    useVerifyAdQuery,
  } = useAds();

  // Verification Hook
  const { data: verifyData, isLoading: isVerifying } = useVerifyAdQuery(reference || undefined);

  useEffect(() => {
    if (verifyData) {
      if (verifyData.status === "SUCCESS") {
        toast.success("Ad campaign payment verified successfully!");
        refetchHistory();
        refetchOverview();
      } else {
        toast.error(`Ad verification failed: ${verifyData.status}`);
      }
      // Clear URL parameter
      router.replace("/dashboard/ads");
    }
  }, [verifyData, router, refetchHistory, refetchOverview]);

  if (isFetchingHistory || isFetchingOverview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#365BEB]" />
      </div>
    );
  }

  const allAds = adsHistory || [];
  
  const activeAds = allAds.filter(
    (ad) => ad.status.toLowerCase() === "live" || ad.status.toLowerCase() === "pending"
  );
  
  const historyAds = allAds.filter(
    (ad) => ad.status.toLowerCase() === "completed" || ad.status.toLowerCase() === "expired"
  );
  
  const displayedAds = tab === "active" ? activeAds : historyAds;

  const liveCount = adsOverview?.liveAds || 0;
  const totalSpent = adsOverview?.totalSpent || 0;
  // Fallback reach estimation if totalReach is 0
  const totalReach = adsOverview?.totalReach || allAds.reduce((sum, ad) => sum + (ad.days * 210), 0);

  const handleAdPlaced = () => {
    refetchHistory();
    refetchOverview();
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Ad link copied!");
  };

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 max-w-6xl w-full relative">
      {isVerifying && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-xs z-50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-lg font-bold text-gray-900">Verifying your ad payment...</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Ads Manager</h1>
          <p className="text-sm text-[#808080] mt-0.5">
            Promote your products and reach more customers
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="rounded-full bg-[#365BEB] hover:bg-[#2748c9] text-white gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Place New Ad
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-4 -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-3 sm:overflow-visible">
        {[
          {
            label: "Live Ads",
            value: liveCount,
            icon: <IconSpeakerphone className="w-5 h-5" />,
          },
          {
            label: "Total Spent",
            value: fmt(totalSpent),
            icon: <TrendingUp className="w-5 h-5" />,
          },
          {
            label: "Total Reach",
            value: `${totalReach.toLocaleString()}+`,
            icon: <Users className="w-5 h-5" />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="min-w-[72%] shrink-0 snap-start rounded-[24px] border border-gray-200 shadow-sm p-5 bg-white sm:min-w-0 sm:shrink sm:w-auto"
          >
            <div className="flex items-center gap-2 text-[#808080] mb-2">
              {stat.icon}
              <span className="text-sm">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-[#111827]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-[24px] border border-gray-200 shadow-sm overflow-hidden bg-white">
        {/* Tab bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setTab("active")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer",
                tab === "active"
                  ? "bg-white text-[#111827] shadow-sm"
                  : "text-[#808080] hover:text-[#4D4D4D]"
              )}
            >
              Active ({activeAds.length})
            </button>
            <button
              onClick={() => setTab("history")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer",
                tab === "history"
                  ? "bg-white text-[#111827] shadow-sm"
                  : "text-[#808080] hover:text-[#4D4D4D]"
              )}
            >
              History ({historyAds.length})
            </button>
          </div>
        </div>

        {/* Empty state */}
        {displayedAds.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <IconSpeakerphone className="w-7 h-7 text-[#365BEB]" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-[#111827]">
                {tab === "active" ? "No active ads" : "No ad history yet"}
              </p>
              <p className="text-sm text-[#808080] mt-0.5">
                {tab === "active"
                  ? "Place your first ad to start reaching more customers"
                  : "Your completed ads will appear here"}
              </p>
            </div>
            {tab === "active" && (
              <Button
                onClick={() => setModalOpen(true)}
                className="rounded-full bg-[#365BEB] hover:bg-[#2748c9] text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Place Your First Ad
              </Button>
            )}
          </div>
        )}

        {/* Table */}
        {displayedAds.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {[
                    "Product",
                    "Duration",
                    "Status",
                    "Budget",
                    "Est. Reach",
                    "Ad Link",
                    "Start Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-sm font-medium text-gray-400 border-b border-gray-100 px-6 py-3 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedAds.map((ad) => {
                  const adLink = activeStore?.slug
                    ? `${window.location.origin}/${activeStore.slug}/product/${ad.productId}`
                    : null;

                  return (
                    <tr
                      key={ad.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#111827]">
                          {ad.product?.name || "Unknown Product"}
                        </p>
                        <p className="text-xs text-[#808080]">
                          {ad.product?.price
                            ? `₦${parseFloat(ad.product.price).toLocaleString()}`
                            : "Promoted"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4D4D4D] whitespace-nowrap">
                        {ad.days} days
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium capitalize",
                            statusBadgeClass(ad.status)
                          )}
                        >
                          {ad.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4D4D4D] whitespace-nowrap">
                        {fmt(parseFloat(ad.adTransaction?.amount || "0"))}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4D4D4D] whitespace-nowrap">
                        {(ad.days * 150).toLocaleString()}–
                        {(ad.days * 210).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {adLink ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={adLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#365BEB] hover:underline flex items-center gap-1"
                            >
                              View Ad{" "}
                              <ExternalLink className="w-3 h-3 inline" />
                            </a>
                            <button
                              onClick={() => copyLink(adLink)}
                              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                              title="Copy link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-[#808080]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#808080] whitespace-nowrap">
                        {formatDate(ad.startDate || ad.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PlaceAdModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAdPlaced={handleAdPlaced}
      />
    </div>
  );
}
