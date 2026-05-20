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

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_BALANCE = 125000;
const MOCK_PAYMENT_LINK = "https://pay.webtray.co/precious-store";
const MOCK_VIRTUAL_ACCOUNT = {
  bankName: "Providus Bank",
  accountNumber: "9901234567",
  accountName: "Precious Store",
};

const MOCK_TRANSACTIONS = [
  {
    id: "TXN-001",
    date: "May 2, 2026",
    description: "Payment received from customer",
    reference: "REF-78291",
    type: "credit" as const,
    amount: 15000,
    status: "success" as const,
  },
  {
    id: "TXN-002",
    date: "Apr 30, 2026",
    description: "Withdrawal to bank account",
    reference: "REF-78105",
    type: "debit" as const,
    amount: 20000,
    status: "success" as const,
  },
  {
    id: "TXN-003",
    date: "Apr 28, 2026",
    description: "Payment received from customer",
    reference: "REF-77984",
    type: "credit" as const,
    amount: 8500,
    status: "success" as const,
  },
  {
    id: "TXN-004",
    date: "Apr 25, 2026",
    description: "Payment received from customer",
    reference: "REF-77821",
    type: "credit" as const,
    amount: 32000,
    status: "pending" as const,
  },
  {
    id: "TXN-005",
    date: "Apr 22, 2026",
    description: "Withdrawal to bank account",
    reference: "REF-77603",
    type: "debit" as const,
    amount: 10000,
    status: "failed" as const,
  },
  {
    id: "TXN-006",
    date: "Apr 20, 2026",
    description: "Payment received from customer",
    reference: "REF-77490",
    type: "credit" as const,
    amount: 5500,
    status: "success" as const,
  },
  {
    id: "TXN-007",
    date: "Apr 17, 2026",
    description: "Payment received from customer",
    reference: "REF-77301",
    type: "credit" as const,
    amount: 12000,
    status: "success" as const,
  },
  {
    id: "TXN-008",
    date: "Apr 15, 2026",
    description: "Withdrawal to bank account",
    reference: "REF-77120",
    type: "debit" as const,
    amount: 18000,
    status: "success" as const,
  },
];

const FILTER_OPTIONS = ["All", "Credit", "Debit", "Pending", "Failed"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
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
function StatusBadge({ status }: { status: "success" | "pending" | "failed" }) {
  const map = {
    success: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={cn(
        "px-2 py-1 rounded-full text-xs font-medium capitalize",
        map[status]
      )}
    >
      {status}
    </span>
  );
}

function BalanceCard() {
  const [visible, setVisible] = useState(true);

  return (
    <div className="bg-[#365BEB] rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <p className="text-blue-200 text-sm font-medium">Account Balance</p>
          <button
            onClick={() => setVisible((v) => !v)}
            className="text-blue-200 hover:text-white transition-colors"
          >
            {visible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-white text-[32px] md:text-[40px] font-bold leading-tight tracking-tight">
          {visible ? formatAmount(MOCK_BALANCE) : "₦ ••••••"}
        </p>
        <p className="text-blue-200 text-sm">Available balance</p>
      </div>

      <div className="flex flex-row md:flex-col gap-3 md:justify-center">
        <Button className="bg-white text-[#365BEB] hover:bg-blue-50 rounded-full px-6 font-semibold shadow-md gap-2 transition-all">
          <ArrowDownToLine className="w-4 h-4" />
          Fund Wallet
        </Button>
        <Button className="bg-blue-700 border border-blue-400/40 text-white hover:bg-blue-800 rounded-full px-6 font-semibold shadow-md gap-2 transition-all">
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

function VirtualAccountCard() {
  const { accountNumber, accountName, bankName } = MOCK_VIRTUAL_ACCOUNT;
  const details = `Bank: ${bankName}\nAccount Number: ${accountNumber}\nAccount Name: ${accountName}`;
  const { copied, copy } = useCopy(details, "Account details");

  return (
    <Card className="rounded-[24px] border border-gray-200 shadow-sm flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-[16px] font-bold text-[#111827]">
          Virtual Account
        </CardTitle>
        <p className="text-sm text-[#808080]">
          Customers can transfer directly to this account number.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm text-[#808080]">Bank Name</span>
            <span className="text-sm font-semibold text-[#111827]">
              {bankName}
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm text-[#808080]">Account Number</span>
            <span className="text-[16px] font-bold text-[#111827] tracking-widest">
              {accountNumber}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-sm text-[#808080]">Account Name</span>
            <span className="text-sm font-semibold text-[#111827]">
              {accountName}
            </span>
          </div>
        </div>
        <Button
          onClick={copy}
          variant="outline"
          className="w-full rounded-full border-gray-300 text-[#4D4D4D] hover:bg-gray-50 gap-2 transition-all"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          {copied ? "Copied!" : "Copy Account Details"}
        </Button>
      </CardContent>
    </Card>
  );
}

function TransactionHistory() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = MOCK_TRANSACTIONS.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.reference.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Credit" && tx.type === "credit") ||
      (filter === "Debit" && tx.type === "debit") ||
      (filter === "Pending" && tx.status === "pending") ||
      (filter === "Failed" && tx.status === "failed");

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
            {filtered.length === 0 ? (
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
                    {tx.date}
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
                      tx.type === "credit"
                        ? "text-green-600"
                        : "text-[#111827]"
                    )}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {formatAmount(tx.amount)}
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
  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 w-full">
      <BalanceCard />

      <div className="flex flex-col md:flex-row gap-6">
        <PaymentLinkCard />
        <VirtualAccountCard />
      </div>

      <TransactionHistory />
    </div>
  );
}
