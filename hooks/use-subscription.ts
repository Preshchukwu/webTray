import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
  ApiResponse,
  SubscriptionInfo,
  PricingPlan,
  SubscribePayload,
  SubscribeResponse,
  VerifySubscriptionResponse,
  PaymentHistory,
  CancelSubscriptionResponse,
} from "@/types";
import { useAuthStore } from "@/store/useAuthStore";

// Query Keys
export const subscriptionKeys = {
  all: ["subscription"] as const,
  info: (businessId?: number) => [...subscriptionKeys.all, "info", businessId] as const,
  plans: () => [...subscriptionKeys.all, "plans"] as const,
  verify: (reference: string) => [...subscriptionKeys.all, "verify", reference] as const,
  history: (businessId?: number) => [...subscriptionKeys.all, "history", businessId] as const,
};

export const useSubscription = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const businessId = user?.business?.id;

  // Fetch subscription info
  const infoQuery = useQuery({
    queryKey: subscriptionKeys.info(businessId),
    queryFn: async (): Promise<SubscriptionInfo> => {
      const { data } = await api.get<ApiResponse<SubscriptionInfo>>(
        "/subscription/info",
        {
          params: { businessId },
        }
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to fetch subscription info");
    },
    enabled: !!businessId,
  });

  // Fetch pricing plans
  const plansQuery = useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: async (): Promise<PricingPlan[]> => {
      const { data } = await api.get<ApiResponse<PricingPlan[]>>(
        "/subscription/pricing-plans"
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to fetch pricing plans");
    },
  });

  // Fetch payment history
  const historyQuery = useQuery({
    queryKey: subscriptionKeys.history(businessId),
    queryFn: async (): Promise<PaymentHistory[]> => {
      const { data } = await api.get<ApiResponse<PaymentHistory[]>>(
        "/subscription/payment-history",
        {
          params: { businessId },
        }
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to fetch payment history");
    },
    enabled: !!businessId,
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (payload: Omit<SubscribePayload, "businessId">): Promise<SubscribeResponse> => {
      if (!businessId) throw new Error("Business ID is missing");
      
      const { data } = await api.post<ApiResponse<SubscribeResponse>>(
        "/subscription/subscribe",
        { ...payload, businessId }
      );
      
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to initialize subscription");
    },
    onSuccess: (data) => {
      // Typically we redirect to Paystack here, handled by the component
    },
    onError: (error: Error) => {
      toast.error(error.message || "Subscription failed");
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async (): Promise<CancelSubscriptionResponse> => {
      if (!businessId) throw new Error("Business ID is missing");
      const { data } = await api.post<ApiResponse<CancelSubscriptionResponse>>(
        "/subscription/cancel",
        { businessId }
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to cancel subscription");
    },
    onSuccess: () => {
      toast.success("Subscription cancelled successfully");
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.info(businessId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel subscription");
    },
  });

  // Verify subscription query
  // This can be used on a success page to check the status of a payment
  const useVerifySubscription = (reference?: string) => {
    return useQuery({
      queryKey: subscriptionKeys.verify(reference || ""),
      queryFn: async (): Promise<VerifySubscriptionResponse> => {
        const { data } = await api.get<ApiResponse<VerifySubscriptionResponse>>(
          `/subscription/verify/${reference}`
        );
        if (data?.responseSuccessful) {
          return data.responseBody;
        }
        throw new Error(data?.responseMessage || "Failed to verify subscription");
      },
      enabled: !!reference,
      retry: (failureCount, error) => {
        // Retry logic for polling the verification status if needed
        return failureCount < 3;
      }
    });
  };

  return {
    // Info
    subscription: infoQuery.data,
    isFetchingSubscription: infoQuery.isLoading,
    subscriptionError: infoQuery.error,
    refetchSubscription: infoQuery.refetch,

    // Plans
    plans: plansQuery.data,
    isFetchingPlans: plansQuery.isLoading,
    plansError: plansQuery.error,

    // Subscribe
    subscribe: subscribeMutation.mutateAsync,
    isSubscribing: subscribeMutation.isPending,
    subscribeError: subscribeMutation.error,

    // Cancel
    cancelSubscription: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    cancelError: cancelMutation.error,

    // Verify (Helper hook exposed)
    useVerifySubscription,

    // History
    history: historyQuery.data,
    isFetchingHistory: historyQuery.isLoading,
    historyError: historyQuery.error,
    refetchHistory: historyQuery.refetch,
  };
};
