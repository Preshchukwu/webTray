"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { SquarePen, Trash2, Check, X, Loader2, Share2 } from "lucide-react";
import { Category, EditForm } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { capitalizeFirstLetter } from "@/lib/capitalize";
import { getStatusColor, getStockStatus } from "./get-status";
import { formatCurrency } from "../format-currency";

export type Product = {
  id: number;
  name: string;
  categoryId: number;
  quantity: number;
  price: number;
  description: string;
};


export interface ColumnHandlers {
  handleEdit: (product: Product) => void;
  handleDelete: (product: Product) => void;
  handleShare: (product: Product) => void;
  handleEditSave: (productId: number) => void;
  handleEditCancel: () => void;
  editingProduct: number | null;
  editForm: EditForm;
  setEditForm: (form: EditForm | ((prev: EditForm) => EditForm)) => void;
  isUpdatingProduct: boolean;
}

export const createColumns = (
  categories?: Category[]
): ColumnDef<Product>[] => [
  {
    header: "S/N",
    cell: ({ row }) => {
      return (
        <div className="font-medium py-5">
          {(row.index + 1).toString().padStart(2, "0")}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Products",
    cell: ({ row, table }) => {
      const handlers = table.options.meta as ColumnHandlers;
      const product = row.original;
      const isEditing = handlers.editingProduct === product.id;

      return (
        <div className="py-5">
          {isEditing ? (
            <div>
              <Input
                value={handlers.editForm.name || ""}
                onChange={(e) =>
                  handlers.setEditForm({
                    ...handlers.editForm,
                    name: e.target.value,
                  })
                }
                className="h-8 mb-2"
              />
              <Input
                value={handlers.editForm.description || ""}
                onChange={(e) =>
                  handlers.setEditForm({
                    ...handlers.editForm,
                    description: e.target.value,
                  })
                }
                className="h-8"
                placeholder="Description"
              />
            </div>
          ) : (
            <div>
              <div>{capitalizeFirstLetter(product.name)}</div>
              {/* <div className="text-sm text-gray-500">{product.description}</div> */}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "categoryId",
    header: "Category",
    cell: ({ row, table }) => {
      const handlers = table.options.meta as ColumnHandlers;
      const product = row.original;
      const isEditing = handlers.editingProduct === product.id;
      const categoryName =
        categories?.find((cat) => cat.id === product.categoryId)?.name ||
        "Unknown";

      return (
        <div className="py-5">
          {isEditing ? (
            <Select
              value={handlers.editForm.categoryId?.toString() || ""}
              onValueChange={(value) =>
                handlers.setEditForm({
                  ...handlers.editForm,
                  categoryId: parseInt(value),
                })
              }
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            capitalizeFirstLetter(categoryName)
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: "Stock",
    cell: ({ row, table }) => {
      const handlers = table.options.meta as ColumnHandlers;
      const product = row.original;
      const isEditing = handlers.editingProduct === product.id;

      return (
        <div className="text-[#999999] py-5">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={handlers.editForm.quantity || ""}
                onChange={(e) =>
                  handlers.setEditForm({
                    ...handlers.editForm,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="h-8 w-20"
              />
              <span className="text-sm">units</span>
            </div>
          ) : (
            `${product.quantity} units`
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "formattedPrice",
    header: "Price ₦",
    cell: ({ row, table }) => {
      const handlers = table.options.meta as ColumnHandlers;
      const product = row.original;
      const isEditing = handlers.editingProduct === product.id;

      return (
        <div className="py-5">
          {isEditing ? (
            <Input
              type="number"
              step="0.01"
              value={handlers.editForm.price || ""}
              onChange={(e) =>
                handlers.setEditForm({
                  ...handlers.editForm,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              className="h-8 w-24"
            />
          ) : (
            formatCurrency(product.price)
          )}
        </div>
      );
    },
  },
  {
    header: "Status",
    cell: ({ row, table }) => {
      const handlers = table.options.meta as ColumnHandlers;
      const product = row.original;
      const status = getStockStatus(product.quantity);

      return (
        <div className="py-5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              status
            )}`}
          >
            {status}
          </span>
        </div>
      );
    },
  },
  {
    header: "Actions",
    cell: ({ row, table }) => {
      const handlers = table.options.meta as ColumnHandlers;
      const product = row.original;
      const isEditing = handlers.editingProduct === product.id;

      return (
        <div className="textright py-5">
          <div className="flex justifyend gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-green-600 hover:text-green-700"
                  onClick={() => handlers.handleEditSave(product.id)}
                  disabled={handlers.isUpdatingProduct}
                >
                  {handlers.isUpdatingProduct ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                  onClick={handlers.handleEditCancel}
                  disabled={handlers.isUpdatingProduct}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-[#365BEB]"
                  onClick={() => handlers.handleShare(product)}
                  title="Share product"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-blue-600"
                  onClick={() => handlers.handleEdit(product)}
                >
                  <SquarePen className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-600"
                  onClick={() => handlers.handleDelete(product)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      );
    },
  },
];
