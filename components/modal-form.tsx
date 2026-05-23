"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Plus,
  Check,
  X,
  Loader2,
  Trash2,
  Upload,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";

interface Field {
  id: string;
  label: string;
  type?: "text" | "select" | "currency" | "textarea" | "number";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  allowCustom?: boolean;
}

interface PendingProduct {
  id: string;
  name: string;
  category: string;
  categoryId: number;
  price: number;
  stock: number;
  description: string;
  images: File[]; // Added images array
}

interface ModalFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  submitLabel: string;
  fields: Field[];
  onAddCategory?: (category: string) => Promise<boolean>;
  onSubmit: (data: Record<string, string>, images: File[]) => void; // Updated to include images
  shouldClearForm?: boolean;
  isAddingCategory?: boolean;
  onFormCleared?: () => void;
  validationErrors?: Record<string, string>;
  initialData?: Record<string, string>;
  pendingProducts?: PendingProduct[];
  onRemoveProduct?: (id: string) => void;
  onSubmitAll?: () => void;
  isSubmittingAll?: boolean;
  showImageUpload?: boolean;
}

export function ModalForm({
  isOpen,
  onOpenChange,
  title,
  submitLabel,
  fields,
  onAddCategory,
  onSubmit,
  validationErrors = {},
  shouldClearForm = false,
  isAddingCategory = false,
  onFormCleared,
  initialData = {},
  pendingProducts = [],
  onRemoveProduct,
  onSubmitAll,
  isSubmittingAll = false,
  showImageUpload = true,
}: ModalFormProps) {
  const initialState = Object.fromEntries(
    fields.map((f) => [f.id, initialData[f.id] || ""]),
  );

  const [formData, setFormData] = useState(initialState);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showProductList, setShowProductList] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Image upload state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageError, setImageError] = useState<string>("");

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Smooth-scroll to bottom whenever a product is added to the queue
  useEffect(() => {
    if (pendingProducts.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [pendingProducts.length]);

  useEffect(() => {
    if (shouldClearForm) {
      setFormData(initialState);
      setShowAddCategory(false);
      setNewCategory("");

      // Clean up preview URLs
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviews([]);
      setImageError("");
      onFormCleared?.();
    }
  }, [shouldClearForm, onFormCleared, initialState, imagePreviews]);

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle image file selection
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (selectedImages.length + files.length > 3) {
      setImageError("Maximum 3 images allowed");
      e.target.value = "";
      return;
    }

    setImageError("");
    setIsUploadingImages(true);

    try {
      const newFiles: File[] = [];
      const newPreviews: string[] = [];
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          setImageError("Only image files are allowed");
          setIsUploadingImages(false);
          e.target.value = "";
          return;
        }

        // Validate file size (max 2MB) - reject immediately
        if (file.size > MAX_SIZE) {
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
          setImageError(
            `Image "${file.name}" is ${fileSizeMB}MB. Maximum size is 2MB. Please compress or resize the image.`,
          );
          setIsUploadingImages(false);
          e.target.value = "";
          return;
        }

        // Store the file
        newFiles.push(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);
      }

      // Only add images if all passed validation
      if (newFiles.length > 0) {
        setSelectedImages((prev) => [...prev, ...newFiles].slice(0, 3));
        setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 3));
      }
    } catch (error) {
      console.error("Error processing images:", error);
      setImageError("Failed to process images");
    } finally {
      setIsUploadingImages(false);
      e.target.value = "";
    }
  };

  // Remove image from selection
  const handleRemoveImage = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit(formData, selectedImages);
  };

  const handleAddNewCategory = async () => {
    if (newCategory.trim() && onAddCategory) {
      const success = await onAddCategory(newCategory.trim());
      if (success) {
        setFormData((prev) => ({ ...prev, category: newCategory.trim() }));
        setNewCategory("");
        setShowAddCategory(false);
      }
    }
  };

  const handleCancelAddCategory = () => {
    setNewCategory("");
    setShowAddCategory(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData(initialState);
      setShowAddCategory(false);
      setNewCategory("");

      // Clean up preview URLs
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviews([]);
      setImageError("");
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="p-0 overflow-y-auto w-[400px] sm:w-[900px]">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="px-6 space-y-6">
          {/* Image Upload Section - Placed at the top for prominence */}
          {showImageUpload && (
            <div className="space-y-2">
              <Label className="text-sm">
                {title === "Add new store" ? "Store Logo" : "Product Images"}
                <span className="text-xs text-muted-foreground ml-2">
                  (Optional, up to 3 images)
                </span>
              </Label>

              <div className="grid grid-cols-4 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-md border border-gray-200 overflow-hidden group"
                  >
                    <Image
                      src={preview}
                      alt={`Product ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {index === 0 ? "Main" : index + 1}
                    </div>
                  </div>
                ))}

                {selectedImages.length < 3 && (
                  <label
                    htmlFor="image-upload"
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
                      id="image-upload"
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
                JPG, PNG, WebP • Max 2MB • First image is main
              </div>

              {imageError && (
                <div className="text-red-500 text-xs bg-red-50 px-2 py-1.5 rounded">
                  {imageError}
                </div>
              )}
            </div>
          )}

          {/* Existing form fields */}
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>

              {field.type === "select" ? (
                <div>
                  <select
                    id={field.id}
                    value={formData[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`w-full border rounded px-4 py-2 ${
                      validationErrors[field.id] ? "border-red-500" : ""
                    }`}
                    required={field.required}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {field.allowCustom && (
                    <div className="space-y-2 ml-0">
                      {!showAddCategory ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-[12px] mt-[8px] text-blue-600 hover:text-blue-700"
                          onClick={() => setShowAddCategory(true)}
                        >
                          <Plus className="w-4 h-4 m" />
                          Add New Category
                        </Button>
                      ) : (
                        <div className="flex items-center mt-2 gap-2">
                          <Input
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Enter new category"
                            className="flex-1"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddNewCategory();
                              }
                              if (e.key === "Escape") {
                                handleCancelAddCategory();
                              }
                            }}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddNewCategory}
                            disabled={!newCategory.trim() || isAddingCategory}
                          >
                            {isAddingCategory ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelAddCategory}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : field.type === "currency" ? (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-gray-100 px-2 py-1 text-sm text-gray-600 rounded">
                    NGN
                  </div>
                  <Input
                    id={field.id}
                    value={formData[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`pl-16 ${
                      validationErrors[field.id] ? "border-red-500" : ""
                    }`}
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
                    placeholder={field.placeholder}
                    required={field.required}
                    min="0"
                    step="any"
                  />
                </div>
              ) : field.type === "textarea" ? (
                <textarea
                  id={field.id}
                  value={formData[field.id]}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className={`w-full border rounded px-4 py-2 ${
                    validationErrors[field.id] ? "border-red-500" : ""
                  }`}
                  rows={2}
                />
              ) : field.type === "number" ? (
                <Input
                  id={field.id}
                  type="number"
                  value={formData[field.id]}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className={validationErrors[field.id] ? "border-red-500" : ""}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  min="0"
                  step="any"
                />
              ) : (
                <Input
                  id={field.id}
                  type="text"
                  value={formData[field.id]}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  className={validationErrors[field.id] ? "border-red-500" : ""}
                />
              )}

              {validationErrors[field.id] && (
                <div className="text-red-500 text-sm mt-1">
                  {validationErrors[field.id]}
                </div>
              )}
            </div>
          ))}

          <Button
            type="submit"
            className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-full py-3"
            disabled={submitLabel.includes("...")}
          >
            {submitLabel}
          </Button>
        </form>

        {/* Pending Products List */}
        {pendingProducts.length > 0 && (
          <div className="px-6 pb-6">
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm">
                    Products to Submit ({pendingProducts.length})
                  </h3>
                  {showProductList && (
                    <p className="text-xs text-muted-foreground">
                      {pendingProducts.length} product(s) added
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProductList(!showProductList)}
                  className="text-xs"
                >
                  {showProductList ? "Hide" : "Review"}
                </Button>
              </div>

              {showProductList && (
                <div className="mb-4">
                  <div className="grid grid-cols-[0.5fr_2fr_1.5fr_1fr_1fr_0.5fr] gap-4 px-3 py-2 bg-muted/30 rounded-t-lg border border-b-0 text-xs font-medium text-muted-foreground">
                    <div>Image</div>
                    <div>Product</div>
                    <div>Category</div>
                    <div>Price ₦</div>
                    <div>Stock</div>
                    <div>Action</div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto border rounded-b-lg">
                    {pendingProducts.map((product, index) => {
                      // ✅ Create preview URL for the first image
                      const imagePreview = product.images?.[0]
                        ? URL.createObjectURL(product.images[0])
                        : null;

                      return (
                        <div
                          key={product.id}
                          className={`grid grid-cols-[0.5fr_2fr_1.5fr_1fr_1fr_0.5fr] gap-4 px-3 py-3 items-center text-sm ${
                            index !== pendingProducts.length - 1
                              ? "border-b"
                              : ""
                          }`}
                        >
                          <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100">
                            {imagePreview ? (
                              <Image
                                src={imagePreview}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="truncate font-medium">
                            {product.name}
                          </div>
                          <div className="truncate text-muted-foreground">
                            {product.category}
                          </div>
                          <div>{product.price.toLocaleString()}</div>
                          <div>{product.stock}</div>
                          <div className="flex justify-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveProduct?.(product.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={onSubmitAll}
                disabled={isSubmittingAll}
                className="w-full bg-black hover:bg-black/90 text-white rounded-full py-3"
              >
                {isSubmittingAll ? "Submitting..." : "Submit Products"}
              </Button>
            </div>
          </div>
        )}

        {/* Scroll sentinel – always rendered so the ref is available */}
        <div ref={bottomRef} />
      </SheetContent>
    </Sheet>
  );
}
