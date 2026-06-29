"use client";

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { Search, Edit, Trash2, Upload, X, Loader2, ImageDown } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

/* UI components */
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { capitalizeFirstLetter } from "@/lib/capitalize";
import { useStoreFront } from "@/hooks/use-store-front";
import { useCategory } from "@/hooks/use-category";
import { useAuthStore } from "@/store/useAuthStore";
import { TableSkeleton } from "../table-skeleton";
import { StoreProduct, Category } from "@/types";
import { useProduct } from "@/hooks/use-product";
import { ProductCardPoster } from "./product-card-poster";

/* TanStack Table */
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

/* Constants */
const PAGE_SIZE = 10;
const MAX_VISIBLE_PAGES = 5;
const FALLBACK_IMAGE = "/cups.jpg";

/* WhatsApp Icon SVG */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* Extracted ProductCard Component */
const ProductCard = React.memo<{
  product: StoreProduct;
  categoryName: string;
  slug?: string;
  onToggleVisible: (id: number, currentVisibility: boolean) => void;
  onToggleFeature: (id: number, currentFeature: boolean) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
  onImageUpload: (productId: number, files: FileList) => void;
  isUploadingImage: boolean;
  onShareCard: (id: number) => void;
}>(
  ({
    product,
    categoryName,
    slug,
    onToggleVisible,
    onToggleFeature,
    onEdit,
    onDelete,
    isUpdating,
    onImageUpload,
    isUploadingImage,
    onShareCard,
  }) => {
    const imgSrc = product.images?.[0] ?? "";
    const [imgError, setImgError] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [waBounce, setWaBounce] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Periodic bounce animation every 3 seconds
    useEffect(() => {
      const interval = setInterval(() => {
        setWaBounce(true);
        setTimeout(() => setWaBounce(false), 800);
      }, 3000);
      return () => clearInterval(interval);
    }, []);

    const hasNoImage = !imgSrc || imgError;
    const hasImages = product.images && product.images.length > 0;

    // Handle image area click
    /* 
    const handleImageClick = () => {
      if (product.images && product.images.length >= 3) {
        toast.info("Image limit reached. Click 'Edit' to manage or replace images.");
        return;
      }
      fileInputRef.current?.click();
    };
    */

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onImageUpload(product.id, files);
      }
      // Reset input to allow re-uploading same file
      e.target.value = "";
    };

    return (
      <article
        className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden relative"
        aria-label={`Product: ${product.name}`}
      >
        {/* Loading overlay */}
        {(isUpdating || isUploadingImage) && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
          </div>
        )}

        {/* Image area */}
        <div
          className="relative h-40 w-full overflow-hidden bg-gray-50 group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          /* onClick={handleImageClick} */
        >
          {hasNoImage ? (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 transition-all">
              <div className="relative">
                <div
                  className={`w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center transition-all ${
                    isHovering ? "bg-gray-200 scale-110" : ""
                  }`}
                >
                  <svg
                    className={`w-8 h-8 text-gray-400 transition-colors ${
                      isHovering ? "text-gray-600" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <line
                      x1="4"
                      y1="4"
                      x2="20"
                      y2="20"
                      strokeLinecap="round"
                      strokeWidth={2}
                      className={isHovering ? "opacity-0" : "opacity-100"}
                    />
                  </svg>
                </div>
              </div>
              <p
                className={`text-xs text-gray-600 font-medium text-center mt-3 transition-all ${
                  isHovering ? "text-gray-800" : ""
                }`}
              >
                {/* {isHovering ? "Click to upload" : "No image"} */}
                No image
              </p>

              {/* Upload indicator on hover - DISABLED
              {isHovering && (
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <Upload className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
              )}
              */}
            </div>
          ) : (
            <>
              <Image
                src={imgSrc}
                alt={product.name}
                fill
                className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                onError={() => setImgError(true)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Simple subtle hover overlay */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Hover overlay for existing image - DISABLED
              {isHovering && (
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center transition-opacity">
                  <div className="bg-white rounded-full p-3 shadow-lg mb-2">
                    <Upload className="w-6 h-6 text-gray-700" />
                  </div>
                  <p className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">
                    {hasImages ? "Update images" : "Upload images"}
                  </p>
                </div>
              )}
              */}
            </>
          )}

          {/* Hidden file input - allows multiple selection */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            aria-label={`Upload image for ${product.name}`}
          />

          {/* Status badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
            {product.feature && (
              <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-yellow-400 text-white shadow-sm">
                Featured
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 pointer-events-none">
            <span
              className={`inline-block text-xs font-medium px-3 py-1 rounded-full shadow-sm ${
                product.visible
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {product.visible ? "Visible" : "Hidden"}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-800 truncate">
                {capitalizeFirstLetter(product.name)}
              </h3>

              <div className="mt-2">
                <span className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                  {capitalizeFirstLetter(categoryName)}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-3 line-clamp-2">
                {product.description || "No description available"}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-sm font-medium whitespace-nowrap">
                ₦{Number(product.price).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Stock: {product.quantity}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <Switch
                checked={product.visible}
                onCheckedChange={() =>
                  onToggleVisible(product.id, product.visible)
                }
                disabled={isUpdating}
                aria-label={`Toggle visibility for ${product.name}`}
              />
              <span>Visible</span>
            </label>

            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <Switch
                checked={product.feature}
                onCheckedChange={() =>
                  onToggleFeature(product.id, product.feature)
                }
                disabled={isUpdating}
                aria-label={`Toggle featured for ${product.name}`}
              />
              <span>Featured</span>
            </label>

            
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(product.id)}
              disabled={isUpdating}
              className="rounded-full border px-3 py-1 hover:bg-gray-100"
              aria-label={`Edit ${product.name}`}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(product.id)}
              disabled={isUpdating}
              className="rounded-full px-3 border hover:bg-red-500 hover:text-white py-1"
              aria-label={`Delete ${product.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onShareCard(product.id)}
              disabled={isUpdating}
              className="rounded-full px-3 border hover:bg-[#365BEB] hover:text-white py-1 ml-auto"
              aria-label={`Share product card for ${product.name}`}
              title="Share product card"
            >
              <ImageDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </article>
    );
  },
);

ProductCard.displayName = "ProductCard";

/* Main Component */
export default function ManageProductTable() {
  const { activeStore } = useAuthStore();
  const storeId = activeStore?.id;
  const storeSlug = activeStore?.slug ?? undefined;

  const {
    storeProducts,
    isFetchingStoreProducts,
    storeProductsError,
    changeProductVisibility,
    changeProductFeatured,
  } = useStoreFront();

  const {
    deleteProduct,
    isDeletingProduct,
    updateProduct,
    isUpdatingProduct,
    uploadProductImages,
    deleteProductImages,
    isUploadingImages,
  } = useProduct();

  const { categories } = useCategory();

  // Track image operations
  const [uploadingImageProductId, setUploadingImageProductId] = useState<number | null>(null);
  const [deletingImageIndex, setDeletingImageIndex] = useState<number | null>(null);

  // Table controls
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(
    null,
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: "",
    quantity: "",
    description: "",
  });

  // Image management state
  const [selectedImages, setSelectedImages] = useState<(string | File)[]>([]);

  // Product card poster
  const [posterProductId, setPosterProductId] = useState<number | null>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(
    null,
  );

  const pendingOperations = useRef<Set<number>>(new Set());

  // Load images when editing product
  useEffect(() => {
    if (editingProduct?.images) {
      setSelectedImages(editingProduct.images);
    }
  }, [editingProduct]);

  // Keep editing product in sync with store updates
  useEffect(() => {
    if (editingProduct && isEditSheetOpen && storeProducts) {
      const current = storeProducts.find((p) => p.id === editingProduct.id);
      // Only update if images actually changed on the backend
      if (current && JSON.stringify(current.images) !== JSON.stringify(editingProduct.images)) {
        setEditingProduct(current);
      }
    }
  }, [storeProducts, isEditSheetOpen, editingProduct?.id, editingProduct]);



  // Categories map
  const categoriesMap = useMemo(() => {
    const m = new Map<number, string>();
    categories?.forEach((c: Category) => {
      if (c?.id != null) m.set(Number(c.id), String(c.name));
    });
    return m;
  }, [categories]);

  // Poster derived values (depends on categoriesMap)
  const posterProduct = storeProducts?.find((p) => p.id === posterProductId) ?? null;
  const posterCategory = posterProduct?.categoryId
    ? (categoriesMap.get(Number(posterProduct.categoryId)) ?? undefined)
    : undefined;

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(storeProducts)) return [];
    if (selectedCategory === "all") return storeProducts;
    const categoryId = Number(selectedCategory);
    return storeProducts.filter((p) => p.categoryId === categoryId);
  }, [storeProducts, selectedCategory]);

  // Table columns
  const columns = useMemo<ColumnDef<StoreProduct>[]>(
    () => [
      { id: "name", accessorKey: "name" },
      { id: "price", accessorKey: "price" },
      { id: "description", accessorKey: "description" },
    ],
    [],
  );

  // Table instance
  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    globalFilterFn: (row, _columnId, filterValue: unknown) => {
      const name = String(row.getValue("name") ?? "").toLowerCase();
      const desc = String(row.getValue("description") ?? "").toLowerCase();
      const term = String(filterValue ?? "")
        .trim()
        .toLowerCase();
      return !term || name.includes(term) || desc.includes(term);
    },
  });

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;

    if (selectedImages.length + files.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const formData = new FormData();
      validFiles.forEach((file) => formData.append("images", file));

      try {
        await uploadProductImages({
          productId: editingProduct.id,
          formData,
        });
        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error("Failed to upload image:", error);
      }
    }

    e.target.value = "";
  };

  // Remove image
  const handleRemoveImage = async (index: number) => {
    if (!editingProduct) return;
    const imageUrl = selectedImages[index];

    if (typeof imageUrl === "string") {
      setDeletingImageIndex(index);
      try {
        await deleteProductImages({
          productId: editingProduct.id,
          imageUrls: [imageUrl],
        });
        toast.success("Image removed successfully");
      } catch (error) {
        console.error("Failed to delete image:", error);
      } finally {
        setDeletingImageIndex(null);
      }
    } else {
      // Local removal for files not yet uploaded
      setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Get image preview URL
  const getImagePreview = (img: string | File): string => {
    if (typeof img === "string") return img;
    return URL.createObjectURL(img);
  };



  /* COMMENTED OUT: We want for now to only allow upload from the edit sheet
  const handleCardImageUpload = useCallback(
    async (productId: number, files: FileList) => {
      if (!storeId) {
        toast.error("No active store selected");
        return;
      }

      const product = storeProducts?.find((p) => p.id === productId);
      const existingImagesCount = product?.images?.length || 0;
      const remainingSlots = 3 - existingImagesCount;

      if (remainingSlots <= 0) {
        toast.info("Image limit reached. Click 'Edit' to manage or replace images.");
        return;
      }

      // Validate files
      const validFiles: File[] = [];
      for (let i = 0; i < files.length && validFiles.length < remainingSlots; i++) {
        const file = files[i];

        if (!file.type.startsWith("image/")) {
          toast.error("Only image files are allowed");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size must be less than 5MB");
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      if (files.length > remainingSlots) {
        toast.warning(`Only ${remainingSlots} slot(s) remaining. Added first ${remainingSlots} image(s).`);
      }

      setUploadingImageProductId(productId);

      try {
        // Step 1: Delete existing images if any
        if (existingImagesCount > 0) {
          await deleteProductImages(productId);
        }

        // Step 2: Upload existing + new images
        const formData = new FormData();
        if (product?.images) {
          product.images.forEach((url) => {
            formData.append("imageUrls", url);
          });
        }
        
        validFiles.forEach((file) => {
          formData.append("images", file);
        });

        await uploadProductImages({ productId, formData });

        toast.success(
          `${validFiles.length} image(s) uploaded successfully`
        );
      } catch (error) {
        console.error("Failed to upload images:", error);
        toast.error("Failed to upload images");
      } finally {
        setUploadingImageProductId(null);
      }
    },
    [storeId, storeProducts, uploadProductImages, deleteProductImages]
  );
  */

  const handleToggleVisible = useCallback(
    async (productId: number, currentVisibility: boolean) => {
      if (!storeId) return;
      if (pendingOperations.current.has(productId)) return;

      pendingOperations.current.add(productId);
      setUpdatingProductId(productId);

      try {
        await changeProductVisibility({
          productId,
          visibility: !currentVisibility,
          storeId,
        });
      } catch (error) {
        console.error("Failed to toggle visibility:", error);
      } finally {
        pendingOperations.current.delete(productId);
        setUpdatingProductId(null);
      }
    },
    [storeId, changeProductVisibility],
  );

  const handleToggleFeature = useCallback(
    async (productId: number, currentFeature: boolean) => {
      if (!storeId) return;
      if (pendingOperations.current.has(productId)) return;

      pendingOperations.current.add(productId);
      setUpdatingProductId(productId);

      try {
        await changeProductFeatured({
          productId,
          featured: !currentFeature,
          storeId,
        });
      } catch (error) {
        console.error("Failed to toggle feature:", error);
      } finally {
        pendingOperations.current.delete(productId);
        setUpdatingProductId(null);
      }
    },
    [storeId, changeProductFeatured],
  );

  const handleEdit = useCallback(
    (productId: number) => {
      const product = storeProducts?.find((p) => p.id === productId);
      if (!product) return;

      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        categoryId: product.categoryId ? String(product.categoryId) : "",
        price: product.price ? String(product.price) : "",
        quantity: product.quantity ? String(product.quantity) : "",
        description: product.description || "",
      });
      setIsEditSheetOpen(true);
    },
    [storeProducts],
  );

  const handleDeleteClick = useCallback((productId: number) => {
    setDeleteConfirm(productId);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm || !storeId || isDeletingProduct) return;

    const productId = deleteConfirm;

    try {
      await deleteProduct(productId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  }, [deleteConfirm, storeId, isDeletingProduct, deleteProduct]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      setSelectedCategory(value);
      table.setPageIndex(0);
    },
    [table],
  );

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct || !storeId) return;

    try {
      // Update product details
      await updateProduct({
        id: editingProduct.id,
        name: formData.name,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        description: formData.description,
      });

      setIsEditSheetOpen(false);
      setEditingProduct(null);
      setSelectedImages([]);
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Pagination helpers
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];

    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        end = Math.min(MAX_VISIBLE_PAGES, totalPages);
      }
      if (currentPage > totalPages - 3) {
        start = Math.max(1, totalPages - MAX_VISIBLE_PAGES + 1);
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  const pageRows = table.getPaginationRowModel().rows;

  if (storeProductsError) {
    return (
      <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-500 py-10">
          <p className="font-medium">Failed to load products</p>
          <p className="text-sm text-gray-500 mt-2">
            {storeProductsError.message}
          </p>
        </div>
      </div>
    );
  }

  if (isFetchingStoreProducts) return <TableSkeleton />;

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
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  table.setPageIndex(0);
                }}
                aria-label="Search products"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-full bg-white border border-gray-200 rounded-full h-10">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat: Category) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {capitalizeFirstLetter(cat.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pageRows.length === 0 ? (
              <div className="col-span-full text-center text-gray-500 py-10">
                {globalFilter || selectedCategory !== "all"
                  ? "No products match your search."
                  : "No products found. Add your first product to get started."}
              </div>
            ) : (
              pageRows.map((row) => {
                const product = row.original;
                const categoryName = product.categoryId
                  ? (categoriesMap.get(Number(product.categoryId)) ??
                    `Category ${product.categoryId}`)
                  : "Uncategorized";

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={categoryName}
                    slug={storeSlug}
                    onToggleVisible={handleToggleVisible}
                    onToggleFeature={handleToggleFeature}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    isUpdating={updatingProductId === product.id}
                    onImageUpload={() => {}} // Disabled for now
                    isUploadingImage={uploadingImageProductId === product.id}
                    onShareCard={(id) => setPosterProductId(id)}
                  />
                );
              })
            )}
          </div>

          {totalPages > 0 && (
            <nav
              className="flex items-center justify-center gap-4 py-6"
              aria-label="Pagination"
            >
              <button
                className={`px-5 py-2 rounded-full text-sm transition-colors ${
                  table.getCanPreviousPage()
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Previous page"
              >
                Previous
              </button>

              <div className="flex items-center space-x-2">
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm border transition-colors ${
                      currentPage === page
                        ? "border-blue-500 text-blue-500 font-medium bg-blue-50"
                        : "border-gray-300 text-gray-500 hover:border-gray-400"
                    }`}
                    onClick={() => table.setPageIndex(page - 1)}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <span className="text-gray-400 text-sm">of {totalPages}</span>

              <button
                className={`px-5 py-2 rounded-full text-sm transition-colors ${
                  table.getCanNextPage()
                    ? "bg-gray-900 text-white hover:bg-gray-800"
                    : "bg-gray-300 text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Next page"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => {
          if (!open && !isDeletingProduct) {
            setDeleteConfirm(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 dark:bg-red-950 rounded-full p-2">
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-[16px] font-medium text-[#343434] mb-5">
              Are you sure you want to delete this product?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 sm:flex-row">
            <AlertDialogCancel className="flex-1 rounded-full border-2 border-[#111827] hover:bg-accent/50 bg-transparent">
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeletingProduct}
              className={`flex-1 rounded-full text-white ${
                isDeletingProduct
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#111827] hover:bg-slate-800"
              }`}
            >
              {isDeletingProduct ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Card Poster Modal */}
      {posterProduct && (
        <ProductCardPoster
          open={posterProductId !== null}
          onClose={() => setPosterProductId(null)}
          product={posterProduct}
          storeName={activeStore?.storeName ?? undefined}
          categoryName={posterCategory}
          slug={storeSlug}
        />
      )}

      {/* Edit Product Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent
          side="right"
          className="w-[400px] sm:max-w-md overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Edit Product</SheetTitle>
            <SheetDescription>
              Make changes to your product here. Click save when you're done.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleEditSubmit}
            className="flex flex-col px-6 h-full"
          >
            <div className="flex-1 space-y-4 py-6">
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label className="text-sm">
                  Product Images
                  <span className="text-xs text-muted-foreground ml-2">
                    ({selectedImages.length}/3)
                  </span>
                </Label>

                <div className="grid grid-cols-4 gap-2">
                  {selectedImages.map((image, index) => {
                    const previewUrl = getImagePreview(image);
                    const isNew = image instanceof File;

                    return (
                      <div
                        key={index}
                        className="relative aspect-square rounded-md border border-gray-200 overflow-hidden group"
                      >
                        <Image
                          src={previewUrl}
                          alt={`Product ${index + 1}`}
                          fill
                          className={`object-cover transition-opacity ${deletingImageIndex === index ? "opacity-40" : "opacity-100"}`}
                        />
                        {deletingImageIndex === index ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            disabled={deletingImageIndex !== null || isUploadingImages}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                          {index === 0 ? "Main" : index + 1}
                        </div>
                        {isNew && (
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                            New
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Upload Button */}
                  {selectedImages.length < 3 && (
                    <label
                      htmlFor="product-image-upload"
                      className="aspect-square rounded-md border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100"
                    >
                      {isUploadingImages ? (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-400 mb-1" />
                          <span className="text-[10px] text-gray-500">
                            {selectedImages.length}/3
                          </span>
                        </>
                      )}
                      <input
                        id="product-image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploadingImages}
                      />
                    </label>
                  )}
                </div>

                <div className="text-[11px] text-muted-foreground bg-gray-50 px-2 py-1.5 rounded">
                  JPG, PNG, WebP • Max 5MB • First image is main
                </div>
              </div>

              {/* Product Name */}
              <div className="grid gap-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={formData.name}
                  className="border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-400"
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Premium Coffee Beans"
                  required
                />
              </div>

              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="product-category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    handleFormChange("categoryId", value)
                  }
                >
                  <SelectTrigger className="w-full" id="product-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat: Category) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {capitalizeFirstLetter(cat.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
             <div className="grid gap-2">
                <Label htmlFor="product-price">Price</Label>
                <div className="relative">
                  <span className="absolute left3 h-full rounded-l pt-1 px-1 top-1/2 border-2 -translate-y-1/2 text-[#676767] bg-[#EBEBEB]">
                    NGN
                  </span>
                  <Input
                    id="product-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleFormChange("price", e.target.value)}
                     onKeyPress={(e) => {
                    const isValid = /[0-9.]/.test(e.key);
                    const currentValue = e.currentTarget.value;
                    if (
                      !isValid ||
                      (e.key === "." && currentValue.includes("."))
                    ) {
                      e.preventDefault();
                    }
                  }}
                    placeholder="3000"
                    className="pl-14 
    focus-visible:ring-0
    focus-visible:ring-offset-0"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="grid gap-2">
                <Label htmlFor="product-stock">Stock</Label>
                <Input
                  id="product-stock"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleFormChange("quantity", e.target.value)}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  placeholder="300"
                  className="border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-gray-400"
                  required
                  min="0"
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={formData.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  placeholder="High-quality arabica coffee beans"
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>

            <SheetFooter className="gap-2 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-[#111827] w-1/2 mx-auto rounded-full hover:bg-slate-800"
                disabled={isUpdatingProduct || isUploadingImages}
              >
                {isUpdatingProduct || isUploadingImages ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  "Save"
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}