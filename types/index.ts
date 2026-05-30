import { ReactNode } from "react";

export interface User {
  id: number;
  email: string;
  phone: string;
  fullname: string;
  status: string | null;
  password: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
  business?: Business | null;
  store?: Store | null;
}

export interface RegisterPayload {
  fullname: string;
  phone: string;
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  otp: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ApiResponse<T> {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody: T;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  storeId: number;
  name: string;
  description: string;
}

export interface Store {
  id: number;
  businessId: number;
  storeName: string | null;
  slogan: string | null;
  slug?: string | null;
  description: string | null;
  customDomain: string | null;
  logoUrl?: string | null;
  phone: string;
  paymentMethods: {
    card: boolean;
    cash: boolean;
    [key: string]: unknown;
  } | null;
  deliveryOptions: {
    pickup: boolean;
    delivery: boolean;
    [key: string]: unknown;
  } | null;
  status?: string | null;
  online?: boolean;
  isDeleted?: boolean;
  currency?: string | null;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: number;
  userId: number;
  bussinessName: string;
  businessType: string;
  description: string;
  category: {
    main: string;
  };
  address: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  store: Store[];
}

export interface DashboardSummary {
  totalRevenue: number;
  noOfOrders: number;
  noOfProducts: number;
  noOfCustomers: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders: any[]; // You can type this more specifically based on your Order type
}
export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
  product?: {
    name: string;
    price: string;
  };
};

// @/types/index.ts
export interface Customer {
  id: number;
  fullname: string;
  phone: string;
  email: string;
  address: string | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive";
}

export type Order = {
  // Original API fields
  id: number;
  storeId: number;
  customerId: number;
  status: "pending" | "shipped" | "cancel" | "completed" | "paid" | string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  customer: Customer | null;
  orderItems: OrderItem[];
  isOnline: boolean;

  // Formatted fields for UI compatibility
  orderId?: number;
  customerName?: string;
  customerEmail?: string;
  date?: string;
  items?: OrderItem[];
  total?: number;
};

// customerId: 2
// id: 2
// orderItems: Array [ {…} ]
// status: "pending"
// storeId: 13
// totalAmount: "100000"
// updatedAt: "2025-07-03T04:41:01.084Z"

export interface OrderSummary {
  totalNumberOfLowStockItems: number;
  totalNumberOfOrders: number;
  totalNumberOfPendingOrders: number;
  totalSales: number;
}
export interface CustomerSummary {
  totalCustomer: number;
  newCustomer: number;
  retentionRate: number;
  topSpenders: {
    name: string;
    totalSpent: number;
  };
}

export interface CreateRegistrationPayload {
  businessName: string;
  description: string;
  businessType: string;
  category: {
    main: string;
  };
  address: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  status: string;
  storeName: string;
  slogan: string;
  phone: string;
  customeDomain: string;
  storeCategory: string;
  currency: string;
  paymentMethods: {
    paystack: boolean;
    bankTransfer: boolean;
    cashOnDelivery?: boolean;
  };
  deliveryOptions: {
    inHouse: boolean;
    thirdParty: string[];
  };
}

export interface Register {
  message: string;
  status: number;
  data: {
    businessId: string;
  };
}

export interface ProductImages {
  main: string;
  thumbnail: string;
}

export interface ProductImage {
  url: string;
}

