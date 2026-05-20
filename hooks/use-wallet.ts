import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { ApiResponse } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";

export interface WalletBalance {
  id: number;
  storeId: number;
  balance: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export const walletKeys = {
  all: ["wallet"] as const,
  balance: (storeId: number | string | undefined) =>
    [...walletKeys.all, "balance", storeId] as const,
};

export const useWallet = () => {
  const { activeStore } = useAuthStore();
  const storeId = activeStore?.id;

  const balanceQuery = useQuery({
    queryKey: walletKeys.balance(storeId),
    queryFn: async (): Promise<WalletBalance> => {
      const { data } = await api.get<ApiResponse<WalletBalance>>(
        `/wallet/${storeId}/balance`
      );
      if (data?.responseSuccessful) {
        console.log(data.responseBody, "wallet balance");
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to fetch wallet balance");
    },
    enabled: !!storeId,
  });

  return {
    walletBalance: balanceQuery.data,
    isFetchingBalance: balanceQuery.isLoading,
    isRefetchingBalance: balanceQuery.isFetching,
    balanceError: balanceQuery.error,
    refetchBalance: balanceQuery.refetch,
  };
};
