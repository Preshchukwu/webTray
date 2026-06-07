"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  Users,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const RATE_PER_DAY = 500;
const REACH_MIN_PER_DAY = 150;
const REACH_MAX_PER_DAY = 210;

const DURATION_OPTIONS = [
  { days: 7, label: "7 Days", tag: "Quick Boost" },
  { days: 14, label: "14 Days", tag: "Most Popular" },
  { days: 30, label: "30 Days", tag: "Best Value" },
] as const;

const GRADIENT_COLORS = [
  "from-blue-100 to-indigo-200",
  "from-purple-100 to-pink-200",
  "from-green-100 to-emerald-200",
  "from-orange-100 to-amber-200",
  "from-pink-100 to-rose-200",
  "from-yellow-100 to-lime-200",
  "from-teal-100 to-cyan-200",
  "from-violet-100 to-purple-200",
];

interface MockProduct {
  id: number;
  name: string;
  price: string;
  category: string;
}

const MOCK_PRODUCTS: MockProduct[] = [
  { id: 1, name: "Ankara Maxi Dress", price: "45000", category: "Fashion" },
  { id: 2, name: "Handmade Leather Bag", price: "28000", category: "Accessories" },
  { id: 3, name: "Organic Shea Butter", price: "3500", category: "Beauty" },
  { id: 4, name: "Custom Phone Case", price: "5000", category: "Tech" },
  { id: 5, name: "Beaded Necklace Set", price: "12000", category: "Jewelry" },
  { id: 6, name: "African Print Tote Bag", price: "8500", category: "Accessories" },
  { id: 7, name: "Handwoven Basket", price: "6000", category: "Home & Living" },
  { id: 8, name: "Body Scrub Kit", price: "4500", category: "Beauty" },
];

export interface PlacedAd {
  id: string;
  productId: number;
  productName: string;
  productCategory: string;
  duration: number;
  budget: number;
  status: "pending" | "live" | "completed";
  adLink: string | null;
  startDate: string;
  reach: { min: number; max: number };
}

interface PlaceAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdPlaced: (ad: PlacedAd) => void;
}

type DurationChoice = 7 | 14 | 30 | "custom";

const fmt = (n: number) => `₦${n.toLocaleString()}`;

