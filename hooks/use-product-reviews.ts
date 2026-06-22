import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  ApiResponse,
  Review,
  ReviewsResponse,
  ReviewsAggregateResponse,
  SubmitReviewPayload,
} from "@/types";

// Query Keys
export const reviewKeys = {
  all: ["reviews"] as const,
  productReviews: (productId: number) => [...reviewKeys.all, "product", productId] as const,
  aggregate: (productId: number) => [...reviewKeys.productReviews(productId), "aggregate"] as const,
};

export const useProductReviews = (productId: number) => {
  const queryClient = useQueryClient();

  // 1. Get Product Reviews (Paginated)
  const useReviewsQuery = (page = 1, limit = 10) =>
    useQuery({
      queryKey: [...reviewKeys.productReviews(productId), { page, limit }],
      queryFn: async (): Promise<ReviewsResponse> => {
        const { data } = await api.get<ApiResponse<ReviewsResponse>>(
          `/storefront/products/${productId}/reviews`,
          { params: { page, limit } }
        );
        if (data?.responseSuccessful) {
          return data.responseBody;
        }
        throw new Error(data?.responseMessage || "Failed to retrieve reviews");
      },
      enabled: !!productId,
    });

  // 2. Get Product Reviews Aggregate
  const aggregateQuery = useQuery({
    queryKey: reviewKeys.aggregate(productId),
    queryFn: async (): Promise<ReviewsAggregateResponse> => {
      const { data } = await api.get<ApiResponse<ReviewsAggregateResponse>>(
        `/storefront/products/${productId}/reviews/aggregate`
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to calculate reviews aggregate");
    },
    enabled: !!productId,
  });

  // 3. Submit Product Review
  const submitReviewMutation = useMutation({
    mutationFn: async (payload: SubmitReviewPayload): Promise<Review> => {
      const { data } = await api.post<ApiResponse<Review>>(
        `/storefront/products/${productId}/reviews`,
        payload
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to submit review");
    },
    onSuccess: () => {
      // Invalidate all reviews query and aggregates for this product
      queryClient.invalidateQueries({
        queryKey: reviewKeys.productReviews(productId),
      });
      toast.success("Review submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });

  return {
    useReviewsQuery,
    aggregate: aggregateQuery.data,
    isFetchingAggregate: aggregateQuery.isLoading,
    aggregateError: aggregateQuery.error,
    refetchAggregate: aggregateQuery.refetch,
    submitReview: submitReviewMutation.mutateAsync,
    isSubmittingReview: submitReviewMutation.isPending,
    submitReviewError: submitReviewMutation.error,
    submitReviewSuccess: submitReviewMutation.isSuccess,
    resetSubmitReview: submitReviewMutation.reset,
  };
};
