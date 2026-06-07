"use client";

import React, { useState } from "react";
import {
  Check,
  Plus,
  Trash2,
  Pencil,
  FileText,
  Link as LinkIcon,
  ArrowUpFromLine,
  Eye,
  EyeOff,
  Search,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import type { Invoice, InvoiceItem } from "@/types";
import { formatCurrency } from "@/lib/format-currency";
import { Skeleton } from "@/components/ui/skeleton";
import { WithdrawalBankAccounts } from "./withdrawal-bank-accounts";
import WalletPageSkeleton from "@/components/wallet-page-skeleton";
import { PageHeader } from "@/components/page-header";
import { useAuthStore } from "@/store/useAuthStore";
import { HasBusinessAlert } from "@/components/hasBusinessAlert";
import { RequestWithdrawalModal } from "./request-withdrawal-modal";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatAmount(amount: number) {
  return formatCurrency(amount);
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


// ─── Status badges ────────────────────────────────────────────────────────────
function InvoiceStatusBadge({ status }: { status: string }) {
  const normalizedStatus = status?.toLowerCase() || "";
  const map: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    overdue: "bg-red-100 text-red-700",
  };
  const className = map[normalizedStatus] || "bg-gray-100 text-gray-700";
  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", className)}>
      {status}
    </span>
  );
}

const FILTER_OPTIONS = ["All", "Credit", "Debit", "Pending", "Failed"];

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

// ─── Balance Card ─────────────────────────────────────────────────────────────

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
    <div className="bg-[#365BEB] my-6 rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <p className="text-blue-200 text-sm font-medium">Account Balance</p>
          <button
            onClick={() => setVisible((v) => !v)}
            className="text-blue-200 hover:text-white transition-colors"
            disabled={isLoading}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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

// ─── Invoice Section ──────────────────────────────────────────────────────────
const EMPTY_ITEM: InvoiceItem = { name: "", quantity: 1, price: 0 };

