"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "@/types";
import { getCustomerStatus, getCustomerStatusColor } from "./get-status";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye } from "lucide-react";

export const CustomerColumns = (): ColumnDef<Customer>[] => [
  {
    id: "serial",
    header: "S/N",
    cell: ({ row }) => {
      const serialNumber = (row.index + 1).toString().padStart(2, "0");
      return (
        <div className="font-medium py-3 text-[#999999]">
          {serialNumber}
        </div>
      );
    },
  },
  {
    accessorKey: "fullname",
    header: "Customer Name",
    cell: ({ row }) => {
      const name = row.original.fullname || "Unknown";
      return <div className="py-3 text-sm">{name}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.original.email || "N/A";
      return <div className="py-3 text-sm">{email}</div>;
    },
  },
  {
    accessorKey: "totalOrders",
    header: "Total Order",
    cell: ({ row }) => {
      const totalOrders = row.original.totalOrders ?? 0;
      return (
        <div className="py-3 font-medium text-[#999999]">
          {totalOrders}
        </div>
      );
    },
  },
  {
    accessorKey: "totalSpent",
    header: "Total Spent(₦)",
    cell: ({ row }) => {
      const totalSpent = row.original.totalSpent ?? 0;
      const amount = Number(totalSpent);
      const formatted = isNaN(amount) ? "0" : amount.toLocaleString();
      return (
        <div className="py-3 font-medium">
          {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusValue = row.original.status || "active";
      const status = getCustomerStatus(statusValue);
      const colorClass = getCustomerStatusColor(status);
      
      return (
        <div className="py-5">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {status}
          </span>
        </div>
      );
    },
  },
   {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const customer = row.original;
      
      return (
        <div className="py-3">
          <Link href={`/dashboard/customer/${customer.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4 h-8 text-[#676767] border-gray-200 flex items-center gap-2"
            >
              <Eye className="h-4 w-4 text-[#999999]" />
              View
            </Button>
          </Link>
        </div>
      );
    },
  }
];