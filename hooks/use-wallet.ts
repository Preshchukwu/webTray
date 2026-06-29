import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { ApiResponse } from "@/types";
import type {
  WalletBalance,
  WalletTransaction,
  WalletBank,
  WalletBankApi,
  WalletBankAccount,
  ValidateAccountPayload,
  ValidatedAccount,
  ValidatedAccountApi,
  AddBankAccountPayload,
  DeleteBankAccountResponse,
  RequestWithdrawalPayload,
  WithdrawalResponse,
  CreateInvoicePayload,
  Invoice,
  GetInvoicesResponse,
  PayInvoiceResponse,
} from "@/types";

export type {
  WalletBalance,
  WalletTransactionType,
  WalletTransactionStatus,
  WalletTransaction,
  WalletBankApi,
  WalletBank,
  WalletBankAccount,
  ValidateAccountPayload,
  ValidatedAccount,
  ValidatedAccountApi,
  AddBankAccountPayload,
  DeleteBankAccountResponse,
  RequestWithdrawalPayload,
  WithdrawalResponse,
  CreateInvoicePayload,
  Invoice,
  GetInvoicesResponse,
  PayInvoiceResponse,
} from "@/types";

export const walletKeys = {
  all: ["wallet"] as const,
  balance: (storeId: number | string | undefined) =>
    [...walletKeys.all, "balance", storeId] as const,
  transactions: (storeId: number | string | undefined) =>
    [...walletKeys.all, "transactions", storeId] as const,
  banks: () => [...walletKeys.all, "banks"] as const,
  bankAccounts: (storeId: number | string | undefined) =>
    [...walletKeys.all, "bank-accounts", storeId] as const,
  invoices: (storeId: number | string | undefined) =>
    [...walletKeys.all, "invoices", storeId] as const,
};

function parseListBody<T>(
  body: T[] | { banks?: T[]; bankAccounts?: T[] } | null | undefined
): T[] {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.banks)) return body.banks;
  if (Array.isArray(body.bankAccounts)) return body.bankAccounts;
  return [];
}

function normalizeWalletBank(bank: WalletBankApi): WalletBank {
  return {
    ...bank,
    bankCode: bank.code,
  };
}

function normalizeValidatedAccount(
  body: ValidatedAccountApi,
  request: ValidateAccountPayload
): ValidatedAccount {
  const bankCode = body.bankCode ?? body.code ?? request.bankCode;
  return {
    accountName: body.account_name ?? body.accountName ?? "",
    accountNumber: String(body.account_number ?? body.accountNumber ?? request.accountNumber),
    bankCode: String(bankCode),
    bankId: body.bank_id,
  };
}

