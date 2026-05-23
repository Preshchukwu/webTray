import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data — replace with API call when backend is ready
const MOCK_INVOICES = [
  {
    id: "INV-001",
    businessName: "Precious Store",
    customerName: "Adaeze Obi",
    items: [{ name: "Custom Dress", quantity: 1, price: 45000 }],
    total: 45000,
    dueDate: "2026-06-01",
    status: "pending" as const,
  },
  {
    id: "INV-002",
    businessName: "Precious Store",
    customerName: "Emeka Chukwu",
    items: [
      { name: "Ankara Suit", quantity: 2, price: 35000 },
      { name: "Tie & Pocket Square", quantity: 1, price: 8000 },
    ],
    total: 78000,
    dueDate: "2026-05-25",
    status: "paid" as const,
  },
  {
    id: "INV-003",
    businessName: "Precious Store",
    customerName: "Ngozi Eze",
    items: [{ name: "Bridal Outfit", quantity: 1, price: 120000 }],
    total: 120000,
    dueDate: "2026-05-15",
    status: "overdue" as const,
  },
];

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: PageProps) {
  const { id } = await params;
  const invoice = MOCK_INVOICES.find((inv) => inv.id === id);

  if (!invoice) {
    notFound();
  }

  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.status === "overdue";

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-[540px] bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        {/* Blue header */}
        <div className="bg-[#365BEB] px-8 py-7 text-white">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">
            Invoice from
          </p>
          <h1 className="text-2xl font-bold">{invoice.businessName}</h1>
          <div className="flex items-center justify-between mt-5">
            <span className="text-blue-200 text-sm font-mono">{invoice.id}</span>
            {isPaid && (
              <span className="flex items-center gap-1.5 bg-green-400/20 border border-green-300/30 text-green-200 text-xs font-semibold px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Paid
              </span>
            )}
            {isOverdue && (
              <span className="bg-red-400/20 border border-red-300/30 text-red-200 text-xs font-semibold px-3 py-1 rounded-full">
                Overdue
              </span>
            )}
            {!isPaid && !isOverdue && (
              <span className="bg-yellow-400/20 border border-yellow-300/30 text-yellow-200 text-xs font-semibold px-3 py-1 rounded-full">
                Awaiting Payment
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 flex flex-col gap-6">
          {/* Billed to / Due date */}
          <div className="flex justify-between text-sm gap-4">
            <div>
              <p className="text-[#808080] text-xs uppercase tracking-wide mb-1">Billed To</p>
              <p className="font-semibold text-[#111827]">{invoice.customerName}</p>
            </div>
            <div className="text-right">
              <p className="text-[#808080] text-xs uppercase tracking-wide mb-1">Due Date</p>
              <p className={`font-semibold ${isOverdue ? "text-red-600" : "text-[#111827]"}`}>
                {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>

          {/* Items table */}
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-left font-medium text-gray-400 pr-4">Item</th>
                  <th className="pb-3 text-center font-medium text-gray-400 pr-4">Qty</th>
                  <th className="pb-3 text-right font-medium text-gray-400 pr-4">Price</th>
                  <th className="pb-3 text-right font-medium text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 text-[#111827]">{item.name}</td>
                    <td className="py-3 pr-4 text-center text-[#4D4D4D]">{item.quantity}</td>
                    <td className="py-3 pr-4 text-right text-[#4D4D4D]">
                      {formatAmount(item.price)}
                    </td>
                    <td className="py-3 text-right font-semibold text-[#111827]">
                      {formatAmount(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-4 px-5 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-sm font-medium text-[#4D4D4D]">Total Due</span>
            <span className="text-2xl font-bold text-[#111827]">{formatAmount(invoice.total)}</span>
          </div>

          {/* CTA */}
          {isPaid ? (
            <div className="flex items-center justify-center gap-2 py-3.5 bg-green-50 rounded-full text-green-700 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              This invoice has been paid
            </div>
          ) : isOverdue ? (
            <Button
              disabled
              className="w-full rounded-full h-12 text-base font-semibold bg-red-100 text-red-500 cursor-not-allowed"
            >
              Payment Overdue — Contact the Seller
            </Button>
          ) : (
            <Button className="w-full rounded-full bg-[#365BEB] hover:bg-[#365BEB]/90 text-white h-12 text-base font-semibold">
              Pay Now
            </Button>
          )}

          <p className="text-center text-xs text-[#808080]">
            Secured by{" "}
            <span className="font-semibold text-[#365BEB]">WebTray</span>
          </p>
        </div>
      </div>
    </div>
  );
}
