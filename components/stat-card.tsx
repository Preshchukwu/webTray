"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { ModalForm } from "./modal-form";
import { useState } from "react";
import Link from "next/link";
import { useCategory } from "@/hooks/use-category";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { StatCardProps } from "@/types";
import { categorySchema } from "@/schemas/category.schema";
import * as yup from "yup";


export function StatCard({
  title,
  icon,
  value,
  note,
  noteColor = "text-muted-foreground",
  action,
}: StatCardProps & { action?: React.ReactNode }) {
  const { activeStore, user } = useAuthStore();
  const { addCategory, isAddingCategory, categories } = useCategory();
  const [isOpen, setIsOpen] = useState(false);
  const [shouldClearForm, setShouldClearForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const storeId = activeStore?.id;
  
  if (!storeId) {
    return null;
  }

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
    try {
      setValidationErrors({});

      const errors = await validateForm(data);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      const validatedData = await categorySchema.validate(data);
      const categoryPayload = {
        storeId: storeId,
        name: validatedData.name,
        description: validatedData.description || "",
      };

      await addCategory(categoryPayload);

      setIsOpen(false);
      setShouldClearForm(true);
    } catch (error) {
      console.error("Failed to create category:", error);
      toast.error("Failed to create category. Please try again.");
    }
  };

  const handleAddCategory = async (newCategoryName: string): Promise<boolean> => {
    if (!newCategoryName) return false;

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
        storeId: storeId!,
      });

      toast.success("Category successfully added");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to add category");
      return false;
    }
  };

  const handleAddCategoryDrawer = () => {
    if (!user?.business) {
      toast("Please Register your business to carryout this action");
      return;
    }
    setIsOpen(true);

    setValidationErrors({});
    setShouldClearForm(false);
    setIsOpen(true);
  };

  const handleModalClose = () => {
    setIsOpen(false);
    setValidationErrors({});
    setShouldClearForm(false);
  };

  return (
    <div>
      <Card className={`border-0 shadow-none`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex justify-between items-center">
            <p className={`text-xs mt-1 ${noteColor}`}>
              <span>{note}</span>
            </p>
            {action && <div className="ml-2">{action}</div>}
            {title === "Category" && !action && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="rounded-full"
                  asChild
                >
                  <Link href="/dashboard/storefront/manage-categories">
                    View
                  </Link>
                </Button>
                <Button
                variant="link"
                  size="sm"
                  className="text-blue-500 underline"
                //   className="text-white hover:bg-[#5f70b4] bg-[#365BEB] rounded-full"
                  onClick={handleAddCategoryDrawer}
                  disabled={isAddingCategory}
                >
                  {isAddingCategory ? "Adding..." : "Add New"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <ModalForm
        isOpen={isOpen}
        onOpenChange={handleModalClose}
        title="Create new category "
        submitLabel={isAddingCategory ? "Adding..." : "Create Category"}
        showImageUpload={false}
        onAddCategory={handleAddCategory}
        onSubmit={handleSubmit}
        validationErrors={validationErrors}
        shouldClearForm={shouldClearForm}
        onFormCleared={() => setShouldClearForm(false)}
        fields={[
          {
            id: "name",
            label: "Category Name",
            required: true,
            placeholder: "Enter new category name",
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
    </div>
  );
}