"use client";
import { useState } from "react";
import { ModalForm } from "../modal-form";
import { PageHeader } from "../page-header";
import { useCategory } from "@/hooks/use-category";
import { toast } from "sonner";
import { capitalizeFirstLetter } from "@/lib/capitalize";
import { useProduct } from "@/hooks/use-product";
import * as yup from "yup";
import { useAuthStore } from "@/store/useAuthStore";
import { productValidationSchema } from "@/schemas/product.schema";
import { PageHeaderSkeleton } from "../header-skeleton";

interface PendingProduct {
  id: string;
  name: string;
  category: string;
  categoryId: number;
  price: number;
  stock: number;
  description: string;
  images: File[];
}

export function ManageStoreFrontHeader() {
  const { isFetchingInventorySummary } = useCategory();
  const { user, activeStore } = useAuthStore();
  const { addProduct, isAddingProduct, isFetchingProducts } = useProduct();
  const { categories, addCategory, isAddingCategory } = useCategory();

  const [isOpen, setIsOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [shouldClearForm, setShouldClearForm] = useState(false);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);

  const userStoreId = activeStore?.id;
  const isLoading = isFetchingInventorySummary || isFetchingProducts;

  const handleAddCategory = async (
    newCategoryName: string
  ): Promise<boolean> => {
    if (!newCategoryName) return false;

    if (!userStoreId) {
      toast.error("No active store selected");
      return false;
    }

    const alreadyExists = categories?.some(
      (category) =>
        category.name.toLowerCase() === newCategoryName.toLowerCase()
    );

    if (alreadyExists) {
      toast.success("Category already exists");
      return false;
    }

    try {
      await addCategory({
        name: newCategoryName,
        description: "",
        storeId: userStoreId,
      });

      toast.success("Category successfully added");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to add category");
      return false;
    }
  };

  const categoryNames =
    categories?.map((category) => capitalizeFirstLetter(category.name)) || [];

  const handleAddToQueue = async (data: Record<string, string>, images: File[]) => {
    if (!userStoreId) {
      toast.error("No active store selected");
      return;
    }

    try {
      setValidationErrors({});

      await productValidationSchema.validate(data, { abortEarly: false });

      const selectedCategoryName = data.category.toLowerCase();
      const selectedCategory = categories?.find(
        (cat) => cat.name.toLowerCase() === selectedCategoryName
      );

      if (!selectedCategory) {
        toast.error("Invalid category selected");
        return;
      }

      const newProduct: PendingProduct = {
        id: `temp-${Date.now()}-${Math.random()}`,
        name: data.name,
        category: capitalizeFirstLetter(selectedCategory.name),
        categoryId: selectedCategory.id,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        description: data.description || "",
        images: images,
      };

      setPendingProducts((prev) => [...prev, newProduct]);
      toast.success("Product added to queue");
      setShouldClearForm(true);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        setValidationErrors(errors);

        const firstError = error.inner[0]?.message;
        if (firstError) {
          toast.error(firstError);
        }
      } else {
        console.error("Error validating product:", error);
        toast.error("Failed to add product. Please try again.");
      }
    }
  };

  const handleRemoveFromQueue = (productId: string) => {
    setPendingProducts((prev) => prev.filter((p) => p.id !== productId));
    toast.success("Product removed from queue");
  };

  const handleSubmitAll = async () => {
    if (!userStoreId) {
      toast.error("No active store selected");
      return;
    }

    if (pendingProducts.length === 0) {
      toast.error("No products to submit");
      return;
    }

    setIsSubmittingAll(true);

    try {
      let successCount = 0;
      let planLimitReached = false;

      for (const product of pendingProducts) {
        try {
          const formData = new FormData();
          formData.append("storeId", userStoreId.toString());
          formData.append("categoryId", product.categoryId.toString());
          formData.append("name", product.name);
          formData.append("description", product.description);
          formData.append("price", product.price.toString());
          formData.append("quantity", product.stock.toString());

          // Only append images if they exist
          if (product.images && product.images.length > 0) {
            product.images.forEach((file) => {
              formData.append("images", file);
            });
          }

          await addProduct(formData);

          successCount++;
        } catch (error: unknown) {
          console.error(`Failed to add product ${product.name}:`, error);

          // Extract the backend error message from Axios response
          const axiosError = error as { response?: { data?: { responseMessage?: string }; status?: number }; message?: string };
          const backendMessage =
            axiosError?.response?.data?.responseMessage ||
            axiosError?.message ||
            "Failed to add product";
          const statusCode = axiosError?.response?.status;

          toast.error(backendMessage);

          // Stop processing the queue if the plan limit has been reached
          const isPlanLimit = backendMessage.toLowerCase().includes("limit") || backendMessage.toLowerCase().includes("upgrade");
          if (isPlanLimit) {
            planLimitReached = true;
            break;
          }
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} product(s) added successfully`);
      }

      if (successCount === pendingProducts.length) {
        setPendingProducts([]);
        setIsOpen(false);
      } else if (!planLimitReached) {
        setPendingProducts((prev) => prev.slice(successCount));
      }
    } catch (error) {
      console.error("Error submitting products:", error);
      toast.error("Failed to submit products");
    } finally {
      setIsSubmittingAll(false);
    }
  };

  const handleAddProductDrawer = () => {
    if (!user?.business) {
      toast.error("Please register your business to carry out this action");
      return;
    }

    if (!activeStore) {
      toast.error("Please select a store first");
      return;
    }

    setIsOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    if (!open && pendingProducts.length > 0) {
      const confirmed = window.confirm(
        `You have ${pendingProducts.length} product(s) pending. Are you sure you want to close?`
      );
      if (!confirmed) return;
      setPendingProducts([]);
    }
    setIsOpen(open);
  };

  if (isLoading) {
    return <PageHeaderSkeleton />;
  }

  if (!activeStore) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm text-orange-800">
            No active store selected. Please create or select a store.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Storefront Products"
        semiSubtitle="Storefront / Manage Products"
        subtitle="Manage which products appear in your online store"
        onAddClick={handleAddProductDrawer}
        addLabel="Add Product"
        showBackButton={true}
        backButtonHref="/dashboard/storefront"
      />
      <ModalForm
        isOpen={isOpen}
        onOpenChange={handleModalClose}
        title="Add To Store"
        submitLabel={isAddingProduct ? "Adding..." : "Add Product"}
        onAddCategory={handleAddCategory}
        onSubmit={handleAddToQueue}
        validationErrors={validationErrors}
        shouldClearForm={shouldClearForm}
        onFormCleared={() => setShouldClearForm(false)}
        isAddingCategory={isAddingCategory}
        pendingProducts={pendingProducts}
        onRemoveProduct={handleRemoveFromQueue}
        onSubmitAll={handleSubmitAll}
        isSubmittingAll={isSubmittingAll}
        fields={[
          {
            id: "name",
            label: "Product Name",
            required: true,
            type: "text",
            placeholder: "Enter product name",
          },
          {
            id: "category",
            label: "Category",
            type: "select",
            options: categoryNames,
            allowCustom: true,
            required: true,
          },
          {
            id: "price",
            label: "Price",
            type: "currency",
            placeholder: "Enter price (e.g., 2500)",
            required: true,
          },
          {
            id: "stock",
            label: "Stock",
            type: "number",
            placeholder: "How many units? (e.g., 15)",
            required: true,
          },
          {
            id: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter a brief description (optional)",
            required: false,
          },
        ]}
      />
    </div>
  );
}