export function PlaceAdModal({ open, onOpenChange, onAdPlaced }: PlaceAdModalProps) {
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationChoice>(14);
  const [customDays, setCustomDays] = useState("");
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  const activeDays = useMemo(() => {
    if (selectedDuration === "custom") return parseInt(customDays) || 0;
    return selectedDuration;
  }, [selectedDuration, customDays]);

  const totalCost = activeDays * RATE_PER_DAY;
  const reachMin = activeDays * REACH_MIN_PER_DAY;
  const reachMax = activeDays * REACH_MAX_PER_DAY;

  const filteredProducts = MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const productGradient = (product: MockProduct) => {
    const idx = MOCK_PRODUCTS.findIndex((p) => p.id === product.id);
    return GRADIENT_COLORS[idx % GRADIENT_COLORS.length];
  };

  const handlePay = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPaying(false);
    setSuccess(true);

    const now = new Date();
    onAdPlaced({
      id: `AD-${Date.now()}`,
      productId: selectedProduct!.id,
      productName: selectedProduct!.name,
      productCategory: selectedProduct!.category,
      duration: activeDays,
      budget: totalCost,
      status: "pending",
      adLink: null,
      startDate: now.toISOString().split("T")[0],
      reach: { min: reachMin, max: reachMax },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setSearch("");
      setSelectedProduct(null);
      setSelectedDuration(14);
      setCustomDays("");
      setSuccess(false);
    }, 300);
  };

  const canProceedStep1 = !!selectedProduct;
  const canProceedStep2 = activeDays > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Step indicator */}
        {!success && (
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="sr-only">Place a New Ad</DialogTitle>
            <div className="flex items-center">
              {([1, 2, 3] as const).map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                        step > s
                          ? "bg-[#365BEB] text-white"
                          : step === s
                          ? "bg-[#365BEB] text-white ring-4 ring-blue-100"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {step > s ? <Check className="w-4 h-4" /> : s}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium hidden sm:block whitespace-nowrap",
                        step === s
                          ? "text-[#111827]"
                          : step > s
                          ? "text-[#365BEB]"
                          : "text-gray-400"
                      )}
                    >
                      {s === 1
                        ? "Choose Product"
                        : s === 2
                        ? "Configure Ad"
                        : "Review & Pay"}
                    </span>
                  </div>
                  {i < 2 && (
                    <div
                      className={cn(
                        "flex-1 h-px mx-3 transition-colors",
                        step > i + 1 ? "bg-[#365BEB]" : "bg-gray-200"
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── Step 1: Choose Product ── */}
          {!success && step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">
                  Choose a product to promote
                </h2>
                <p className="text-sm text-[#808080] mt-0.5">
                  Select the product you want to run ads for
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={cn(
                      "relative rounded-[16px] border-2 p-3 text-left transition-all hover:border-blue-300",
                      selectedProduct?.id === product.id
                        ? "border-[#365BEB] bg-blue-50"
                        : "border-gray-200 bg-white"
                    )}
                  >
                    {selectedProduct?.id === product.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#365BEB] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "w-full h-20 rounded-[10px] bg-gradient-to-br mb-2 flex items-center justify-center",
                        productGradient(product)
                      )}
                    >
                      <span className="text-2xl font-bold text-white/40 uppercase">
                        {product.name.slice(0, 2)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#111827] leading-tight line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#808080] mt-0.5">
                      {fmt(parseInt(product.price))}
                    </p>
                    <span className="mt-1 inline-block px-1.5 py-0.5 rounded-full bg-gray-100 text-[10px] text-gray-500">
                      {product.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Configure Ad ── */}
          {!success && step === 2 && selectedProduct && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">
                  Configure your ad
                </h2>
                <p className="text-sm text-[#808080] mt-0.5">
                  Choose how long to run ads for{" "}
                  <span className="font-medium text-[#4D4D4D]">
                    {selectedProduct.name}
                  </span>
                </p>
              </div>

              {/* Duration cards */}
              <div>
                <Label className="text-sm font-medium text-[#4D4D4D] mb-3 block">
                  Ad Duration
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.days}
                      onClick={() => setSelectedDuration(opt.days)}
                      className={cn(
                        "relative rounded-[14px] border-2 p-4 text-left transition-all pt-5",
                        selectedDuration === opt.days
                          ? "border-[#365BEB] bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-200"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap",
                          selectedDuration === opt.days
                            ? "bg-[#365BEB] text-white"
                            : "bg-gray-100 text-gray-500"
                        )}
                      >
                        {opt.tag}
                      </span>
                      <p className="text-sm font-bold text-[#111827]">
                        {opt.label}
                      </p>
                      <p className="text-xs font-semibold text-[#365BEB] mt-0.5">
                        {fmt(opt.days * RATE_PER_DAY)}
                      </p>
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedDuration("custom")}
                    className={cn(
                      "rounded-[14px] border-2 p-4 text-left transition-all",
                      selectedDuration === "custom"
                        ? "border-[#365BEB] bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-200"
                    )}
                  >
                    <p className="text-sm font-bold text-[#111827]">Custom</p>
                    <p className="text-xs text-[#808080] mt-0.5">Set days</p>
                  </button>
                </div>

                {selectedDuration === "custom" && (
                  <div className="mt-3 flex items-end gap-3">
                    <div>
                      <Label className="text-xs text-[#4D4D4D] mb-1 block">
                        Number of days
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        placeholder="e.g. 21"
                        value={customDays}
                        onChange={(e) => setCustomDays(e.target.value)}
                        className="w-28"
                      />
                    </div>
                    {activeDays > 0 && (
                      <p className="text-sm text-[#808080] pb-2">
                        = {fmt(totalCost)} total
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Breakdown */}
              {activeDays > 0 && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-[16px] border border-gray-200 p-4">
                    <p className="text-sm font-semibold text-[#111827] mb-3">
                      Cost Breakdown
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#808080]">Daily rate</span>
                        <span className="text-[#4D4D4D]">
                          {fmt(RATE_PER_DAY)}/day
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#808080]">Duration</span>
                        <span className="text-[#4D4D4D]">
                          {activeDays} days
                        </span>
                      </div>
                      <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-semibold">
                        <span className="text-[#111827]">Total</span>
                        <span className="text-[#365BEB]">{fmt(totalCost)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-gray-200 p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Users className="w-4 h-4 text-[#365BEB]" />
                      <p className="text-sm font-semibold text-[#111827]">
                        Estimated Reach
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-[#365BEB]">
                      {reachMin.toLocaleString()}–{reachMax.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#808080] mt-0.5">
                      people over {activeDays} days
                    </p>
                    <div className="mt-3 flex gap-0.5">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 h-1.5 rounded-full transition-colors",
                            i < Math.min(Math.round((activeDays / 30) * 20), 20)
                              ? "bg-[#365BEB]"
                              : "bg-blue-100"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Review & Pay ── */}
          {!success && step === 3 && selectedProduct && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">
                  Review & Pay
                </h2>
                <p className="text-sm text-[#808080] mt-0.5">
                  Confirm your ad details before payment
                </p>
              </div>

              <div className="rounded-[16px] border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-[#808080] uppercase tracking-wide">
                    Ad Summary
                  </p>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex gap-3 items-center">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                        productGradient(selectedProduct)
                      )}
                    >
                      <span className="text-sm font-bold text-white/40 uppercase">
                        {selectedProduct.name.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        {selectedProduct.name}
                      </p>
                      <p className="text-xs text-[#808080]">
                        {selectedProduct.category}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#808080]">Ad Duration</span>
                      <span className="text-[#4D4D4D] font-medium">
                        {activeDays} days
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#808080]">Daily rate</span>
                      <span className="text-[#4D4D4D]">
                        {fmt(RATE_PER_DAY)}/day
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#808080]">Estimated reach</span>
                      <span className="text-[#4D4D4D]">
                        {reachMin.toLocaleString()}–{reachMax.toLocaleString()}{" "}
                        people
                      </span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
                      <span className="text-[#111827]">Total</span>
                      <span className="text-[#365BEB] text-lg">
                        {fmt(totalCost)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#808080] text-center">
                Your ad will go live after payment is confirmed and reviewed by
                our team. This usually takes under 24 hours.
              </p>
            </div>
          )}

          {/* ── Success ── */}
          {success && (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <DialogTitle className="sr-only">Ad Placed Successfully</DialogTitle>
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#365BEB] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#111827]">
                  Ad Placed Successfully!
                </h2>
                <p className="text-sm text-[#808080] mt-1 max-w-xs mx-auto">
                  Your ad for{" "}
                  <span className="font-medium text-[#4D4D4D]">
                    {selectedProduct?.name}
                  </span>{" "}
                  has been submitted and is pending review.
                </p>
              </div>

              <div className="rounded-[16px] bg-yellow-50 border border-yellow-200 px-5 py-3 text-sm text-yellow-800 max-w-xs">
                <strong>Status: Pending</strong> — Our team will review and
                activate your ad within 24 hours.
              </div>

              <Button
                onClick={handleClose}
                className="rounded-full bg-[#365BEB] hover:bg-[#2748c9] text-white px-8 mt-2"
              >
                Back to Ads Manager
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={step === 1 ? handleClose : () => setStep((s) => s - 1)}
              className="rounded-full text-[#808080] hover:text-[#4D4D4D]"
            >
              {step === 1 ? (
                "Cancel"
              ) : (
                <span className="flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Back
                </span>
              )}
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                className="rounded-full bg-[#365BEB] hover:bg-[#2748c9] text-white gap-1 disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handlePay}
                disabled={paying}
                className="rounded-full bg-[#365BEB] hover:bg-[#2748c9] text-white px-6 gap-2"
              >
                {paying ? (
                  <>
                    <Zap className="w-4 h-4 animate-pulse" /> Processing...
                  </>
                ) : (
                  `Pay ${fmt(totalCost)}`
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
