"use client";

import React, { useState } from "react";
import {
  Copy,
  ArrowDownToLine,
  ArrowUpFromLine,
  Eye,
  EyeOff,
  Check,
  Search,
  ChevronDown,
  Plus,
  Trash2,
  Pencil,
  FileText,
  Building2,
  Link as LinkIcon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  customerName: string;
  items: InvoiceItem[];
  total: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  createdAt: string;
}

interface PayoutAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_BALANCE = 125000;

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "INV-001",
    customerName: "Adaeze Obi",
    items: [{ name: "Custom Dress", quantity: 1, price: 45000 }],
    total: 45000,
    dueDate: "2026-06-01",
    status: "pending",
    createdAt: "2026-05-10",
  },
  {
    id: "INV-002",
    customerName: "Emeka Chukwu",
    items: [
      { name: "Ankara Suit", quantity: 2, price: 35000 },
      { name: "Tie & Pocket Square", quantity: 1, price: 8000 },
    ],
    total: 78000,
    dueDate: "2026-05-25",
    status: "paid",
    createdAt: "2026-05-05",
  },
  {
    id: "INV-003",
    customerName: "Ngozi Eze",
    items: [{ name: "Bridal Outfit", quantity: 1, price: 120000 }],
    total: 120000,
    dueDate: "2026-05-15",
    status: "overdue",
    createdAt: "2026-04-30",
  },
];

const INITIAL_PAYOUT: PayoutAccount = {
  bankName: "Guaranty Trust Bank",
  accountNumber: "0123456789",
  accountName: "Precious Nwachukwu",
};