export const useWallet = () => {
  const { activeStore } = useAuthStore();
  const queryClient = useQueryClient();
  const storeId = activeStore?.id;

  const invalidateBankAccounts = () => {
    if (storeId !== undefined) {
      queryClient.invalidateQueries({
        queryKey: walletKeys.bankAccounts(storeId),
      });
    }
  };

  const balanceQuery = useQuery({
    queryKey: walletKeys.balance(storeId),
    queryFn: async (): Promise<WalletBalance> => {
      const { data } = await api.get<ApiResponse<WalletBalance>>(
        `/wallet/${storeId}/balance`
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to fetch wallet balance");
    },
    enabled: !!storeId,
  });

  const transactionsQuery = useQuery({
    queryKey: walletKeys.transactions(storeId),
    queryFn: async (): Promise<WalletTransaction[]> => {
      const { data } = await api.get<ApiResponse<WalletTransaction[]>>(
        `/wallet/${storeId}/transactions`
      );
      if (data?.responseSuccessful) {
        return data.responseBody ?? [];
      }
      throw new Error(
        data?.responseMessage || "Failed to fetch wallet transactions"
      );
    },
    enabled: !!storeId,
  });

  const banksQuery = useQuery({
    queryKey: walletKeys.banks(),
    queryFn: async (): Promise<WalletBank[]> => {
      const { data } = await api.get<ApiResponse<WalletBankApi[]>>(
        "/wallet/banks"
      );
      if (data?.responseSuccessful) {
        return parseListBody(data.responseBody).map(normalizeWalletBank);
      }
      throw new Error(data?.responseMessage || "Failed to fetch banks");
    },
    staleTime: 1000 * 60 * 60,
  });

  const bankAccountsQuery = useQuery({
    queryKey: walletKeys.bankAccounts(storeId),
    queryFn: async (): Promise<WalletBankAccount[]> => {
      const { data } = await api.get<
        ApiResponse<WalletBankAccount[] | { bankAccounts: WalletBankAccount[] }>
      >(`/wallet/${storeId}/bank-accounts`);
      if (data?.responseSuccessful) {
        return parseListBody(data.responseBody);
      }
      throw new Error(
        data?.responseMessage || "Failed to fetch bank accounts"
      );
    },
    enabled: !!storeId,
  });

  const validateAccountMutation = useMutation({
    mutationFn: async (
      payload: ValidateAccountPayload
    ): Promise<ValidatedAccount> => {
      const body = {
        accountNumber: payload.accountNumber,
        bankCode: payload.bankCode,
      };
      const { data } = await api.post<ApiResponse<ValidatedAccountApi>>(
        "/wallet/validate-account",
        body
      );
      if (data?.responseSuccessful) {
        return normalizeValidatedAccount(data.responseBody, payload);
      }
      throw new Error(data?.responseMessage || "Failed to validate account");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to validate account");
    },
  });

  const addBankAccountMutation = useMutation({
    mutationFn: async (
      payload: AddBankAccountPayload
    ): Promise<WalletBankAccount> => {
      const bankCode = String(payload.bankCode ?? "").trim();
      const accountNumber = String(payload.accountNumber ?? "").trim();
      const bankName = String(payload.bankName ?? "").trim();
      const accountName = String(payload.accountName ?? "").trim();

      if (!bankCode) throw new Error("Bank code is required");
      if (!accountNumber) throw new Error("Account number is required");
      if (!bankName) throw new Error("Bank name is required");
      if (!accountName) throw new Error("Account name is required");

      const body = {
        accountNumber,
        bankCode,
        bankName,
        accountName,
      };

      const { data } = await api.post<
        ApiResponse<WalletBankAccount | { bankAccount: WalletBankAccount }>
      >(`/wallet/${storeId}/bank-accounts`, body);

      if (data?.responseSuccessful) {
        const responseBody = data.responseBody;
        if (
          responseBody &&
          typeof responseBody === "object" &&
          "bankAccount" in responseBody &&
          responseBody.bankAccount
        ) {
          return responseBody.bankAccount;
        }
        return responseBody as WalletBankAccount;
      }
      throw new Error(data?.responseMessage || "Failed to add bank account");
    },
    onSuccess: () => {
      toast.success("Withdrawal account added");
      invalidateBankAccounts();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add bank account");
    },
  });

  const deleteBankAccountMutation = useMutation({
    mutationFn: async (bankAccountId: number): Promise<void> => {
      const { data } = await api.delete<ApiResponse<DeleteBankAccountResponse>>(
        `/wallet/${storeId}/bank-accounts/${bankAccountId}`
      );
      if (!data?.responseSuccessful) {
        throw new Error(
          data?.responseMessage || "Failed to delete bank account"
        );
      }
    },
    onSuccess: () => {
      toast.success("Bank account removed");
      invalidateBankAccounts();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete bank account");
    },
  });

  const requestWithdrawalMutation = useMutation({
    mutationFn: async (
      payload: RequestWithdrawalPayload
    ): Promise<WithdrawalResponse> => {
      const body = {
        amount: payload.amount,
        bankAccountId: payload.bankAccountId,
      };
      const { data } = await api.post<ApiResponse<WithdrawalResponse>>(
        `/wallet/${storeId}/withdrawals/request`,
        body
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to request withdrawal");
    },
    onSuccess: (responseData) => {
      toast.success("Withdrawal request submitted successfully");
      // Invalidate balance and transactions to refresh data
      if (storeId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: walletKeys.balance(storeId),
        });
        queryClient.invalidateQueries({
          queryKey: walletKeys.transactions(storeId),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to request withdrawal");
    },
  });

  const invoicesQuery = useQuery({
    queryKey: walletKeys.invoices(storeId),
    queryFn: async (): Promise<GetInvoicesResponse> => {
      const { data } = await api.get<ApiResponse<GetInvoicesResponse>>(
        `/wallet/${storeId}/invoices`
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to fetch invoices");
    },
    enabled: !!storeId,
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: CreateInvoicePayload): Promise<Invoice> => {
      const { data } = await api.post<ApiResponse<Invoice>>(
        `/wallet/${storeId}/invoices`,
        payload
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to create invoice");
    },
    onSuccess: () => {
      toast.success("Invoice created successfully");
      if (storeId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: walletKeys.invoices(storeId),
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create invoice");
    },
  });

  const payInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: number | string): Promise<PayInvoiceResponse> => {
      const { data } = await api.post<ApiResponse<PayInvoiceResponse>>(
        `/wallet/${storeId}/invoices/${invoiceId}/pay`
      );
      if (data?.responseSuccessful) {
        return data.responseBody;
      }
      throw new Error(data?.responseMessage || "Failed to initialize payment");
    },
    onSuccess: () => {
      toast.success("Payment initialized successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to initialize payment");
    },
  });

  return {
    walletBalance: balanceQuery.data,
    isFetchingBalance: balanceQuery.isLoading,
    isRefetchingBalance: balanceQuery.isFetching,
    balanceError: balanceQuery.error,
    refetchBalance: balanceQuery.refetch,

    transactions: transactionsQuery.data,
    isFetchingTransactions: transactionsQuery.isLoading,
    isRefetchingTransactions: transactionsQuery.isFetching,
    transactionsError: transactionsQuery.error,
    refetchTransactions: transactionsQuery.refetch,

    banks: banksQuery.data,
    isFetchingBanks: banksQuery.isLoading,
    banksError: banksQuery.error,

    bankAccounts: bankAccountsQuery.data,
    isFetchingBankAccounts: bankAccountsQuery.isLoading,
    bankAccountsError: bankAccountsQuery.error,
    refetchBankAccounts: bankAccountsQuery.refetch,

    validateAccount: validateAccountMutation.mutateAsync,
    isValidatingAccount: validateAccountMutation.isPending,
    resetValidation: validateAccountMutation.reset,

    addBankAccount: addBankAccountMutation.mutateAsync,
    isAddingBankAccount: addBankAccountMutation.isPending,

    deleteBankAccount: deleteBankAccountMutation.mutateAsync,
    isDeletingBankAccount: deleteBankAccountMutation.isPending,

    requestWithdrawal: requestWithdrawalMutation.mutateAsync,
    isRequestingWithdrawal: requestWithdrawalMutation.isPending,

    invoices: invoicesQuery.data,
    isFetchingInvoices: invoicesQuery.isLoading,
    invoicesError: invoicesQuery.error,
    refetchInvoices: invoicesQuery.refetch,

    createInvoice: createInvoiceMutation.mutateAsync,
    isCreatingInvoice: createInvoiceMutation.isPending,

    payInvoice: payInvoiceMutation.mutateAsync,
    isPayingInvoice: payInvoiceMutation.isPending,
  };
};
