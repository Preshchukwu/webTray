import { publicApi } from "../axios";
import { BASE_URL } from "@/constants/api";
import { ApiResponse, Store, Order } from "@/types";

export interface CreateStorefrontOrderPayload {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  callbackUrl?: string;
  orderItems: {
    productId: number;
    quantity: number;
  }[];
}

export interface PaystackInitResponse {
  order: Order & { orderItems: any[] };
  payment: {
    transactionId: number;
    authorizationUrl: string;
    accessCode: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  order: Order;
  transaction: {
    id: number;
    status: string;
    reference: string;
    paidAt: string;
  };
  verified: boolean;
}

/**
 * Fetch store details by slug (Server-side)
 */
export const getStoreBySlug = async (slug: string) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${BASE_URL}/storefront/${slug}`, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    if (data?.responseSuccessful) {
      return data.responseBody.store;
    }
    return null;
  } catch (error) {
    console.error("Error fetching store by slug:", error);
    return null;
  }
};

/**
 * Fetch store details + categories by slug (Server-side)
 */
export const getStorefront = async (slug: string) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${BASE_URL}/storefront/${slug}`, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    if (data?.responseSuccessful) {
      return {
        store: data.responseBody.store ?? null,
        categories: data.responseBody.categories ?? [],
      };
    }
    return { store: null, categories: [] };
  } catch (error) {
    console.error("Error fetching storefront:", error);
    return { store: null, categories: [] };
  }
};

/**
 * Fetch all products for a store (Server-side)
 */
export const getStoreProducts = async (slug: string) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `${BASE_URL}/storefront/products/${slug}?limit=1000`,
      {
        next: { revalidate: 3600 },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    const data = await res.json();
    if (data?.responseSuccessful) {
      return data.responseBody.products || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching store products:", error);
    return [];
  }
};

/**
 * Fetch a single product by ID (Server-side)
 */
export const getProductById = async (slug: string, productId: string) => {
  try {
    const products = await getStoreProducts(slug);
    return products.find((p: any) => p.id.toString() === productId) || null;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
};

/**
 * Initialize a Paystack-based order on the storefront
 */
export const initializePaystackOrder = async (
  slug: string,
  payload: CreateStorefrontOrderPayload
) => {
  const { data } = await publicApi.post<ApiResponse<PaystackInitResponse>>(
    `/storefront/${slug}/order/paystack`,
    payload
  );

  if (!data?.responseSuccessful) {
    throw new Error(data?.responseMessage || "Failed to initialize payment");
  }

  return data.responseBody;
};

/**
 * Verify a Paystack payment on the storefront
 */
export const verifyPaystackPayment = async (
  slug: string,
  reference: string
) => {
  const { data } = await publicApi.get<ApiResponse<PaystackVerifyResponse>>(
    `/storefront/${slug}/order/paystack/verify/${reference}`
  );

  if (!data?.responseSuccessful) {
    throw new Error(data?.responseMessage || "Failed to verify payment");
  }

  return data.responseBody;
};
