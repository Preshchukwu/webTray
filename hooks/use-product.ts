import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  ApiResponse,
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/types";
import { useAuthStore } from "@/store/useAuthStore";

export interface ProductResponse {
  product: Product;
}

export interface ProductsResponse {
  products: Product[];
}

// ✅ Updated productKeys so they always include storeId
export const productKeys = {
  all: ["inventory"] as const,
  products: (storeId: number | string | undefined) =>
    [...productKeys.all, "products", storeId] as const,
  product: (id: number, storeId: number | string | undefined) =>
    [...productKeys.all, "product", id, storeId] as const,
};

export const useProduct = () => {
  const { activeStore } = useAuthStore();
  const queryClient = useQueryClient();

  const storeId = activeStore?.id;

  const invalidateStoreQueries = (storeId: number | string) => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) && query.queryKey.includes(storeId),
    });
  };

  const productsQuery = useQuery({
    queryKey: productKeys.products(storeId),
    queryFn: async (): Promise<Product[]> => {
      const { data } = await api.get<ApiResponse<{ products: Product[] }>>(
        "/inventory/product",
        { params: { storeId } },
      );
      if (data?.responseSuccessful) {
        return data.responseBody.products;
      }
      throw new Error(data?.responseMessage || "Failed to fetch products");
    },
    enabled: !!storeId,
  });

  const useProductQuery = (id: number) =>
    useQuery({
      queryKey: productKeys.product(id, storeId),
      queryFn: async (): Promise<Product> => {
        const { data } = await api.get<ApiResponse<{ product: Product }>>(
          `/inventory/product/${id}`,
        );
        if (data?.responseSuccessful) {
          return data.responseBody.product;
        }
        throw new Error(data?.responseMessage || "Failed to fetch product");
      },
      enabled: !!id && !!storeId,
    });

  const getProduct = async (id: number): Promise<Product> => {
    const { data } = await api.get<ApiResponse<{ product: Product }>>(
      `/inventory/product/${id}`,
    );
    if (data?.responseSuccessful) {
      return data.responseBody.product;
    }
    throw new Error(data?.responseMessage || "Failed to fetch product");
  };

  const addProductMutation = useMutation({
    mutationFn: async (
      payload: CreateProductPayload | FormData,
    ): Promise<Product> => {
      const isFormData = payload instanceof FormData;

      const { data } = await api.post<ApiResponse<{ product: Product }>>(
        "/inventory/product",
        payload,
        isFormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : undefined,
      );

      if (data?.responseSuccessful) {
        return data.responseBody.product;
      }
      throw new Error(data?.responseMessage || "Failed to add product");
    },
    onSuccess: (newProduct) => {
      const targetStoreId = newProduct.storeId ?? storeId;
      if (targetStoreId !== undefined) {
        invalidateStoreQueries(targetStoreId);
      }
      // Toast is handled by the caller (handleSubmitAll)
    },
    onError: () => {
      // Toast is handled by the caller (handleSubmitAll)
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: UpdateProductPayload): Promise<Product> => {
      const { data } = await api.patch<ApiResponse<{ product: Product }>>(
        `/inventory/product/${id}`,
        payload,
        { params: { storeId } },
      );
      if (data?.responseSuccessful) {
        return data.responseBody.product;
      }
      throw new Error(data?.responseMessage || "Failed to update product");
    },
    onSuccess: (updatedProduct) => {
      if (storeId) {
        queryClient.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) && query.queryKey.includes(storeId),
        });
      }

      queryClient.setQueryData<Product[]>(
        productKeys.products(storeId),
        (old) => {
          if (!old) return old;
          return old.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product,
          );
        },
      );

      queryClient.setQueryData<Product>(
        productKeys.product(updatedProduct.id, storeId),
        updatedProduct,
      );

      toast.success("Product updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { data } = await api.delete<ApiResponse<object>>(
        `/inventory/product/${id}`,
        { params: { storeId } },
      );
      if (!data?.responseSuccessful) {
        throw new Error(data?.responseMessage || "Failed to delete product");
      }
    },
    onSuccess: (_, deletedProductId) => {
      if (storeId) {
        queryClient.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) && query.queryKey.includes(storeId),
        });
      }

      queryClient.setQueryData<Product[]>(
        productKeys.products(storeId),
        (old) => {
          return old
            ? old.filter((product) => product.id !== deletedProductId)
            : [];
        },
      );

      queryClient.removeQueries({
        queryKey: productKeys.product(deletedProductId, storeId),
      });

      toast.success("Product deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  // ✅ NEW: Upload Product Images
  const uploadProductImagesMutation = useMutation({
    mutationFn: async ({
      productId,
      formData,
    }: {
      productId: number;
      formData: FormData;
    }): Promise<Product | null> => {
      if (!storeId) {
        throw new Error("No active store selected");
      }

      const { data } = await api.patch<ApiResponse<{ product: Product }>>(
        `/inventory/product/image/${productId}?storeId=${storeId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (data?.responseSuccessful) {
        console.log(data?.responseBody, "upload")
        return data.responseBody?.product || null;
      }
      throw new Error(data?.responseMessage || "Failed to upload images");
    },
    onSuccess: (updatedProduct) => {
      if (storeId) {
        invalidateStoreQueries(storeId);
      }

      // Guard: if the backend didn't return a product, just return
      if (!updatedProduct) {
        toast.success("Images uploaded successfully");
        return;
      }

      queryClient.setQueryData<Product[]>(
        productKeys.products(storeId),
        (old) => {
          if (!old) return old;
          return old.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product,
          );
        },
      );

      queryClient.setQueryData<Product>(
        productKeys.product(updatedProduct.id, storeId),
        updatedProduct,
      );

      toast.success("Images uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload images");
    },
  });

  // ✅ NEW: Delete Product Images
  const deleteProductImagesMutation = useMutation({
    mutationFn: async ({
      productId,
      imageUrls,
    }: {
      productId: number;
      imageUrls?: string[];
    }): Promise<void> => {
      const { data } = await api.delete<ApiResponse<object>>(
        `/inventory/product/image/${productId}`,
        {
          params: { storeId },
          data: imageUrls ? { imageUrlsToDelete: imageUrls } : undefined,
        },
      );

      if (!data?.responseSuccessful) {
        throw new Error(data?.responseMessage || "Failed to delete images");
      }
      console.log(data?.responseBody, "delete");
    },
    onSuccess: (_, { productId, imageUrls }) => {
      // Invalidate all queries related to this store to ensure sync across different hooks
      if (storeId) {
        invalidateStoreQueries(storeId);

        // Also update the specific product keys for safety
        queryClient.setQueryData<Product[]>(
          productKeys.products(storeId),
          (old) => {
            if (!old) return old;
            return old.map((product) => {
              if (product.id === productId) {
                if (!imageUrls) return { ...product, images: [] };
                return {
                  ...product,
                  images: product.images?.filter(
                    (img) => !imageUrls.includes(img),
                  ),
                };
              }
              return product;
            });
          },
        );

        queryClient.setQueryData<Product>(
          productKeys.product(productId, storeId),
          (old) => {
            if (!old) return old;
            if (!imageUrls) return { ...old, images: [] };
            return {
              ...old,
              images: old.images?.filter((img) => !imageUrls.includes(img)),
            };
          },
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete images");
    },
  });

  return {
    products: productsQuery.data,
    isFetchingProducts: productsQuery.isLoading,
    productsError: productsQuery.error,
    refetchProducts: productsQuery.refetch,
    getProduct,
    useProductQuery,
    addProduct: addProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    uploadProductImages: uploadProductImagesMutation.mutateAsync,
    deleteProductImages: deleteProductImagesMutation.mutateAsync,
    isAddingProduct: addProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
    isDeletingProduct: deleteProductMutation.isPending,
    isUploadingImages: uploadProductImagesMutation.isPending,
    isDeletingImages: deleteProductImagesMutation.isPending,
    addProductError: addProductMutation.error,
    updateProductError: updateProductMutation.error,
    deleteProductError: deleteProductMutation.error,
    uploadImagesError: uploadProductImagesMutation.error,
    deleteImagesError: deleteProductImagesMutation.error,
    addProductSuccess: addProductMutation.isSuccess,
    updateProductSuccess: updateProductMutation.isSuccess,
    deleteProductSuccess: deleteProductMutation.isSuccess,
    uploadImagesSuccess: uploadProductImagesMutation.isSuccess,
    deleteImagesSuccess: deleteProductImagesMutation.isSuccess,
    resetAddProduct: addProductMutation.reset,
    resetUpdateProduct: updateProductMutation.reset,
    resetDeleteProduct: deleteProductMutation.reset,
    resetUploadImages: uploadProductImagesMutation.reset,
    resetDeleteImages: deleteProductImagesMutation.reset,
  };
};