"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format-currency";
import { Check, Download, Printer } from "lucide-react";
import { useActiveStore } from "@/hooks/use-active-store";

export interface InvoiceData {
  orderId?: string | number;
  customerName: string;
  customerPhone: string;
  date: string;
  total: number;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewOrder: () => void;
  invoice: InvoiceData | null;
}

export function InvoiceModal({ isOpen, onClose, onNewOrder, invoice }: InvoiceModalProps) {
  const { activeStore } = useActiveStore();
  
  if (!invoice) return null;

  const handlePrint = (triggerDownload = false) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print the invoice.");
      return;
    }

    const itemsHtml = invoice.items.map((item, idx) => `
      <tr>
        <td>
          <div class="item-name">${item.name}</div>
          <div class="item-sku">SKU: WT-${item.name.substring(0,3).toUpperCase()}-${idx + 100}</div>
        </td>
        <td class="text-center font-bold">${item.quantity}</td>
        <td class="text-right">${formatCurrency(item.price)}</td>
        <td class="text-right font-black text-primary">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join("");

    const storeName = activeStore?.storeName || "WebTray Store";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoice.orderId || 'Order'}</title>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            :root {
              --primary: #365BEB;
              --primary-light: #EEF2FF;
              --text-main: #0F172A;
              --text-muted: #64748B;
              --bg-soft: #F8FAFC;
              --border: #E2E8F0;
            }
            
            body { 
              font-family: 'Plus Jakarta Sans', sans-serif; 
              padding: 0; 
              margin: 0;
              color: var(--text-main); 
              line-height: 1.6; 
              background: white; 
            }
            
            .container { 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 60px 40px;
            }

            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              margin-bottom: 60px;
            }

            .brand-section {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }

            .logo { 
              font-size: 32px; 
              font-weight: 800; 
              color: var(--primary); 
              letter-spacing: -1.5px;
              margin: 0;
            }

            .store-name {
              font-size: 14px;
              font-weight: 700;
              color: var(--text-muted);
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .invoice-badge {
              background: var(--primary-light);
              color: var(--primary);
              padding: 8px 16px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .meta-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 24px;
              margin-bottom: 60px;
              padding: 32px 0;
              background: white;
              border-top: 1px solid var(--border);
              border-bottom: 1px solid var(--border);
            }

            .meta-item h4 {
              font-size: 11px;
              font-weight: 700;
              color: var(--text-muted);
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 0 0 8px 0;
            }

            .meta-item p {
              font-size: 15px;
              font-weight: 700;
              color: var(--text-main);
              margin: 0;
            }

            .status-paid {
              color: #059669;
              display: flex;
              align-items: center;
              gap: 6px;
            }

            table { 
              width: 100%; 
              border-collapse: separate; 
              border-spacing: 0;
              margin-bottom: 40px; 
            }

            th { 
              text-align: left; 
              font-size: 11px; 
              font-weight: 700; 
              color: var(--text-muted); 
              text-transform: uppercase; 
              letter-spacing: 1px; 
              padding: 16px 12px; 
              border-bottom: 2px solid var(--text-main);
            }

            td { 
              padding: 24px 12px; 
              border-bottom: 1px solid var(--border);
            }

            .item-name { 
              font-size: 16px; 
              font-weight: 700; 
              color: var(--text-main); 
            }

            .item-sku { 
              font-size: 12px; 
              color: var(--text-muted); 
              font-weight: 500; 
              margin-top: 4px; 
            }

            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .text-primary { color: #365BEB; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 800; }

            .summary-section {
              display: flex;
              justify-content: flex-end;
              margin-top: 40px;
            }

            .summary-card {
              width: 320px;
              padding: 24px 0;
              background: white;
              border-top: 1px solid var(--border);
              border-bottom: 1px solid var(--border);
            }

            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
              font-weight: 600;
              color: var(--text-muted);
            }

            .total-row {
              margin-top: 16px;
              padding-top: 16px;
              border-top: 2px dashed var(--border);
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .total-label {
              font-size: 14px;
              font-weight: 800;
              color: #365BEB;
              text-transform: uppercase;
            }

            .total-value {
              font-size: 28px;
              font-weight: 800;
              color: #365BEB;
              letter-spacing: -1px;
            }

            .footer {
              margin-top: 80px;
              padding-top: 40px;
              border-top: 1px solid var(--border);
              text-align: center;
            }

            .footer-thanks {
              font-size: 18px;
              font-weight: 800;
              color: var(--text-main);
              margin-bottom: 8px;
            }

            .footer-info {
              font-size: 13px;
              font-weight: 600;
              color: var(--text-muted);
            }

            @media print {
              .container { padding: 0; }
              @page { margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand-section">
                <h1 class="logo">WebTray</h1>
                <span class="store-name">${storeName}</span>
              </div>
              <div class="invoice-badge">Invoice #${invoice.orderId || "PENDING"}</div>
            </div>

            <div class="meta-grid">
              <div class="meta-item">
                <h4>Customer</h4>
                <p>${invoice.customerName}</p>
                <p style="font-size: 13px; color: var(--text-muted); font-weight: 500; margin-top: 2px;">${invoice.customerPhone}</p>
              </div>
              <div class="meta-item">
                <h4>Date & Reference</h4>
                <p>${invoice.date}</p>
                <p style="font-size: 13px; color: var(--text-muted); font-weight: 500; margin-top: 2px;">Ref: ${invoice.orderId}</p>
              </div>
              <div class="meta-item">
                <h4>Payment Status</h4>
                <p class="status-paid">● Paid</p>
                <p style="font-size: 13px; color: var(--text-muted); font-weight: 500; margin-top: 2px;">via ${invoice.paymentMethod}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="summary-section">
              <div class="summary-card">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span>${formatCurrency(invoice.total)}</span>
                </div>
                <div class="summary-row">
                  <span>Tax (0%)</span>
                  <span>₦0.00</span>
                </div>
                <div class="total-row">
                  <span class="total-label">Grand Total</span>
                  <span class="total-value">${formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <div class="footer-thanks">Thank you for shopping with ${storeName}!</div>
              <div class="footer-info">Generated by WebTray Premium Inventory Management</div>
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-[24px]">
        <div className="sr-only">
          <DialogTitle>Order Success Invoice</DialogTitle>
          <DialogDescription>
            Invoice details for order #{invoice.orderId || "—"}
          </DialogDescription>
        </div>
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center text-center gap-2">
            <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-2">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Order Successful!</h2>
            <p className="text-gray-500">Order #{invoice.orderId || "—"} has been created successfully.</p>
          </div>

          <div className="bg-gray-50 rounded-[20px] p-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Customer</span>
              <span className="font-bold text-gray-900">{invoice.customerName}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-bold text-gray-900 capitalize">{invoice.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Total Amount</span>
              <span className="text-[#365BEB] font-bold">{formatCurrency(invoice.total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 mt-2">
            <Button 
              className="w-full rounded-full bg-[#365BEB] hover:bg-[#365BEB]/90 h-12 font-bold"
              onClick={() => handlePrint(false)}
            >
              <Printer className="mr-2 h-4 w-4" />
              Generate & Print Invoice
            </Button>
            <Button 
              variant="secondary"
              className="w-full rounded-full h-12 font-bold bg-gray-100"
              onClick={() => handlePrint(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button 
                variant="outline" 
                className="rounded-full h-12 font-bold border-gray-200"
                onClick={onNewOrder}
              >
                New Order
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full h-12 font-bold border-gray-200"
                onClick={onClose}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
