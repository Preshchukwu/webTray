"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useCategory } from "@/hooks/use-category";
import { useProduct } from "@/hooks/use-product";
import { PageHeader } from "@/components/page-header";
import { ModalForm } from "@/components/modal-form";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import * as yup from "yup";
import { categorySchema } from "@/schemas/category.schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CategoriesPage() {
  const router = useRouter();
  const { activeStore, user } = useAuthStore();
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    isAddingCategory,
    isUpdatingCategory,
    isDeletingCategory,
    isFetchingCategories,
  } = useCategory();
  
  const { products } = useProduct();

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: number;
    name: string;
    description: string;
  } | null>(null);
  const [shouldClearForm, setShouldClearForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  const storeId = activeStore?.id;

  // Calculate product count per category
  const categoryProductCounts = useMemo(() => {
    if (!products) return {};
    
    const counts: Record<number, number> = {};
    products.forEach((product) => {
      counts[product.categoryId] = (counts[product.categoryId] || 0) + 1;
    });
    
    return counts;
  }, [products]);

  const handleBack = () => {
    router.back();
  };

  const validateForm = async (data: Record<string, unknown>) => {
    try {
      await categorySchema.validate(data, { abortEarly: false });
      return {};
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        return errors;
      }
      return {};
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!storeId) {
      toast.error("No active store selected");
      return;
    }

    try {
      setValidationErrors({});

      const errors = await validateForm(data);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      const validatedData = await categorySchema.validate(data);

      if (isEditing && editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          name: validatedData.name,
          description: validatedData.description || "",
          storeId: storeId,
        });
      } else {
        const categoryPayload = {
          storeId: storeId,
          name: validatedData.name,
          description: validatedData.description || "",
        };
        await addCategory(categoryPayload);
      }

      setIsOpen(false);
      setShouldClearForm(true);
      setIsEditing(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error("Failed to save category. Please try again.");
    }
  };

  const handleAddCategory = () => {
    if (!user?.business) {
      toast.error("Please register your business to carry out this action");
      return;
    }
    setIsEditing(false);
    setEditingCategory(null);
    setValidationErrors({});
    setShouldClearForm(false);
    setIsOpen(true);
  };

  const handleEditCategory = (category: {
    id: number;
    name: string;
    description: string;
  }) => {
    setIsEditing(true);
    setEditingCategory(category);
    setValidationErrors({});
    setShouldClearForm(false);
    setIsOpen(true);
  };

  const handleDeleteClick = (categoryId: number) => {
    // Check if category has products
    const productCount = categoryProductCounts[categoryId] || 0;
    if (productCount > 0) {
      toast.error(`Cannot delete category with ${productCount} product(s). Please remove or reassign products first.`);
      return;
    }
    
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete);
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  const handleModalClose = () => {
    setIsOpen(false);
    setValidationErrors({});
    setShouldClearForm(false);
    setIsEditing(false);
    setEditingCategory(null);
  };

  if (isFetchingCategories) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="border p-6 rounded-xl">
        {/* Header */}
        <PageHeader
          title={`Product Categories (${categories?.length || 0})`}
          subtitle="Manage your inventory categories"
          onAddClick={handleAddCategory}
          addLabel="Add Category"
        />

        {/* Categories Grid */}
        <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-3">
          {categories?.map((category) => (
            <div
              key={category.id}
              className="border rounded-lg p-4 bg-card"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 leading-[100%]">
                  <h3 className="font-bold text-[#4D4D4D] text-[16px]">
                    {category.name}
                  </h3>
                  <p className="text-sm font-normal text-[#4D4D4D] mt-1">
                    {category.description || "No description"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditCategory(category)}
                    disabled={isUpdatingCategory}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(category.id)}
                    disabled={isDeletingCategory}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm font-normal text-[#808080]">
                  Products:{" "}
                  <span className="font-medium text-[20px] text-[#1A1A1A]">
                    {categoryProductCounts[category.id] || 0}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {categories?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No categories yet</p>
            <Button onClick={handleAddCategory}>Add Your First Category</Button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <ModalForm
        isOpen={isOpen}
        onOpenChange={handleModalClose}
        title={isEditing ? "Edit Category" : "Create New Category"}
        submitLabel={
          isAddingCategory || isUpdatingCategory
            ? "Saving..."
            : isEditing
            ? "Update Category"
            : "Create Category"
        }
        showImageUpload={false}
        onSubmit={handleSubmit}
        validationErrors={validationErrors}
        shouldClearForm={shouldClearForm}
        onFormCleared={() => setShouldClearForm(false)}
        initialData={
          editingCategory
            ? {
                name: editingCategory.name,
                description: editingCategory.description,
              }
            : {}
        }
        fields={[
          {
            id: "name",
            label: "Category Name",
            required: true,
            placeholder: "Enter category name",
          },
          {
            id: "description",
            label: "Description (Optional)",
            required: false,
            placeholder: "Enter category description",
            type: "textarea",
          },
        ]}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category and remove it from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeletingCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingCategory ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}