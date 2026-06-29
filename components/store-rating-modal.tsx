"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Star, Coffee, Store } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StoreRatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rating: number, name: string) => void;
  onSkip: () => void;
  storeName?: string;
  logoUrl?: string | null;
}

export function StoreRatingModal({
  open,
  onOpenChange,
  onSubmit,
  storeName,
  logoUrl,
}: StoreRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, name.trim());
    }
  };

  // Resolve storeName to a formatted name if it is just a slug
  const resolvedStoreName = useMemo(() => {
    if (!storeName) return "this store";
    // Check if it looks like a slug (contains dashes/hyphens and is lowercase)
    if (storeName.includes("-") || storeName === storeName.toLowerCase()) {
      return storeName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return storeName;
  }, [storeName]);

  const isCoffee = resolvedStoreName.toLowerCase().includes("coffee");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-[340px] rounded-[24px] bg-white p-6 gap-0">
        {/* Circular Logo */}
        <div className="flex justify-center mb-3">
          {logoUrl ? (
            <div className="relative w-16 h-16 overflow-hidden rounded-full border border-gray-100 shadow-xs">
              <Image
                src={logoUrl}
                alt={resolvedStoreName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xs border ${
                isCoffee
                  ? "bg-[#FDF9F3] border-[#F5EAD4] text-[#8B5A2B]"
                  : "bg-gray-50 border-gray-100 text-gray-500"
              }`}
            >
              {isCoffee ? (
                <Coffee className="h-8 w-8 stroke-[1.5]" />
              ) : (
                <Store className="h-8 w-8 stroke-[1.5]" />
              )}
            </div>
          )}
        </div>

        <DialogHeader className="text-center flex flex-col items-center gap-0.5">
          <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
            {resolvedStoreName}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500 font-medium">
            Rate this store
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center w-full">
          {/* Star Rating Section */}
          <div className="flex items-center gap-1.5 mb-4">
            {stars.map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-90 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 rounded-full p-0.5"
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={`h-7 w-7 transition-colors duration-150 ${
                    (hoverRating || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-amber-400 fill-transparent"
                  }`}
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>

          {/* Name Field */}
          <div className="w-full flex flex-col gap-1 mb-4">
            <label
              htmlFor="customer-name"
              className="text-xs font-semibold text-gray-700"
            >
              Your name
            </label>
            <input
              id="customer-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0}
            className="w-full py-2.5 rounded-lg font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition duration-200 text-sm h-auto"
          >
            Submit Rating
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