function InvoiceSection() {
  const { invoices: invoicesData, isFetchingInvoices, createInvoice, isCreatingInvoice } = useWallet();
  const invoices = invoicesData?.data || [];

  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [formCustomerName, setFormCustomerName] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formItems, setFormItems] = useState<InvoiceItem[]>([{ ...EMPTY_ITEM }]);

  const formTotal = formItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  function openCreate() {
    setFormCustomerName("");
    setFormDueDate("");
    setFormItems([{ ...EMPTY_ITEM }]);
    setShowModal(true);
  }

  function addItem() {
    setFormItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(idx: number) {
    setFormItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateItem(idx: number, field: keyof InvoiceItem, value: string | number) {
    setFormItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  }

  async function handleSave() {
    if (!formCustomerName.trim()) {
      toast.error("Customer name is required.");
      return;
    }
    if (!formDueDate) {
      toast.error("Due date is required.");
      return;
    }
    if (formItems.some((item) => !item.name.trim() || item.price <= 0)) {
      toast.error("Each item needs a name and a price greater than zero.");
      return;
    }

    try {
      await createInvoice({
        customerName: formCustomerName,
        dueDate: new Date(formDueDate).toISOString().split('T')[0],
        items: formItems.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
      });
      setShowModal(false);
    } catch (error) {
      // Error handled by hook toast
    }
  }

  function copyLink(invoice: Invoice) {
    const link = `${window.location.origin}/invoice/${invoice.slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId(invoice.id);
    toast.success("Invoice link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <>
      <Card className="rounded-[24px] border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-[16px] font-bold text-[#111827] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#365BEB]" />
                Invoices
              </CardTitle>
              <p className="text-sm text-[#808080]">
                Create and share payment invoices with your customers.
              </p>
            </div>
            <Button
              onClick={openCreate}
              className="bg-[#365BEB] hover:bg-[#365BEB]/90 text-white rounded-full gap-2 px-5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isFetchingInvoices ? (
            <div className="py-14 text-center flex flex-col items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <p className="text-sm text-[#808080]">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-14 text-center flex flex-col items-center gap-3">
              <FileText className="w-10 h-10 text-gray-300" />
              <p className="text-sm text-[#808080]">No invoices yet. Create your first one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-sm font-medium text-gray-400 text-left pr-4">Invoice</th>
                    <th className="pb-3 text-sm font-medium text-gray-400 text-left pr-4">Customer</th>
                    <th className="pb-3 text-sm font-medium text-gray-400 text-left pr-4">Amount</th>
                    <th className="pb-3 text-sm font-medium text-gray-400 text-left pr-4">Due Date</th>
                    <th className="pb-3 text-sm font-medium text-gray-400 text-left pr-4">Status</th>
                    <th className="pb-3 text-sm font-medium text-gray-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 pr-4 text-sm font-semibold text-[#365BEB]">{inv.invoiceNumber}</td>
                      <td className="py-4 pr-4 text-sm text-[#111827]">{inv.customerName}</td>
                      <td className="py-4 pr-4 text-sm font-semibold text-[#111827]">
                        {formatAmount(Number(inv.totalAmount))}
                      </td>
                      <td className="py-4 pr-4 text-sm text-[#4D4D4D] whitespace-nowrap">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="py-4 pr-4">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full h-8 px-3 text-xs border-gray-200 text-[#4D4D4D] gap-1.5"
                            onClick={() => copyLink(inv)}
                          >
                            {copiedId === inv.id ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <LinkIcon className="w-3.5 h-3.5" />
                            )}
                            {copiedId === inv.id ? "Copied" : "Copy Link"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <DialogContent className="sm:max-w-[560px] rounded-[24px] p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="text-[#111827] font-bold text-xl">
              Create Invoice
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 flex flex-col gap-5 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-[#4D4D4D]">Customer Name</Label>
              <Input
                placeholder="e.g. Adaeze Obi"
                value={formCustomerName}
                onChange={(e) => setFormCustomerName(e.target.value)}
                className="rounded-xl border-gray-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-[#4D4D4D]">Due Date</Label>
              <Input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="rounded-xl border-gray-200"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-sm font-medium text-[#4D4D4D]">Items</Label>
              <div className="flex gap-2 px-1">
                <span className="text-xs text-gray-400 flex-[2]">Item name</span>
                <span className="text-xs text-gray-400 w-14 text-center">Qty</span>
                <span className="text-xs text-gray-400 flex-1 text-right pr-2">Price (₦)</span>
              </div>
              {formItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                    className="rounded-xl border-gray-200 flex-[2]"
                  />
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="rounded-xl border-gray-200 w-14 text-center"
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={item.price || ""}
                    onChange={(e) => updateItem(idx, "price", parseFloat(e.target.value) || 0)}
                    className="rounded-xl border-gray-200 flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "h-9 w-9 p-0 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 shrink-0",
                      formItems.length === 1 && "invisible"
                    )}
                    onClick={() => removeItem(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-gray-200 text-[#4D4D4D] gap-2 w-fit text-sm h-8 px-4"
                onClick={addItem}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </Button>
            </div>

            <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-sm font-medium text-[#4D4D4D]">Total</span>
              <span className="text-lg font-bold text-[#111827]">{formatAmount(formTotal)}</span>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-gray-100 flex gap-3 sm:gap-3">
            <Button
              variant="outline"
              className="rounded-full border-gray-200 text-[#4D4D4D] flex-1"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#365BEB] hover:bg-[#365BEB]/90 text-white rounded-full flex-1"
              onClick={handleSave}
              disabled={isCreatingInvoice}
            >
              {isCreatingInvoice ? "Creating..." : "Create & Get Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


// ─── Transaction History ──────────────────────────────────────────────────────
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
    <div className="bg-white my-6 rounded-[24px] border border-gray-200 shadow-sm p-6 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-[18px] font-bold text-[#111827]">Transaction History</h2>
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
                  className={cn("cursor-pointer", filter === opt && "font-semibold text-[#365BEB]")}
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
              <th className="pb-3 text-sm font-medium text-gray-400 pr-4">Date</th>
              <th className="pb-3 text-sm font-medium text-gray-400 pr-4">Description</th>
              <th className="pb-3 text-sm font-medium text-gray-400 pr-4">Reference</th>
              <th className="pb-3 text-sm font-medium text-gray-400 pr-4 text-right">Amount</th>
              <th className="pb-3 text-sm font-medium text-gray-400 text-right">Status</th>
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
                <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
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
                    <StatusBadge status={tx.status as WalletTransactionStatus} />
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

  if (!user?.business) {
    return (
      <div>
        <PageHeader
          title="Wallet"
          subtitle="View your account balance, transaction history and manage withdrawal bank accounts."
        />
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
    <div className="flex flex-col gap-6 py-4 md:py-6 max-w-6xl w-full">
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


      <div className="flex flex-col gap-6">
        <WithdrawalBankAccounts
          className="w-full"
          addDialogOpen={addBankDialogOpen}
          onAddDialogOpenChange={setAddBankDialogOpen}
        />
        <InvoiceSection />
      </div>

      <TransactionHistory />

      <RequestWithdrawalModal
        open={withdrawalDialogOpen}
        onOpenChange={setWithdrawalDialogOpen}
        currentBalance={balance}
      />
    </div>
  );
}
