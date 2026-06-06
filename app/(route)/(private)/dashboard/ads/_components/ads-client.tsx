"use client";

import React, { useState } from "react";
import { ExternalLink, Plus, TrendingUp, Users, Copy } from "lucide-react";
import { IconSpeakerphone } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PlaceAdModal, PlacedAd } from "./place-ad-modal";

const fmt = (n: number) => `₦${n.toLocaleString()}`;

const INITIAL_ADS: PlacedAd[] = [
  {
    id: "AD-001",
    productId: 1,
    productName: "Ankara Maxi Dress",
    productCategory: "Fashion",
    duration: 14,
    budget: 7000,
    status: "live",
    adLink: "https://webtray.co/featured/ankara-maxi-dress",
    startDate: "2026-05-20",
    reach: { min: 2500, max: 3200 },
  },
  {
    id: "AD-002",
    productId: 3,
    productName: "Organic Shea Butter",
    productCategory: "Beauty",
    duration: 7,
    budget: 3500,
    status: "pending",
    adLink: null,
    startDate: "2026-06-01",
    reach: { min: 1050, max: 1470 },
  },
];

const HISTORY_ADS: PlacedAd[] = [
  {
    id: "AD-000",
    productId: 2,
    productName: "Handmade Leather Bag",
    productCategory: "Accessories",
    duration: 7,
    budget: 3500,
    status: "completed",
    adLink: "https://webtray.co/featured/leather-bag",
    startDate: "2026-04-10",
    reach: { min: 1050, max: 1470 },
  },
];

function statusBadgeClass(status: PlacedAd["status"]) {
  if (status === "live") return "bg-green-100 text-green-700";
  if (status === "pending") return "bg-yellow-100 text-yellow-700";
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
  const [ads, setAds] = useState<PlacedAd[]>([...INITIAL_ADS, ...HISTORY_ADS]);
  const [tab, setTab] = useState<"active" | "history">("active");
  const [modalOpen, setModalOpen] = useState(false);

  const activeAds = ads.filter(
    (a) => a.status === "live" || a.status === "pending"
  );
  const historyAds = ads.filter((a) => a.status === "completed");
  const displayedAds = tab === "active" ? activeAds : historyAds;

  const liveCount = ads.filter((a) => a.status === "live").length;
  const totalSpent = ads.reduce((sum, a) => sum + a.budget, 0);
  const totalReach = ads.reduce((sum, a) => sum + a.reach.max, 0);

  const handleAdPlaced = (ad: PlacedAd) => {
    setAds((prev) => [ad, ...prev]);
    toast.success("Ad placed! It will be reviewed and activated within 24 hours.");
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Ad link copied!");
  };

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 max-w-6xl w-full">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            className="rounded-[24px] border border-gray-200 shadow-sm p-5"
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
      <div className="rounded-[24px] border border-gray-200 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setTab("active")}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
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
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
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
                {displayedAds.map((ad) => (
                  <tr
                    key={ad.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#111827]">
                        {ad.productName}
                      </p>
                      <p className="text-xs text-[#808080]">
                        {ad.productCategory}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4D4D4D] whitespace-nowrap">
                      {ad.duration} days
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium capitalize",
                          statusBadgeClass(ad.status)
                        )}
                      >
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4D4D4D] whitespace-nowrap">
                      {fmt(ad.budget)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4D4D4D] whitespace-nowrap">
                      {ad.reach.min.toLocaleString()}–
                      {ad.reach.max.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {ad.adLink ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={ad.adLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#365BEB] hover:underline flex items-center gap-1"
                          >
                            View Ad{" "}
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>
                          <button
                            onClick={() => copyLink(ad.adLink!)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
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
                      {formatDate(ad.startDate)}
                    </td>
                  </tr>
                ))}
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
