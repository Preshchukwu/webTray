import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { formatCurrency } from "../format-currency";
import { Eye } from "lucide-react";

export const customerOrderColumns: ColumnDef<Order>[] = [
  {
    id: "sn",
    header: "S/N",
    cell: ({ row }) => <div className="py-3">{String(row.index + 1).padStart(2, "0")}</div>,
  },
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => <div className="py-3 font-medium">#{row.getValue<number>("id")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const created = row.getValue("createdAt") as string | undefined;
      const date = created ? new Date(created) : null;
      // show only date (no time)
      return (
        <div className="py-3 text-sm text-gray-600">
          {date ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—"}
        </div>
      );
    },
  },
  {
    id: "totalOrders",
    header: "Total Items",
    cell: ({ row }) => {
      const order = row.original as any;
      const count =
        Array.isArray(order.orderItems) && order.orderItems.length
          ? order.orderItems.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 0), 0)
          : 0;
      return <div className="py-3 text-sm">{count}</div>;
    },
  },
  {
    id: "totalSpent",
    header: "Total Spent (₦)",
    cell: ({ row }) => {
      const order = row.original as any;
      const amount = Number(order.totalAmount) || 0;
      return <div className="py-3 font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = (row.getValue("status") as string)?.toLowerCase() ?? "unknown";

      // custom colors per your request
      const bg =
        status === "completed" ? "#CDFBEC" : status === "pending" ? "#FDE8E8" : status === "cancelled" || status === "canceled" ? "#EF4444" : "#f3f4f6";

      const textColor = status === "cancelled" || status === "canceled" ? "text-white" : "text-black";

      return (
        <Badge
          className={`py-1 px-3 rounded-full ${textColor}`}
          style={{ backgroundColor: bg }}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const id = row.getValue("id") as number;
      return (
         <div className="flex gap-2">
          <Link href={`/dashboard/order/${id}`}>
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
  },
];