const NIGERIAN_BANKS = [
  "Access Bank",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Guaranty Trust Bank",
  "Heritage Bank",
  "Keystone Bank",
  "Kuda Bank",
  "Moniepoint",
  "OPay",
  "Palmpay",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "Union Bank",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

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
// ─── Mock data (payment link — API pending) ───
const MOCK_PAYMENT_LINK = "https://pay.webtray.co/precious-store";

const FILTER_OPTIONS = ["All", "Credit", "Debit", "Pending", "Failed"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatAmount(amount: number) {
  return formatCurrency(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function nextInvoiceId(invoices: Invoice[]) {
  const max = invoices.reduce((acc, inv) => {
    const num = parseInt(inv.id.replace("INV-", ""), 10);
    return Math.max(acc, isNaN(num) ? 0 : num);
  }, 0);
  return `INV-${String(max + 1).padStart(3, "0")}`;
}

// ─── Status badges ────────────────────────────────────────────────────────────
function InvoiceStatusBadge({ status }: { status: Invoice["status"] }) {
  const map: Record<Invoice["status"], string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    overdue: "bg-red-100 text-red-700",
  };
  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", map[status])}>
      {status}
    </span>
  );
}

function TxStatusBadge({ status }: { status: "success" | "pending" | "failed" }) {
  const map = {
    success: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", map[status])}>
      {status}
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
function BalanceCard() {
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
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formCustomerName, setFormCustomerName] = useState("");
  const [formDueDate, setFormDueDate] = useState("");
  const [formItems, setFormItems] = useState<InvoiceItem[]>([{ ...EMPTY_ITEM }]);

  const formTotal = formItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  function openCreate() {
    setEditingId(null);
    setFormCustomerName("");
    setFormDueDate("");
    setFormItems([{ ...EMPTY_ITEM }]);
    setShowModal(true);
  }

  function openEdit(invoice: Invoice) {
    setEditingId(invoice.id);
    setFormCustomerName(invoice.customerName);
    setFormDueDate(invoice.dueDate);
    setFormItems(invoice.items.map((i) => ({ ...i })));
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

  function handleSave() {
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

    const total = formItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const today = new Date().toISOString().split("T")[0];

    if (editingId) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === editingId
            ? { ...inv, customerName: formCustomerName, dueDate: formDueDate, items: formItems, total }
            : inv
        )
      );
      toast.success("Invoice updated.");
    } else {
      const newInvoice: Invoice = {
        id: nextInvoiceId(invoices),
        customerName: formCustomerName,
        items: formItems,
        total,
        dueDate: formDueDate,
        status: "pending",
        createdAt: today,
      };
      setInvoices((prev) => [newInvoice, ...prev]);
      toast.success("Invoice created!");
    }

    setShowModal(false);
  }

  function copyLink(invoice: Invoice) {
    const link = `${window.location.origin}/invoice/${invoice.id}`;
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
          {invoices.length === 0 ? (
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
                      <td className="py-4 pr-4 text-sm font-semibold text-[#365BEB]">{inv.id}</td>
                      <td className="py-4 pr-4 text-sm text-[#111827]">{inv.customerName}</td>
                      <td className="py-4 pr-4 text-sm font-semibold text-[#111827]">
                        {formatAmount(inv.total)}
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full h-8 w-8 p-0 text-[#808080] hover:text-[#365BEB] hover:bg-blue-50"
                            onClick={() => openEdit(inv)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
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

      {/* Create / Edit Modal */}
      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <DialogContent className="sm:max-w-[560px] rounded-[24px] p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="text-[#111827] font-bold text-xl">
              {editingId ? "Edit Invoice" : "Create Invoice"}
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
            >
              {editingId ? "Save Changes" : "Create & Get Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Payout Account Card ──────────────────────────────────────────────────────
function PayoutAccountCard() {
  const [account, setAccount] = useState<PayoutAccount>(INITIAL_PAYOUT);
  const [showModal, setShowModal] = useState(false);

  const [formBank, setFormBank] = useState("");
  const [formAccountNumber, setFormAccountNumber] = useState("");
  const [formAccountName, setFormAccountName] = useState("");

  function openEdit() {
    setFormBank(account.bankName);
    setFormAccountNumber(account.accountNumber);
    setFormAccountName(account.accountName);
    setShowModal(true);
  }

  function handleSave() {
    if (!formBank || !formAccountNumber.trim() || !formAccountName.trim()) {
      toast.error("All fields are required.");
      return;
    }
    if (formAccountNumber.length < 10) {
      toast.error("Account number must be 10 digits.");
      return;
    }
    setAccount({ bankName: formBank, accountNumber: formAccountNumber, accountName: formAccountName });
    toast.success("Payout account updated.");
    setShowModal(false);
  }

  return (
    <>
      <Card className="rounded-[24px] border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-[16px] font-bold text-[#111827] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#365BEB]" />
                Payout Account
              </CardTitle>
              <p className="text-sm text-[#808080]">
                Your earnings are sent to this bank account.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-gray-200 text-[#4D4D4D] gap-2 text-xs h-8 px-4 shrink-0"
              onClick={openEdit}
            >
              <Pencil className="w-3.5 h-3.5" />
              Update
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm text-[#808080]">Bank</span>
            <span className="text-sm font-semibold text-[#111827]">{account.bankName}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-sm text-[#808080]">Account Number</span>
            <span className="text-[16px] font-bold text-[#111827] tracking-widest">
              {account.accountNumber}
            </span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-sm text-[#808080]">Account Name</span>
            <span className="text-sm font-semibold text-[#111827]">{account.accountName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Update Payout Account Modal */}
      <Dialog open={showModal} onOpenChange={(open) => !open && setShowModal(false)}>
        <DialogContent className="sm:max-w-[440px] rounded-[24px] p-0 overflow-hidden gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="text-[#111827] font-bold text-xl">
              Update Payout Account
            </DialogTitle>
            <p className="text-sm text-[#808080] mt-1">
              Changes apply to future payouts only.
            </p>
          </DialogHeader>

          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-[#4D4D4D]">Bank Name</Label>
              <Select value={formBank} onValueChange={setFormBank}>
                <SelectTrigger className="rounded-xl border-gray-200">
                  <SelectValue placeholder="Select a bank" />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-[240px]">
                  {NIGERIAN_BANKS.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-[#4D4D4D]">Account Number</Label>
              <Input
                placeholder="10-digit account number"
                value={formAccountNumber}
                maxLength={10}
                onChange={(e) => setFormAccountNumber(e.target.value.replace(/\D/g, ""))}
                className="rounded-xl border-gray-200 tracking-widest font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-[#4D4D4D]">Account Name</Label>
              <Input
                placeholder="e.g. Precious Nwachukwu"
                value={formAccountName}
                onChange={(e) => setFormAccountName(e.target.value)}
                className="rounded-xl border-gray-200"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-800 leading-relaxed">
              Ensure the account name matches your bank records exactly to avoid payout delays.
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
            >
              Save Changes
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
                  <td className="py-4 pr-4 text-sm text-[#4D4D4D] whitespace-nowrap">{tx.date}</td>
                  <td className="py-4 pr-4 text-sm text-[#111827]">{tx.description}</td>
                  <td className="py-4 pr-4 text-sm text-[#808080] whitespace-nowrap">{tx.reference}</td>
                  <td
                    className={cn(
                      "py-4 pr-4 text-sm font-semibold text-right whitespace-nowrap",
                      tx.type === "credit" ? "text-green-600" : "text-[#111827]"
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
                    <TxStatusBadge status={tx.status} />
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
      <BalanceCard />
      <InvoiceSection />
      <PayoutAccountCard />
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
