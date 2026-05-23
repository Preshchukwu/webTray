import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { getApiErrorMessage } from "@/lib/api-error";
import { ApiResponse, Store } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { StoreFrontSummary, StoreProduct } from "@/types";
import { toast } from "sonner";

// Initialize a broadcast channel for cross-tab synchronization
const syncChannel = typeof window !== "undefined" ? new BroadcastChannel("webtray_store_sync") : null;

interface StoreProductsResponse {
  products: StoreProduct[];
}

interface StoreFrontInfo {
  store: Store;
  productCount: number;
}

interface ChangeProductVisibilityPayload {
  productId: number;
  visibility: boolean;
  storeId: number | string;
}
interface ChangeProductFeaturedPayload {
  productId: number;
  featured: boolean;
  storeId: number | string;
}

// Added interface for store status change
interface ChangeStoreStatusPayload {
  storeId: number | string;
  onlineStatus: boolean;
}

export interface CreateStorePayload {
  storeName: string;
  description: string;
  slogan: string;
  category: string;
  customDomain?: string;
  paymentMethods: { cash: boolean; card: boolean };
  deliveryOptions: { pickup: boolean; delivery: boolean };
  status: "active" | "inactive";
  currency: string;
  phone: string;
}

export interface UpdateStorePayload extends Partial<CreateStorePayload> {
  storeId: number | string;
}

// Query Keys
export const storeFrontKeys = {
  all: ["storefront"] as const,
  summary: (storeId: number | string | undefined) =>
    [...storeFrontKeys.all, "summary", storeId] as const,
  products: (storeId: number | string | undefined) =>
    [...storeFrontKeys.all, "products", storeId] as const,
  info: (storeId: number | string | undefined) =>
    [...storeFrontKeys.all, "info", storeId] as const,
};

