import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { ApiResponse } from "@/types";
import type {
  AdHistoryItem,
  AdOverview,
  InitiateAdPayload,
  InitiateAdResponse,
  VerifyAdResponse,
} from "@/types";

export const adsKeys = {
  all: ["ads"] as const,
  history: (storeId: number | string | undefined) =>
    [...adsKeys.all, "history", storeId] as const,
  overview: (storeId: number | string | undefined) =>
    [...adsKeys.all, "overview", storeId] as const,
  verify: (reference: string | undefined) =>
    [...adsKeys.all, "verify", reference] as const,
};

export const useAds = () => {
  const { activeStore } = useAuthStore();
  const queryClient = useQueryClient();
  const storeId = activeStore?.id;

  const adsHistoryQuery = useQuery({
    queryKey: adsKeys.history(storeId),
    queryFn: async (): Promise<AdHistoryItem[]> => {
      const { data } = await api.get<ApiResponse<AdHistoryItem[]>>(
        "/ads/history",
        { params: { storeId } }
      );
      if (data?.responseSuccessful) {
        return data.responseBody ?? [];
      }
      throw new Error(data?.responseMessage || "Failed to fetch ad history");
    },
    enabled: !!storeId,
  });

  const adsOverviewQuery = useQuery({
    queryKey: adsKeys.overview(storeId),
    queryFn: async (): Promise<AdOverview> => {
      const { data } = await api.get<ApiResponse<AdOverview>>(
        "/ads/overview",
        { params: { storeId } }
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to fetch ad overview");
    },
    enabled: !!storeId,
  });

  const initiateAdMutation = useMutation({
    mutationFn: async (
      payload: Omit<InitiateAdPayload, "storeId">
    ): Promise<InitiateAdResponse> => {
      if (!storeId) throw new Error("No active store selected");
      const body = {
        storeId,
        productIds: payload.productIds,
        days: payload.days,
        callbackUrl: payload.callbackUrl,
      };
      const { data } = await api.post<ApiResponse<InitiateAdResponse>>(
        "/ads/initiate",
        body
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to initiate ad campaign");
    },
    onSuccess: () => {
      toast.success("Ad campaign initiated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initiate ad campaign");
    },
  });

  const useVerifyAdQuery = (reference: string | undefined) =>
    useQuery({
      queryKey: adsKeys.verify(reference),
      queryFn: async (): Promise<VerifyAdResponse> => {
        const { data } = await api.get<ApiResponse<VerifyAdResponse>>(
          `/ads/verify/${reference}`
        );
        if (data?.responseSuccessful) {
          // Invalidate overview and history queries to get latest data
          queryClient.invalidateQueries({ queryKey: adsKeys.history(storeId) });
          queryClient.invalidateQueries({ queryKey: adsKeys.overview(storeId) });
          return data.responseBody;
        }
        throw new Error(data?.responseMessage || "Failed to verify ad payment");
      },
      enabled: !!reference && !!storeId,
    });

  return {
    adsHistory: adsHistoryQuery.data,
    isFetchingHistory: adsHistoryQuery.isLoading,
    isRefetchingHistory: adsHistoryQuery.isFetching,
    historyError: adsHistoryQuery.error,
    refetchHistory: adsHistoryQuery.refetch,

    adsOverview: adsOverviewQuery.data,
    isFetchingOverview: adsOverviewQuery.isLoading,
    isRefetchingOverview: adsOverviewQuery.isFetching,
    overviewError: adsOverviewQuery.error,
    refetchOverview: adsOverviewQuery.refetch,

    initiateAd: initiateAdMutation.mutateAsync,
    isInitiatingAd: initiateAdMutation.isPending,

    useVerifyAdQuery,
  };
};
