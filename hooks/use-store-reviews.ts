import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  ApiResponse,
  StoreReview,
  StoreReviewsResponse,
  StoreReviewsAggregateResponse,
  SubmitStoreReviewPayload,
} from "@/types";

// Query Keys
export const storeReviewKeys = {
  all: ["store-reviews"] as const,
  storeReviews: (storeId: number) => [...storeReviewKeys.all, "store", storeId] as const,
  aggregate: (storeId: number) => [...storeReviewKeys.storeReviews(storeId), "aggregate"] as const,
};

export const useStoreReviews = (storeId: number) => {
  const queryClient = useQueryClient();

  // 1. Get Store Reviews (Paginated)
  const useReviewsQuery = (page = 1, limit = 10) =>
    useQuery({
      queryKey: [...storeReviewKeys.storeReviews(storeId), { page, limit }],
      queryFn: async (): Promise<StoreReviewsResponse> => {
        const { data } = await api.get<ApiResponse<StoreReviewsResponse>>(
          `/storefront/stores/${storeId}/reviews`,
          { params: { page, limit } }
        );
        if (data?.responseSuccessful) {
          return data.responseBody;
        }
        throw new Error(data?.responseMessage || "Failed to retrieve reviews");
      },
      enabled: !!storeId,
    });

  // 2. Get Store Reviews Aggregate
  const aggregateQuery = useQuery({
    queryKey: storeReviewKeys.aggregate(storeId),
    queryFn: async (): Promise<StoreReviewsAggregateResponse> => {
      const { data } = await api.get<ApiResponse<StoreReviewsAggregateResponse>>(
        `/storefront/stores/${storeId}/reviews/aggregate`
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to calculate reviews aggregate");
    },
    enabled: !!storeId,
  });

  // 3. Submit Store Review
  const submitReviewMutation = useMutation({
    mutationFn: async (payload: SubmitStoreReviewPayload): Promise<StoreReview> => {
      const { data } = await api.post<ApiResponse<StoreReview>>(
        `/storefront/stores/${storeId}/reviews`,
        payload
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to submit review");
    },
    onSuccess: () => {
      // Invalidate all reviews query and aggregates for this store
      queryClient.invalidateQueries({
        queryKey: storeReviewKeys.storeReviews(storeId),
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