export const useStoreFront = () => {
  const { activeStore } = useAuthStore();
  const storeId = activeStore?.id;
  const queryClient = useQueryClient();

  const storeFrontSummaryQuery = useQuery({
    queryKey: storeFrontKeys.summary(storeId),
    queryFn: async (): Promise<StoreFrontSummary> => {
      const { data } = await api.get<ApiResponse<StoreFrontSummary>>(
        `/storefront/summary`,
        {
          params: { storeId },
        }
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(
        data?.responseMessage || "Failed to fetch store front summary"
      );
    },
    enabled: !!storeId,
  });

  const storeProductsQuery = useQuery({
    queryKey: storeFrontKeys.products(storeId),
    queryFn: async (): Promise<StoreProduct[]> => {
      const { data } = await api.get<ApiResponse<StoreProductsResponse>>(
        `/storefront/products`,
        {
          params: { storeId },
        }
      );

      if (data?.responseSuccessful) {
        const products = data.responseBody.products;

        // 🔥 Sort newest first
        return products.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      throw new Error(
        data?.responseMessage || "Failed to fetch store products"
      );
    },
    enabled: !!storeId,
  });

  const storeFrontInfoQuery = useQuery({
    queryKey: storeFrontKeys.info(storeId),
    queryFn: async (): Promise<StoreFrontInfo> => {
      const { data } = await api.get<ApiResponse<StoreFrontInfo>>(
        `/storefront/info`,
        {
          params: { storeId },
        }
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(
        data?.responseMessage || "Failed to fetch store front info"
      );
    },
    enabled: !!storeId,
  });

  const changeProductVisibilityMutation = useMutation({
    mutationFn: async ({
      productId,
      visibility,
      storeId,
    }: ChangeProductVisibilityPayload) => {
      const { data } = await api.put<ApiResponse<{ product: StoreProduct }>>(
        `/storefront/products/visibility`,
        { productId, visibility },
        { params: { storeId } }
      );

      if (data?.responseSuccessful) {
        return data.responseBody.product;
      }
      throw new Error(
        data?.responseMessage || "Failed to update product visibility"
      );
    },
    // Add optimistic update
    onMutate: async ({ productId, visibility, storeId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: storeFrontKeys.products(storeId),
      });

      // Snapshot previous value
      const previousProducts = queryClient.getQueryData<StoreProduct[]>(
        storeFrontKeys.products(storeId)
      );

      // Optimistically update
      if (previousProducts) {
        queryClient.setQueryData<StoreProduct[]>(
          storeFrontKeys.products(storeId),
          previousProducts.map((p) =>
            p.id === productId ? { ...p, visible: visibility } : p
          )
        );
      }

      return { previousProducts };
    },
    onSuccess: (updatedProduct) => {
      toast.success("Product visibility updated successfully");
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: storeFrontKeys.products(updatedProduct.storeId),
      });
      // Notify other tabs to refresh
      syncChannel?.postMessage({ type: "PRODUCT_UPDATED", storeId: updatedProduct.storeId });
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(
          storeFrontKeys.products(variables.storeId),
          context.previousProducts
        );
      }
      toast.error(error.message || "Error updating product visibility");
    },
  });

  const changeProductFeaturedMutation = useMutation({
    mutationFn: async ({
      productId,
      featured,
      storeId,
    }: ChangeProductFeaturedPayload) => {
      const { data } = await api.put<ApiResponse<{ product: StoreProduct }>>(
        `/storefront/products/featured`,
        { productId, featured },
        { params: { storeId } }
      );

      if (data?.responseSuccessful) {
        return data.responseBody.product;
      }
      throw new Error(
        data?.responseMessage || "Failed to update product featured status"
      );
    },
    // Add optimistic update
    onMutate: async ({ productId, featured, storeId }) => {
      await queryClient.cancelQueries({
        queryKey: storeFrontKeys.products(storeId),
      });

      const previousProducts = queryClient.getQueryData<StoreProduct[]>(
        storeFrontKeys.products(storeId)
      );

      if (previousProducts) {
        queryClient.setQueryData<StoreProduct[]>(
          storeFrontKeys.products(storeId),
          previousProducts.map((p) =>
            p.id === productId ? { ...p, feature: featured } : p
          )
        );
      }

      return { previousProducts };
    },
    onSuccess: (updatedProduct) => {
      toast.success("Product featured status updated successfully");
      queryClient.invalidateQueries({
        queryKey: storeFrontKeys.products(updatedProduct.storeId),
      });
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(
          storeFrontKeys.products(variables.storeId),
          context.previousProducts
        );
      }
      toast.error(error.message || "Error updating product featured status");
    },
  });

  // New mutation: change store online status
  const changeStoreStatusMutation = useMutation({
    mutationFn: async ({ storeId, onlineStatus }: ChangeStoreStatusPayload) => {
      const { data } = await api.patch<ApiResponse<{ store: StoreFrontInfo['store'] }>>(
        `/storefront/status/${storeId}`,
        { onlineStatus }
      );

      if (data?.responseSuccessful) return data.responseBody.store;
      throw new Error(data?.responseMessage || 'Failed to update store status');
    },
    onMutate: async ({ storeId, onlineStatus }) => {
      await queryClient.cancelQueries({ queryKey: storeFrontKeys.info(storeId) });
      const previous = queryClient.getQueryData<StoreFrontInfo>(storeFrontKeys.info(storeId));
      if (previous) {
        queryClient.setQueryData<StoreFrontInfo>(storeFrontKeys.info(storeId), {
          ...previous,
          store: { ...previous.store, online: onlineStatus },
        });
      }
      return { previous };
    },
    onSuccess: (updatedStore) => {
      // set returned store to cache to avoid flicker
      queryClient.setQueryData<StoreFrontInfo>(storeFrontKeys.info(updatedStore.id), (prev) => {
        if (!prev) return undefined;
        return {
          ...prev,
          store: { ...prev.store, ...updatedStore },
          productCount: prev.productCount // always preserve productCount
        };
      });
      queryClient.invalidateQueries({ queryKey: storeFrontKeys.summary(updatedStore.id) });
      // Notify other tabs to refresh
      syncChannel?.postMessage({ type: "STORE_STATUS_UPDATED", storeId: updatedStore.id });
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(storeFrontKeys.info(variables.storeId), context.previous);
      }
      toast.error(error.message || 'Error updating store status');
    },
  });

  // ✅ NEW: Upload Store Logo
  const uploadStoreLogoMutation = useMutation({
    mutationFn: async ({ storeId, formData }: { storeId: number | string; formData: FormData }) => {
      const { data } = await api.post<ApiResponse<{ store: Store }>>(
        `/storefront/image`,
        formData,
        {
          params: { storeId },
        }
      );

      if (data?.responseSuccessful) return data.responseBody.store;
      throw new Error(data?.responseMessage || 'Failed to upload logo');
    },
    onSuccess: (_, variables) => {
      const storeId = variables.storeId;
      toast.success('Logo uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: storeFrontKeys.info(storeId) });
      queryClient.invalidateQueries({ queryKey: storeFrontKeys.summary(storeId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error uploading logo');
    },
  });

  // Create a new store
  const createStoreMutation = useMutation({
    mutationFn: async (payload: CreateStorePayload) => {
      try {
        const { data } = await api.post<ApiResponse<{ store: StoreFrontInfo['store'] }>>(
          `/storefront`,
          payload
        );
        if (data?.responseSuccessful) return data.responseBody.store;
        throw new Error(data?.responseMessage || "Failed to create store");
      } catch (error) {
        throw new Error(getApiErrorMessage(error, "Failed to create store"));
      }
    },
    onSuccess: (newStore) => {
      toast.success('Store created successfully!');
      
      // Automatically set the new store as active in the global state
      const { stores } = useAuthStore.getState();
      useAuthStore.setState({
        stores: [...stores, newStore],
        activeStore: newStore,
        lastActiveStoreId: newStore.id
      });

      queryClient.invalidateQueries({ queryKey: storeFrontKeys.all });
    },
    onError: (error: Error) => {
      toast.error(getApiErrorMessage(error, "Error creating store"));
    },
  });

  // Update existing store info
  const updateStoreMutation = useMutation({
    mutationFn: async ({ storeId, ...payload }: UpdateStorePayload) => {
      const { data } = await api.patch<ApiResponse<{ store: StoreFrontInfo['store'] }>>(
        `/storefront/${storeId}`,
        payload
      );
      if (data?.responseSuccessful) return data.responseBody.store;
      throw new Error(data?.responseMessage || 'Failed to update store');
    },
    onSuccess: (updatedStore) => {
      toast.success('Store updated successfully!');
      queryClient.invalidateQueries({ queryKey: storeFrontKeys.info(updatedStore.id) });
      queryClient.invalidateQueries({ queryKey: storeFrontKeys.summary(updatedStore.id) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error updating store');
    },
  });

  const changeProductVisibility = async (
    payload: ChangeProductVisibilityPayload
  ) => {
    return changeProductVisibilityMutation.mutateAsync(payload);
  };
  const changeProductFeatured = async (
    payload: ChangeProductFeaturedPayload
  ) => {
    return changeProductFeaturedMutation.mutateAsync(payload);
  };

  const changeStoreStatus = async (payload: ChangeStoreStatusPayload) =>
    changeStoreStatusMutation.mutateAsync(payload);

  const createStore = async (payload: CreateStorePayload) =>
    createStoreMutation.mutateAsync(payload);

  const updateStore = async (payload: UpdateStorePayload) =>
    updateStoreMutation.mutateAsync(payload);

  return {
    activeStore,
    storefrontSummary: storeFrontSummaryQuery.data,
    isFetchingStorefrontSummary: storeFrontSummaryQuery.isLoading,
    storefrontSummaryError: storeFrontSummaryQuery.error,
    refetchStorefrontSummary: storeFrontSummaryQuery.refetch,

    storeProducts: storeProductsQuery.data,
    isFetchingStoreProducts: storeProductsQuery.isLoading,
    storeProductsError: storeProductsQuery.error,
    refetchStoreProducts: storeProductsQuery.refetch,

    storeInfo: storeFrontInfoQuery.data,
    isFetchingStoreInfo: storeFrontInfoQuery.isLoading,
    storeInfoError: storeFrontInfoQuery.error,
    refetchStoreInfo: storeFrontInfoQuery.refetch,

    // ✅ Visibility Mutations
    changeProductVisibility,
    isUpdatingProductVisibility: changeProductVisibilityMutation.isPending,

    // ✅ Featured Mutations
    changeProductFeatured,
    isUpdatingProductFeatured: changeProductFeaturedMutation.isPending,

    // ✅ Store Status Mutations
    changeStoreStatus,
    isUpdatingStoreStatus: changeStoreStatusMutation.isPending,

    // ✅ Logo Mutations
    uploadStoreLogo: uploadStoreLogoMutation.mutateAsync,
    isUploadingLogo: uploadStoreLogoMutation.isPending,

    // ✅ Create / Update Store
    createStore,
    isCreatingStore: createStoreMutation.isPending,
    updateStore,
    isUpdatingStore: updateStoreMutation.isPending,
  };
};
