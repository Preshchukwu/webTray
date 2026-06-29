import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { ApiResponse } from "@/types";
import type { Invoice, PayInvoiceResponse, VerifyInvoiceResponse } from "@/types";

export type { Invoice, PayInvoiceResponse, VerifyInvoiceResponse };

export const invoiceKeys = {
  all: ["invoice"] as const,
  bySlug: (slug: string) => [...invoiceKeys.all, "slug", slug] as const,
};

export const useInvoice = (slug: string) => {
  const invoiceQuery = useQuery({
    queryKey: invoiceKeys.bySlug(slug),
    queryFn: async (): Promise<Invoice> => {
      const { data } = await api.get<ApiResponse<Invoice>>(
        `/wallet/invoices/${slug}`
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to load invoice");
    },
    enabled: !!slug,
    retry: false,
  });

  const payInvoiceMutation = useMutation({
    mutationFn: async ({
      invoiceId,
      storeId,
      callbackUrl,
    }: {
      invoiceId: number | string;
      storeId: number | string;
      callbackUrl?: string;
    }): Promise<PayInvoiceResponse> => {
      const { data } = await api.post<ApiResponse<PayInvoiceResponse>>(
        `/wallet/${storeId}/invoices/${invoiceId}/pay`,
        { callbackUrl }
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to initialize payment");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process payment");
    },
  });

  const verifyInvoiceMutation = useMutation({
    mutationFn: async (reference: string): Promise<VerifyInvoiceResponse> => {
      const { data } = await api.get<ApiResponse<VerifyInvoiceResponse>>(
        `/wallet/invoices/verify/${reference}`
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to verify payment");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify payment");
    },
  });

  return {
    invoice: invoiceQuery.data,
    isLoadingInvoice: invoiceQuery.isLoading,
    invoiceError: invoiceQuery.error,
    refetchInvoice: invoiceQuery.refetch,

    payInvoice: payInvoiceMutation.mutateAsync,
    isPayingInvoice: payInvoiceMutation.isPending,

    verifyInvoice: verifyInvoiceMutation.mutateAsync,
    isVerifyingInvoice: verifyInvoiceMutation.isPending,
  };
};
