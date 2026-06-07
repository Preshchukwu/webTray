import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { ApiResponse } from "@/types";
import type { Notification, NotificationsResponse } from "@/types";

export type { Notification, NotificationsResponse };

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const notificationKeys = {
  all: ["notifications"] as const,
  byStoreId: (storeId: number | string) => [...notificationKeys.all, "store", storeId] as const,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useNotification = (storeId?: number | string) => {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: notificationKeys.byStoreId(storeId as number | string),
    queryFn: async (): Promise<NotificationsResponse> => {
      const { data } = await api.get<ApiResponse<NotificationsResponse>>(
        `/notifications/${storeId}`
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to load notifications");
    },
    enabled: !!storeId,
  });

  const readAllMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const { data } = await api.patch<ApiResponse<null>>(
        `/notifications/${storeId}/read-all`
      );
      if (!data?.responseSuccessful) {
        throw new Error(data?.responseMessage || "Failed to mark all as read");
      }
    },
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: notificationKeys.byStoreId(storeId) });
      }
      toast.success("All notifications marked as read");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark all as read");
    },
  });

  const readNotificationMutation = useMutation({
    mutationFn: async (id: number | string): Promise<Notification> => {
      const { data } = await api.patch<ApiResponse<Notification>>(
        `/notifications/${storeId}/${id}/read`
      );
      if (!data?.responseSuccessful) {
        throw new Error(data?.responseMessage || "Failed to mark as read");
      }
      return data.responseBody;
    },
    onSuccess: () => {
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: notificationKeys.byStoreId(storeId) });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark as read");
    },
  });

  return {
    notifications: notificationsQuery.data?.notifications || [],
    meta: notificationsQuery.data?.meta,
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,

    readAll: readAllMutation.mutateAsync,
    isReadingAll: readAllMutation.isPending,

    readNotification: readNotificationMutation.mutateAsync,
    isReading: readNotificationMutation.isPending,
  };
};
