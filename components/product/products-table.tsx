"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProduct } from "@/hooks/use-product";
import { DataTable } from "@/lib/products/data-table";
import { createColumns, Product, ColumnHandlers } from "@/lib/products/columns";
import { useCategory } from "@/hooks/use-category";
import { capitalizeFirstLetter } from "@/lib/capitalize";
import { EditForm } from "@/types";
import { TableSkeleton } from "../table-skeleton";
import { useActiveStore } from "@/hooks/use-active-store";
import { ProductShareSheet } from "@/components/product-share-sheet";

export default function ProductsTable() {
  const {
    products,
    isFetchingProducts,
    productsError,
    updateProduct,
    deleteProduct,
    isUpdatingProduct,
    isDeletingProduct,
  } = useProduct();
  const { categories } = useCategory();

  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    product: Product | null;
  }>({
    open: false,
    product: null,
  });
  const [shareDialog, setShareDialog] = useState<{
    open: boolean;
    product: Product | null;
  }>({ open: false, product: null });

  const { activeStore } = useActiveStore();

  const handleEditClick = (product: Product) => {
    setEditingProduct(product.id);
    setEditForm({
      name: product.name,
      description: product.description,
      quantity: product.quantity,
      price: product.price,
      categoryId: product.categoryId,
    });
  };

  const handleEditCancel = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  const handleEditSave = async (productId: number) => {
    try {
      const payload = {
        id: productId,
        name: editForm.name,
        price: editForm.price,
        quantity: editForm.quantity,
        description: editForm.description,
      };

      await updateProduct(payload);

      setEditingProduct(null);
      setEditForm({});
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteDialog({ open: true, product });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.product) {
      try {
        await deleteProduct(deleteDialog.product.id);
        setDeleteDialog({ open: false, product: null });
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, product: null });
  };

  const handleShareClick = (product: Product) => {
    setShareDialog({ open: true, product });
  };

  // Create category lookup for sorting and display
  const categoryLookup =
    categories?.reduce((acc, category) => {
      acc[category.id] = category;
      return acc;
    }, {} as Record<number, any>) || {};

  // Create the handlers object for the columns
  const columnHandlers: ColumnHandlers = {
    handleEdit: handleEditClick,
    handleDelete: handleDeleteClick,
    handleShare: handleShareClick,
    handleEditSave,
    handleEditCancel,
    editingProduct,
    editForm,
    setEditForm,
    isUpdatingProduct,
  };

  // Format products with category data and apply filters
  const formattedProducts =
    products
      ?.map((product) => ({
        ...product,
        category: categoryLookup[product.categoryId],
        categoryName: categoryLookup[product.categoryId]?.name || "Unknown",
        price:
          typeof product.price === "string"
            ? parseFloat(product.price)
            : product.price,
      }))
      .filter((product) => {
        const matchesSearch =
          !searchTerm ||
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" ||
          product.categoryId.toString() === selectedCategory;

        return matchesSearch && matchesCategory;
      }) || [];

  // Create stable columns definition
  const columns = useMemo(() => createColumns(categories), [categories]);

  if (isFetchingProducts) return <TableSkeleton />;
  if (productsError) return <div>Error loading products</div>;

  return (
    <>
      <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-medium text-gray-800 mb-6">Products</h1>

          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Products"
                className="pl-10 bg-white border border-gray-200 rounded-full h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-56 bg-white border border-gray-200 rounded-full h-10">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {capitalizeFirstLetter(category.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DataTable columns={columns} data={formattedProducts} meta={columnHandlers} />
        </div>
      </div>

      <ProductShareSheet
        open={shareDialog.open}
        onClose={() => setShareDialog({ open: false, product: null })}
        product={shareDialog.product}
        slug={activeStore?.slug}
        storeName={activeStore?.storeName}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && handleDeleteCancel()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteDialog.product?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeletingProduct}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeletingProduct}
            >
              {isDeletingProduct ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