export interface CreateProductPayload {
  storeId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
}
export interface UpdateProductPayload {
  id: number;
  name?: string;
  price?: number;
  quantity?: number;
  description?: string;
  // categoryId?: string; // Add this if your API supports category updates
}
export interface Product {
  id: number;
  storeId: number;
  categoryId: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InventorySummary {
  noOfProducts: number;
  noOfLowStocksItems: number;
  totalValueOfProducts: number;
  noOfCategories: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  products: any[];
}

export interface EditForm {
  name?: string;
  description?: string;
  quantity?: number;
  price?: number;
  categoryId?: number;
}

export interface StatCardProps {
  title: string;
  icon: ReactNode;
  value: string | number;
  note: string;
  noteColor?: string;
  action?: ReactNode;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

// Types
export interface StoreFrontSummary {
  numberOfProducts: number;
  numberOfCategories: number;
  numberOfCustomers: number;
}

export interface StoreProduct {
  id: number;
  storeId: number;
  categoryId: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
   images?:  string[];
  visible: boolean;
  feature: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionLimits {
  maxProducts: number;
  hasCustomDomain: boolean;
  hasInventoryManagement: boolean;
  analyticsLevel: string;
  supportLevel: string;
}

export interface SubscriptionInfo {
  tier: "STARTER" | "GROWTH" | "BUSINESS";
  status: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  expiryDate: string;
  daysLeft: number;
  limits: SubscriptionLimits;
}

export interface PricingPlan {
  id: number;
  name: string;
  price: string;
  slashedPrice?: string;
  duration: string;
  description: string;
  features: string[];
  tier: "STARTER" | "GROWTH" | "BUSINESS";
  isFreeTrialAllowed: boolean;
  trialDays: number;
  maxProducts: number;
  hasCustomDomain: boolean;
  hasInventoryManagement: boolean;
  analyticsLevel: string;
  supportLevel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface SubscribePayload {
  businessId: number;
  tier: "STARTER" | "GROWTH" | "BUSINESS";
  callback_url: string;
  coupon_code?: string;
}

export interface SubscribeResponse {
  authorization_url: string;
  reference: string;
}

export interface VerifySubscriptionResponse {
  status: "SUCCESS" | "FAILED" | "PENDING";
}

export interface PaymentHistory {
  id: number;
  businessId: number;
  amount: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  reference: string;
  tier: "STARTER" | "GROWTH" | "BUSINESS";
  createdAt: string;
  updatedAt: string;
  paymentDetails?: {
    channel: string;
    currency: string;
    gateway_response: string;
    paidAt: string;
  };
}

export interface CancelSubscriptionResponse {
  status: "CANCELLED";
  message: string;
}

// Wallet Types
export interface WalletBalance {
  id: number;
  storeId: number;
  balance: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export type WalletTransactionType = "CREDIT" | "DEBIT";
export type WalletTransactionStatus = "SUCCESS" | "PENDING" | "FAILED";

export interface WalletTransaction {
  id: number;
  walletId: number;
  type: WalletTransactionType;
  amount: string;
  status: WalletTransactionStatus;
  reference: string;
  description: string;
  bankCode: string | null;
  accountNumber: string | null;
  accountName: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface WalletBankApi {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode?: string;
  active?: boolean;
  country?: string;
  currency?: string;
  type?: string;
  gateway?: string | null;
  pay_with_bank?: boolean;
  supports_transfer?: boolean;
  available_for_direct_debit?: boolean;
  is_deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletBank extends WalletBankApi {
  bankCode: string;
}

export interface WalletBankAccount {
  id: number;
  walletId?: number;
  storeId?: number;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface ValidateAccountPayload {
  accountNumber: string;
  bankCode: string;
}

export interface ValidatedAccount {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  bankId?: number;
}

export interface ValidatedAccountApi {
  account_number?: string;
  account_name?: string;
  bank_id?: number;
  accountNumber?: string;
  accountName?: string;
  bankCode?: string;
  code?: string;
  bank_name?: string;
}

export interface AddBankAccountPayload {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
}

export interface DeleteBankAccountResponse {
  message: string;
}

export interface RequestWithdrawalPayload {
  amount: number;
  bankAccountId: number;
}

export interface WithdrawalResponseBody {
  updatedWallet: WalletBalance;
  transaction: WalletTransaction;
}

export interface WithdrawalResponse {
  updatedWallet: WalletBalance;
  transaction: WalletTransaction;
}

export interface InvoiceItemPayload {
  name: string;
  quantity: number;
  price: number;
}

export interface CreateInvoicePayload {
  customerName: string;
  dueDate: string;
  items: InvoiceItemPayload[];
}

export interface InvoiceItem {
  name: string;
  price: number;
  quantity: number;
}

export interface InvoiceStore {
  id: number;
  storeName: string | null;
  logoUrl: string | null;
  email: string | null;
  phone: string | null;
  currency: string;
}

export interface Invoice {
  id: number;
  storeId: number;
  invoiceNumber: string;
  customerName: string;
  dueDate: string;
  items: InvoiceItem[];
  totalAmount: string;
  status: string;
  slug: string;
  paystackPageId: string | null;
  paystackUrl: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  store: InvoiceStore;
}

export interface InvoicesMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetInvoicesResponse {
  data: Invoice[];
  meta: InvoicesMeta;
}

export interface PayInvoiceResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}
