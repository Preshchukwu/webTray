"use client";

import React, { useState } from "react";
import {
  Copy,
  Share2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Eye,
  EyeOff,
  Check,
  Search,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useWallet,
  type WalletTransactionStatus,
} from "@/hooks/use-wallet";
import { formatCurrency } from "@/lib/format-currency";
import { Skeleton } from "@/components/ui/skeleton";
import { WithdrawalBankAccounts } from "./withdrawal-bank-accounts";
import WalletPageSkeleton from "@/components/wallet-page-skeleton";
import { PageHeader } from "@/components/page-header";
import { useAuthStore } from "@/store/useAuthStore";
import { HasBusinessAlert } from "@/components/hasBusinessAlert";
import { RequestWithdrawalModal } from "./request-withdrawal-modal";

// ─── Mock data (payment link — API pending) ───
const MOCK_PAYMENT_LINK = "https://pay.webtray.co/precious-store";

const FILTER_OPTIONS = ["All", "Credit", "Debit", "Pending", "Failed"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatAmount(amount: number) {
  return formatCurrency(amount);
}

function useCopy(value: string, label: string) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return { copied, copy };
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: WalletTransactionStatus }) {
  const map: Record<WalletTransactionStatus, string> = {
    SUCCESS: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    FAILED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium capitalize",
        map[status]
      )}
    >
      {status.toLowerCase()}
    </span>
  );
}

function formatTransactionDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BalanceCard({
  balance,
  isLoading,
  hasError,
  onWithdraw,
}: {
  balance: number;
  isLoading: boolean;
  hasError: boolean;
  onWithdraw?: () => void;
}) {
  const [visible, setVisible] = useState(true);

  return (
    <div className="bg-[#365BEB] rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <p className="text-blue-200 text-sm font-medium">Account Balance</p>
          <button
            onClick={() => setVisible((v) => !v)}
            className="text-blue-200 hover:text-white transition-colors"
            disabled={isLoading}
          >
            {visible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {isLoading ? (
          <Skeleton className="h-10 w-48 bg-white/20" />
        ) : (
          <p className="text-white text-[32px] md:text-[40px] font-bold leading-tight tracking-tight">
            {visible ? formatCurrency(balance) : "₦ ••••••"}
          </p>
        )}
        <p className="text-blue-200 text-sm">
          {hasError ? "Could not load balance" : "Available balance"}
        </p>
      </div>

      <div className="flex flex-row md:flex-col gap-3 md:justify-center">
        <Button
          type="button"
          onClick={onWithdraw}
          className="bg-blue-700 border border-blue-400/40 text-white hover:bg-blue-800 rounded-full px-6 font-semibold shadow-md gap-2 transition-all"
        >
          <ArrowUpFromLine className="w-4 h-4" />
          Withdraw
        </Button>
      </div>
    </div>
  );
}

function PaymentLinkCard() {
  const { copied, copy } = useCopy(MOCK_PAYMENT_LINK, "Payment link");

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Pay me on Webtray",
        url: MOCK_PAYMENT_LINK,
      });
    } else {
      copy();
    }
  };

  return (
    <Card className="rounded-[24px] border border-gray-200 shadow-sm flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-[16px] font-bold text-[#111827]">
          Payment Link
        </CardTitle>
        <p className="text-sm text-[#808080]">
          Share this link to receive payments from customers.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
          <p className="text-sm text-[#4D4D4D] truncate flex-1">
            {MOCK_PAYMENT_LINK}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={copy}
            variant="outline"
            className="flex-1 rounded-full border-gray-300 text-[#4D4D4D] hover:bg-gray-50 gap-2 transition-all"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1 rounded-full bg-[#365BEB] text-white hover:bg-blue-700 gap-2 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionHistory() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const {
    transactions,
    isFetchingTransactions,
    transactionsError,
  } = useWallet();

  const filtered = (transactions ?? []).filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.reference.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Credit" && tx.type === "CREDIT") ||
      (filter === "Debit" && tx.type === "DEBIT") ||
      (filter === "Pending" && tx.status === "PENDING") ||
      (filter === "Failed" && tx.status === "FAILED");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[18px] font-bold text-[#111827]">
          Transaction History
        </h2>
        <div className="flex gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full border-gray-200 text-sm w-full sm:w-[220px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full border-gray-300 text-[#4D4D4D] gap-2 whitespace-nowrap"
              >
                {filter}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {FILTER_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={cn(
                    "cursor-pointer",
                    filter === opt && "font-semibold text-[#365BEB]"
                  )}
                >
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-100">
              <th className="pb-3 text-sm font-medium text-gray-400 pr-4">
                Date
              </th>
              <th className="pb-3 text-sm font-medium text-gray-400 pr-4">
                Description
              </th>
              <th className="pb-3 text-sm font-medium text-gray-400 pr-4">
                Reference
              </th>
              <th className="pb-3 text-sm font-medium text-gray-400 pr-4 text-right">
                Amount
              </th>
              <th className="pb-3 text-sm font-medium text-gray-400 text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {isFetchingTransactions ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td colSpan={5} className="py-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : transactionsError ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-sm text-red-500"
                >
                  Could not load transactions. Please try again.
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 pr-4 text-sm text-[#4D4D4D] whitespace-nowrap">
                    {formatTransactionDate(tx.createdAt)}
                  </td>
                  <td className="py-4 pr-4 text-sm text-[#111827]">
                    {tx.description}
                  </td>
                  <td className="py-4 pr-4 text-sm text-[#808080] whitespace-nowrap">
                    {tx.reference}
                  </td>
                  <td
                    className={cn(
                      "py-4 pr-4 text-sm font-semibold text-right whitespace-nowrap",
                      tx.type === "CREDIT"
                        ? "text-green-600"
                        : "text-[#111827]"
                    )}
                  >
                    {tx.type === "CREDIT" ? "+" : "-"}
                    {formatAmount(Number(tx.amount))}
                  </td>
                  <td className="py-4 text-right">
                    <StatusBadge status={tx.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function WalletClient() {
  const { user } = useAuthStore();
  const {
    walletBalance,
    isFetchingBalance,
    balanceError,
    isFetchingTransactions,
    isFetchingBankAccounts,
  } = useWallet();
  const balance = Number(walletBalance?.balance ?? 0);
  const [addBankDialogOpen, setAddBankDialogOpen] = useState(false);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);

  // Guard: Show empty state if no business
  if (!user?.business) {
    return (
      <div>
        <PageHeader
          title="Wallet"
          subtitle="View your account balance, transaction history and manage withdrawal bank accounts."
        />
        {/* <HasBusinessAlert /> */}
        <Card className="shadow-none rounded-none mt-6">
          <CardHeader className="text-center leading-[24px]">
            <CardTitle className="text-[#4D4D4D] font-bold text-[20px]">
              Wallet Not Available
            </CardTitle>
            <CardContent className="pt-4 text-center">
              <p className="text-[#808080] text-sm mb-4">
                You need to complete your business setup to access your wallet and manage payments.
              </p>
              <Button
                asChild
                className="bg-[#365BEB] text-white hover:bg-[#365BEB]/90 rounded-full"
              >
                <Link href="/register-business">Start Setup</Link>
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>

      <PageHeader
        title="Wallet"
        subtitle="View your account balance, transaction history and manage withdrawal bank accounts."
      />

      {isFetchingBalance ? (
        <div className="bg-[#365BEB]/10 my-6 rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 animate-pulse">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-28 bg-white/20" />
            <Skeleton className="h-10 w-48 bg-white/20" />
            <Skeleton className="h-4 w-32 bg-white/20" />
          </div>
          <div className="flex flex-row md:flex-col gap-3 md:justify-center">
            <Skeleton className="h-10 w-32 rounded-full bg-white/20" />
            <Skeleton className="h-10 w-32 rounded-full bg-white/20" />
          </div>
        </div>
      ) : (
        <BalanceCard
          balance={balance}
          isLoading={isFetchingBalance}
          hasError={!!balanceError}
          onWithdraw={() => setWithdrawalDialogOpen(true)}
        />
      )}


      <div className="flex flex-col md:flex-row gap-6">
        <PaymentLinkCard />
        <WithdrawalBankAccounts
          className="flex-1 min-w-0"
          addDialogOpen={addBankDialogOpen}
          onAddDialogOpenChange={setAddBankDialogOpen}
        />
      </div>

      <TransactionHistory />

      <RequestWithdrawalModal
        open={withdrawalDialogOpen}
        onOpenChange={setWithdrawalDialogOpen}
        currentBalance={balance}
      />
    </>
  );
}
