import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/axios";
import { ApiResponse, Order, OrderSummary, Customer, Product } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderPayload {
  customerName: string;
  phone: string;
  orderItems: OrderItem[];
  paymentMethod?: string;
  onlinePaymentType?: string;
}

export interface UpdateOrderPayload {
  customerName?: string;
  phone?: string;
  orderItems?: OrderItem[];
  status?: string;
}

export interface UpdateOrderStatusPayload {
  status: string;
}

export interface UpdateOrderResponseBody {
  order: ApiOrder & {
    customer?: Customer;
    isDeleted?: boolean;
    isOnline?: boolean;
  };
}

// API Response Order Item Structure
export interface ApiOrderItem {
  id: number;
  orderId: number;
  productId: number;
  price: string;
  quantity: number;
  subTotal: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Order Structure
export interface ApiOrder {
  id: number;
  storeId: number;
  customerId: number;
  totalAmount: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderItems: ApiOrderItem[];
}

export interface OrderResponse {
  order: ApiOrder;
}

export interface OrdersResponse {
  orders: ApiOrder[];
}

export interface OrderDetail {
  order: Order;
  customer: Customer;
  products: Product[];
  orderItems: ApiOrderItem[];
}

// ✅ Updated orderKeys to always include storeId
export const orderKeys = {
  all: ["orders"] as const,
  orders: (storeId: number | string | undefined) => 
    [...orderKeys.all, "list", storeId] as const,
  order: (id: number, storeId: number | string | undefined) => 
    [...orderKeys.all, "detail", id, storeId] as const,
  summary: (storeId: number | string | undefined) => 
    [...orderKeys.all, "summary", storeId] as const,
};

export const useOrder = () => {
  const { activeStore } = useAuthStore();
  const queryClient = useQueryClient();

  const storeId = activeStore?.id;

  // ✅ Updated invalidation function to match product hook pattern
  const invalidateStoreQueries = (storeId: number | string) => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        Array.isArray(query.queryKey) && query.queryKey.includes(storeId),
    });
  };

  // List Orders Query
  const ordersQuery = useQuery({
    queryKey: orderKeys.orders(storeId),
    queryFn: async (): Promise<Order[]> => {
      const { data } = await api.get<ApiResponse<{ orders: Order[] }>>(
        "/inventory/order",
        {
          params: {
            storeId: storeId
          }
        }
      );
      if (data?.responseSuccessful) {
        return data.responseBody.orders;
      }
      throw new Error(data?.responseMessage || "Failed to fetch orders");
    },
    enabled: !!storeId,
  });

  // Order Summary Query
  const orderSummaryQuery = useQuery({
    queryKey: orderKeys.summary(storeId),
    queryFn: async (): Promise<OrderSummary> => {
      const { data } = await api.get<ApiResponse<OrderSummary>>(
        "/inventory/order/summary",
        {
          params: {
            storeId: storeId
          }
        }
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to fetch order summary");
    },
    enabled: !!storeId,
  });

  // Single Order Hook
  const useOrderQuery = (id: number) =>
    useQuery({
      queryKey: orderKeys.order(id, storeId),
      queryFn: async (): Promise<OrderDetail> => {
        const { data } = await api.get<ApiResponse<OrderDetail>>(
          `/inventory/order/${id}`,
          {
            params: {
              storeId: storeId
            }
          }
        );
        if (data?.responseSuccessful) {
          return data.responseBody;
        }
        throw new Error(data?.responseMessage || "Failed to fetch order");
      },
      enabled: !!(id && storeId),
    });

  // Get Order Function
  const getOrder = async (id: number): Promise<Order> => {
    const { data } = await api.get<ApiResponse<{ order: Order }>>(
      `/inventory/order/${id}`
    );
    if (data?.responseSuccessful) {
      return data.responseBody.order;
    }
    throw new Error(data?.responseMessage || "Failed to fetch order");
  };

  // Add Order Mutation
  const addOrderMutation = useMutation({
    mutationFn: async (payload: CreateOrderPayload): Promise<ApiOrder> => {
      const { data } = await api.post<ApiResponse<ApiOrder>>(
        "/inventory/order",
        payload,
        {
          params: {
            storeId: storeId
          }
        }
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to add order");
    },
    onSuccess: (newOrder) => {
      // ✅ Use the same pattern as product hook
      const targetStoreId = newOrder.storeId ?? storeId;
      if (targetStoreId !== undefined) {
        invalidateStoreQueries(targetStoreId);
      }
      toast.success("Order added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add order");
    },
  });

  // Update Order Mutation (e.g. PATCH /inventory/order/:id?storeId=… body: { status })
  const updateOrderMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateOrderPayload;
    }): Promise<UpdateOrderResponseBody["order"]> => {
      const { data } = await api.patch<ApiResponse<UpdateOrderResponseBody>>(
        `/inventory/order/${id}`,
        payload,
        { params: { storeId } }
      );
      if (data?.responseSuccessful) {
        return data.responseBody.order;
      }
      throw new Error(data?.responseMessage || "Failed to update order");
    },
    onSuccess: (updatedOrder) => {
      const targetStoreId = updatedOrder.storeId ?? storeId;
      if (targetStoreId !== undefined) {
        invalidateStoreQueries(targetStoreId);
      }

      queryClient.setQueryData<Order[]>(orderKeys.orders(storeId), (old) => {
        if (!old) return old;
        return old.map((order) =>
          order.id === updatedOrder.id
            ? {
                ...order,
                status: updatedOrder.status,
                updatedAt: updatedOrder.updatedAt,
              }
            : order
        );
      });

      queryClient.setQueryData<OrderDetail>(
        orderKeys.order(updatedOrder.id, storeId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            order: {
              ...old.order,
              status: updatedOrder.status,
              updatedAt: updatedOrder.updatedAt,
            },
            customer: updatedOrder.customer
              ? { ...old.customer, ...updatedOrder.customer }
              : old.customer,
            orderItems: updatedOrder.orderItems ?? old.orderItems,
          };
        }
      );

      toast.success("Order updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update order");
    },
  });

  // Delete Order Mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { data } = await api.delete<ApiResponse<void>>(
        `/inventory/order/${id}`
      );
      if (!data?.responseSuccessful) {
        throw new Error(data?.responseMessage || "Failed to delete order");
      }
    },
    onSuccess: (_, deletedOrderId) => {
      // ✅ Invalidate all queries for this store
      if (storeId) {
        queryClient.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) && query.queryKey.includes(storeId),
        });
      }

      // ✅ Optimistically remove from orders list cache
      queryClient.setQueryData<Order[]>(orderKeys.orders(storeId), (old) => {
        return old ? old.filter(order => order.id !== deletedOrderId) : [];
      });

      // ✅ Remove single order cache
      queryClient.removeQueries({ queryKey: orderKeys.order(deletedOrderId, storeId) });

      toast.success("Order deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete order");
    },
  });

  const addOrder = async (payload: CreateOrderPayload) => {
    return addOrderMutation.mutateAsync(payload);
  };

  const updateOrder = async (id: number, payload: UpdateOrderPayload) => {
    return updateOrderMutation.mutateAsync({ id, payload });
  };

  const updateOrderStatus = async (id: number, status: string) => {
    return updateOrderMutation.mutateAsync({ id, payload: { status } });
  };

  const deleteOrder = async (id: number) => {
    return deleteOrderMutation.mutateAsync(id);
  };

  return {
    // Data
    orders: ordersQuery.data,
    orderSummary: orderSummaryQuery.data,

    // Loading states
    isFetchingOrders: ordersQuery.isLoading,
    isFetchingOrderSummary: orderSummaryQuery.isLoading,
    isAddingOrder: addOrderMutation.isPending,
    isUpdatingOrder: updateOrderMutation.isPending,
    isDeletingOrder: deleteOrderMutation.isPending,

    // Error states
    ordersError: ordersQuery.error,
    orderSummaryError: orderSummaryQuery.error,
    addOrderError: addOrderMutation.error,
    updateOrderError: updateOrderMutation.error,
    deleteOrderError: deleteOrderMutation.error,

    // Success states
    addOrderSuccess: addOrderMutation.isSuccess,
    updateOrderSuccess: updateOrderMutation.isSuccess,
    deleteOrderSuccess: deleteOrderMutation.isSuccess,

    // Functions
    refetchOrders: ordersQuery.refetch,
    refetchOrderSummary: orderSummaryQuery.refetch,
    getOrder,
    useOrderQuery,
    addOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,

    // Reset functions
    resetAddOrder: addOrderMutation.reset,
    resetUpdateOrder: updateOrderMutation.reset,
    resetDeleteOrder: deleteOrderMutation.reset,
  };
};