"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { use, useEffect, useState } from "react";
import { useInvoice } from "@/hooks/use-invoice";
import { useSearchParams, useRouter } from "next/navigation";

function formatAmount(amount: number | string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvoicePage(props: PageProps) {
  const { id: slug } = use(props.params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const {
    invoice,
    isLoadingInvoice,
    invoiceError,
    payInvoice,
    isPayingInvoice,
    verifyInvoice,
    isVerifyingInvoice,
    refetchInvoice
  } = useInvoice(slug);

  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const handleVerify = async () => {
      if (reference && !isVerifying) {
        setIsVerifying(true);
        try {
          const res = await verifyInvoice(reference);
          if (res.verified) {
            toast.success("Payment successful!");
            await refetchInvoice();
            router.replace(`/invoice/${slug}`);
          }
        } catch (error) {
          // Error already handled by toast in useInvoice hook
          router.replace(`/invoice/${slug}`);
        } finally {
          setIsVerifying(false);
        }
      }
    };
    handleVerify();
  }, [reference, verifyInvoice, refetchInvoice, router, slug, isVerifying]);

  const handlePay = async () => {
    if (!invoice) return;
    try {
      const res = await payInvoice({
        invoiceId: invoice.id,
        storeId: invoice.storeId,
        callbackUrl: window.location.href,
      });
      if (res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      } else {
        toast.error("No authorization URL received.");
      }
    } catch (e: any) {
      // toast error is already handled inside useInvoice's onError
    }
  };

  if (isLoadingInvoice || isVerifyingInvoice) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center justify-center py-10 px-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#365BEB] mb-4" />
        <p className="text-gray-500 font-medium">
          {isVerifyingInvoice ? "Verifying Payment..." : "Loading Invoice..."}
        </p>
      </div>
    );
  }

  if (invoiceError || !invoice) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex flex-col items-center justify-center py-10 px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Invoice Not Found</h1>
        <p className="text-gray-500 text-center max-w-sm">
          The invoice you are looking for does not exist, has been deleted, or the link is incorrect.
        </p>
      </div>
    );
  }

  const isPaid = invoice.status?.toLowerCase() === "paid";
  const isOverdue = invoice.status?.toLowerCase() === "overdue" || 
    (!isPaid && new Date(invoice.dueDate).getTime() < new Date().getTime());

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-[540px] bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        {/* Blue header */}
        <div className="bg-[#365BEB] px-8 py-7 text-white">
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">
            Invoice
          </p>
          <h1 className="text-2xl font-bold">Store #{invoice.storeId}</h1>
          <div className="flex items-center justify-between mt-5">
            <span className="text-blue-200 text-sm font-mono">{invoice.invoiceNumber || invoice.id}</span>
            {isPaid && (
              <span className="flex items-center gap-1.5 bg-green-400/20 border border-green-300/30 text-green-200 text-xs font-semibold px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Paid
              </span>
            )}
            {isOverdue && !isPaid && (
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
              <p className={`font-semibold ${isOverdue && !isPaid ? "text-red-600" : "text-[#111827]"}`}>
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
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 text-[#111827]">{item.name}</td>
                    <td className="py-3 pr-4 text-center text-[#4D4D4D]">{item.quantity}</td>
                    <td className="py-3 pr-4 text-right text-[#4D4D4D]">
                      {formatAmount(item.price)}
                    </td>
                    <td className="py-3 text-right font-semibold text-[#111827]">
                      {formatAmount(Number(item.price) * Number(item.quantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-4 px-5 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-sm font-medium text-[#4D4D4D]">Total Due</span>
            <span className="text-2xl font-bold text-[#111827]">{formatAmount(invoice.totalAmount)}</span>
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
            <Button 
              onClick={handlePay}
              disabled={isPayingInvoice}
              className="w-full rounded-full bg-[#365BEB] hover:bg-[#365BEB]/90 text-white h-12 text-base font-semibold"
            >
              {isPayingInvoice ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Now"}
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
