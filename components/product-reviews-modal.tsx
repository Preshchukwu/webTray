"use client";

import React, { useState, useMemo } from "react";
import { Star, MessageSquare, Plus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProductReviews } from "@/hooks/use-product-reviews";
import { toast } from "sonner";

interface ProductReviewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productName: string;
}

export function ProductReviewsModal({
  open,
  onOpenChange,
  productId,
  productName,
}: ProductReviewsModalProps) {
  const {
    useReviewsQuery,
    aggregate,
    submitReview,
    isSubmittingReview,
  } = useProductReviews(productId);

  const [page, setPage] = useState(1);
  const { data: reviewsData, isLoading: isLoadingReviews } = useReviewsQuery(page, 5);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [fullname, setFullname] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!fullname.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please enter your review");
      return;
    }

    try {
      await submitReview({
        rating,
        fullname: fullname.trim(),
        review: reviewText.trim(),
      });
      // Reset form
      setRating(0);
      setFullname("");
      setReviewText("");
      setShowAddForm(false);
    } catch (err) {
      // toast is already handled in the hook's onError, but just in case
    }
  };

  const averageRating = aggregate?.averageRating || 0;
  const totalReviews = aggregate?.totalReviews || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[24px] bg-white p-6 gap-0">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 truncate pr-6">
            Reviews for {productName}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            See what other customers are saying or leave your own review.
          </DialogDescription>
        </DialogHeader>

        {/* Aggregate Banner */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-gray-100 rounded-2xl mb-4 shadow-sm">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-gray-950">
                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-xs font-semibold text-gray-400">/ 5.0</span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex">
              {stars.map((star) => {
                const filled = star <= Math.round(averageRating);
                return (
                  <Star
                    key={star}
                    className={`h-4.5 w-4.5 ${
                      filled ? "fill-amber-400 text-amber-400" : "text-gray-300 fill-transparent"
                    }`}
                  />
                );
              })}
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Write a review
              </button>
            )}
          </div>
        </div>

        {/* Add Review Form */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="border border-gray-100 rounded-2xl p-4 bg-slate-50/50 mb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Your Rating</span>
              <div className="flex items-center gap-1">
                {stars.map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90 cursor-pointer outline-none rounded-full p-0.5"
                  >
                    <Star
                      className={`h-5 w-5 transition-colors duration-150 ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300 fill-transparent"
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="fullname" className="text-xs font-bold text-gray-700">
                Your Name
              </label>
              <input
                id="fullname"
                type="text"
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Farex"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="review" className="text-xs font-bold text-gray-700">
                Review Comments
              </label>
              <textarea
                id="review"
                required
                rows={2}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Nice shirts"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all placeholder:text-gray-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                type="button"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="h-8 text-xs font-semibold px-3 rounded-lg border-gray-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingReview}
                className="h-8 text-xs font-semibold px-3 rounded-lg bg-gray-950 text-white hover:bg-gray-800"
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="max-h-[260px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
          {isLoadingReviews ? (
            <div className="text-center py-8 text-sm text-gray-400">Loading reviews...</div>
          ) : !reviewsData?.reviews || reviewsData.reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-400 flex flex-col items-center justify-center gap-2">
              <MessageSquare className="w-8 h-8 stroke-[1.5] text-gray-300" />
              <p className="text-xs font-medium">No reviews yet. Be the first to write one!</p>
            </div>
          ) : (
            <>
              {reviewsData.reviews.map((rev) => (
                <div key={rev.id} className="p-3 border border-gray-100 rounded-xl bg-slate-50/30">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{rev.fullname}</p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex">
                      {stars.map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-300 fill-transparent"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium mt-1">
                    {rev.review}
                  </p>
                </div>
              ))}

              {/* Pagination */}
              {reviewsData.pagination.totalPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="text-[11px] font-bold text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Previous
                  </button>
                  <span className="text-[10px] text-gray-400 font-bold">
                    Page {page} of {reviewsData.pagination.totalPages}
                  </span>
                  <button
                    disabled={page === reviewsData.pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(reviewsData.pagination.totalPages, p + 1))}
                    className="text-[11px] font-bold text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
