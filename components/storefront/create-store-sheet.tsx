"use client";

import { useEffect, useState, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShoppingCart,
  SettingsIcon,
  Package,
  CreditCard,
  Truck,
  Globe,
  Loader2,
  Camera,
  X,
} from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStoreFront } from "@/hooks/use-store-front";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as yup from "yup";
import { toast } from "sonner";
import { CreateStorePayload } from "@/hooks/use-store-front";

export interface CreateStoreFormData {
  id?: number | string;
  storeName: string;
  description: string;
  slogan: string;
  category: string;
  customDomain: string;
  whatsappNumber: string;
  logoUrl?: string;
  paymentMethods: { cash: boolean; card: boolean };
  deliveryOptions: { pickup: boolean; delivery: boolean };
  status: "active" | "inactive";
  currency: string;
}

interface CreateStoreSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode?: boolean;
  initialData?: Partial<CreateStoreFormData>;
  onSubmit: (data: CreateStorePayload, logoFile?: File | null) => Promise<void>;
  isSubmitting?: boolean;
}

const defaultFormData: CreateStoreFormData = {
  storeName: "",
  description: "",
  slogan: "",
  category: "",
  customDomain: "",
  whatsappNumber: "",
  paymentMethods: { cash: false, card: false },
  deliveryOptions: { pickup: false, delivery: false },
  status: "active",
  currency: "NGN",
};

const storeSchema = yup.object().shape({
  storeName: yup.string().required("Store name is required"),
  description: yup.string().required("Description is required"),
  category: yup.string().required("Category is required"),
  whatsappNumber: yup
    .string()
    .required("WhatsApp number is required")
    .matches(/^0\d{10}$/, "Must be a valid 11-digit number starting with 0"),
  currency: yup.string().required("Currency is required"),
});

export function CreateStoreSheet({
  isOpen,
  onOpenChange,
  isEditMode = false,
  initialData,
  onSubmit,
  isSubmitting = false,
}: CreateStoreSheetProps) {
  const [formData, setFormData] = useState<CreateStoreFormData>(defaultFormData);
  const [uiOptions, setUiOptions] = useState({
    paystack: false,
    bankTransfer: false,
    cashOnDelivery: false,
    inHouse: false,
    thirdParty: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initializedForRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadStoreLogo, isUploadingLogo, activeStore } = useStoreFront();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialData?.logoUrl) {
      setLogoPreview(initialData.logoUrl);
    } else {
      setLogoPreview(null);
    }
    setLogoFile(null); // Reset when data changes
  }, [initialData?.logoUrl]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(file, "file")
    setLogoFile(file);

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // If in edit mode, upload immediately
    if (isEditMode) {
      const storeIdToUse = formData.id || activeStore?.id;
      if (!storeIdToUse) {
        toast.error("Store ID not found");
        return;
      }

      const uploadData = new FormData();
      uploadData.append("image", file);

      try {
        console.log("Uploading logo for storeId:", storeIdToUse);
        const updatedStore = await uploadStoreLogo({ storeId: storeIdToUse, formData: uploadData });
        if (updatedStore?.logoUrl) {
          setLogoPreview(updatedStore.logoUrl);
        }
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Create a unique key for this initialization session
      const currentKey = isEditMode ? `edit-${initialData?.storeName}` : "new";
      
      // Only initialize if we haven't already for this session
      if (initializedForRef.current !== currentKey) {
        console.log("CreateStoreSheet initializing with:", initialData);
        if (isEditMode && initialData) {
          // Format whatsapp from +234... to 0... for display
          setFormData({
            ...defaultFormData,
            ...initialData,
            whatsappNumber: initialData.whatsappNumber?.startsWith("+234") 
              ? "0" + initialData.whatsappNumber.slice(4) 
              : initialData.whatsappNumber || "",
            paymentMethods: {
              cash: false,
              card: false,
              ...initialData.paymentMethods,
            },
            deliveryOptions: {
              pickup: false,
              delivery: false,
              ...initialData.deliveryOptions,
            },
          });

          setUiOptions({
            paystack: initialData.paymentMethods?.card || false,
            bankTransfer: initialData.paymentMethods?.cash || false,
            cashOnDelivery: false,
            inHouse: initialData.deliveryOptions?.pickup || false,
            thirdParty: initialData.deliveryOptions?.delivery ? ["external"] : [],
          });
        } else {
          setFormData(defaultFormData);
          setUiOptions({
            paystack: false,
            bankTransfer: false,
            cashOnDelivery: false,
            inHouse: false,
            thirdParty: [],
          });
        }
        initializedForRef.current = currentKey;
      }
      setErrors({});
    } else {
      initializedForRef.current = null;
    }
  }, [isOpen, initialData, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await storeSchema.validate(formData, { abortEarly: false });

      const hasPayment = uiOptions.paystack || uiOptions.bankTransfer || uiOptions.cashOnDelivery;
      const hasDelivery = uiOptions.inHouse || uiOptions.thirdParty.length > 0;
      
      const newErrors: Record<string, string> = {};
      if (!hasPayment) newErrors.paymentMethods = "At least one payment method is required";
      if (!hasDelivery) newErrors.deliveryOptions = "At least one delivery option is required";
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Please complete the form requirements");
        return;
      }

      setErrors({});

      // Transform 0xxx... to +234xxx...
      const formattedWhatsApp = formData.whatsappNumber.startsWith("0")
        ? `+234${formData.whatsappNumber.slice(1)}`
        : formData.whatsappNumber;

      const payload: CreateStorePayload = {
        storeName: formData.storeName,
        description: formData.description,
        slogan: formData.slogan,
        category: formData.category,
        customDomain: formData.customDomain,
        currency: formData.currency,
        status: formData.status,
        phone: formattedWhatsApp,
        paymentMethods: {
          card: uiOptions.paystack,
          cash: uiOptions.bankTransfer || uiOptions.cashOnDelivery,
        },
        deliveryOptions: {
          pickup: uiOptions.inHouse,
          delivery: uiOptions.thirdParty.length > 0,
        },
      };
      await onSubmit(payload, logoFile);
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path) validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
        toast.error("Please fix the errors in the form");
      } else {
        console.error("Non-validation error in handleSubmit:", err);
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const categories = [
    { id: "food", label: "Food & Beverages" },
    { id: "electronics", label: "Electronics" },
    { id: "health", label: "Health & Beauty" },
    { id: "clothing", label: "Clothing & Accessories" },
    { id: "home", label: "Home & Garden" },
    { id: "books", label: "Books & Media" },
  ];

  const thirdPartyServices = [
    { id: "gokada", label: "Gokada" },
    { id: "bolt", label: "Bolt Food" },
    { id: "jumia", label: "Jumia Food" },
    { id: "glovo", label: "Glovo" },
  ];

  const handleThirdPartyChange = (serviceId: string, checked: boolean) => {
    setUiOptions((prev) => ({
      ...prev,
      thirdParty: checked
        ? [...prev.thirdParty, serviceId]
        : prev.thirdParty.filter((id) => id !== serviceId),
    }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="sm:max-w-[540px] p-0 flex flex-col h-full h-[100dvh] bg-white outline-none"
      >
        <SheetHeader className="p-6 border-b shrink-0">
          <SheetTitle className="text-xl font-bold">
            {isEditMode ? "Edit Store Info" : "Create New Store"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Update your store configuration and preferences."
              : "Configure your new online store by mirroring your onboarding setup."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
            <div className="space-y-8 p-6">
              {/* Step 2 mirrored: Store Setup */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 py-4 border-b border-dashed mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-lg text-slate-900">Store Setup</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">Configure your basic store details and identity.</p>
                  </div>

                  {/* Smaller Logo Upload Section in Top Right */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div 
                      className="relative group cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 group-hover:border-blue-400 transition-colors bg-gray-50 flex items-center justify-center overflow-hidden">
                        {logoPreview ? (
                          <Image 
                            src={logoPreview} 
                            alt="Logo Preview" 
                            width={64} 
                            height={64} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500">
                            <Camera className="w-5 h-5 mb-0.5" />
                            <span className="text-[8px] font-medium">Logo</span>
                          </div>
                        )}
                      </div>
                      
                      {isUploadingLogo && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        </div>
                      )}

                      <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-gray-100 text-blue-600 group-hover:bg-blue-50">
                        <Camera className="w-3 h-3" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    <p className="text-[8px] text-gray-400 mt-1 text-center whitespace-nowrap">Square, max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name*</Label>
                    <Input
                      id="storeName"
                      placeholder="My Store Name"
                      className={errors.storeName ? "border-red-500 focus-visible:ring-red-500" : ""}
                      value={formData.storeName}
                      onChange={(e) =>
                        setFormData({ ...formData, storeName: e.target.value })
                      }
                    />
                    {errors.storeName && (
                      <p className="text-xs text-red-500 mt-1">{errors.storeName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slogan">Slogan (Optional)</Label>
                    <Input
                      id="slogan"
                      placeholder="Fresh and fast"
                      className={errors.slogan ? "border-red-500 focus-visible:ring-red-500" : ""}
                      value={formData.slogan}
                      onChange={(e) =>
                        setFormData({ ...formData, slogan: e.target.value })
                      }
                    />
                    {errors.slogan && (
                      <p className="text-xs text-red-500 mt-1">{errors.slogan}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="category">Store Category*</Label>
                      {formData.category === "others" || !categories.find(c => c.id === formData.category) && formData.category !== "" ? (
                        <Button 
                          type="button" 
                          variant="link" 
                          className="h-auto p-0 text-xs"
                          onClick={() => setFormData({ ...formData, category: "" })}
                        >
                          Back to options
                        </Button>
                      ) : null}
                    </div>
                    
                    {categories.find(c => c.id === formData.category) || formData.category === "" ? (
                      <Select
                        value={formData.category}
                        onValueChange={(val) =>
                          setFormData({ ...formData, category: val })
                        }
                      >
                        <SelectTrigger className={`w-full ${errors.category ? "border-red-500" : ""}`}>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="others">Others (Type custom)</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Type your category"
                        value={formData.category === "others" ? "" : formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={errors.category ? "border-red-500" : ""}
                        autoFocus
                      />
                    )}
                    {errors.category && (
                      <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                    )}
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                    <div className={`flex items-center gap-2 border rounded-md px-3 bg-gray-50/50 ${errors.customDomain ? "border-red-500" : ""}`}>
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <Input
                        id="customDomain"
                        className="border-0 bg-transparent px-0 focus-visible:ring-0"
                        placeholder="yourstore.com"
                        value={formData.customDomain}
                        onChange={(e) =>
                          setFormData({ ...formData, customDomain: e.target.value })
                        }
                      />
                    </div>
                    {errors.customDomain && (
                      <p className="text-xs text-red-500 mt-1">{errors.customDomain}</p>
                    )}
                  </div> */}
                  
                </div>

                <div className="space-y-2 w-full">
                    <Label htmlFor="currency">Currency*</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(val) =>
                        setFormData({ ...formData, currency: val })
                      }
                    >
                      <SelectTrigger className={`w-[100%] ${errors.currency ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.currency && (
                      <p className="text-xs text-red-500 mt-1">{errors.currency}</p>
                    )}
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">Store WhatsApp Number*</Label>
                  <Input
                    id="whatsappNumber"
                    placeholder="e.g. 08123456789"
                    className={errors.whatsappNumber ? "border-red-500 focus-visible:ring-red-500" : ""}
                    value={formData.whatsappNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsappNumber: e.target.value })
                    }
                  />
                  {errors.whatsappNumber && (
                    <p className="text-xs text-red-500 mt-1">{errors.whatsappNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (About the store)*</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe what your store sells..."
                    className={`min-h-[80px] ${errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="rounded-lg bg-[#D8DFFB] p-4">
                  <div className="flex gap-3">
                    <ShoppingCart className="w-5 h-5 text-[#365BEB]" />
                    <div>
                      <h4 className="font-medium text-[#202E4B] pb-1 text-[14px]">
                        Store Features
                      </h4>
                      <p className="text-[12px] text-[#202E4B]">
                        Your store will include product management, order
                        tracking, customer accounts, and analytics dashboards to
                        help you grow your business.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Step 3 mirrored: Payment & Delivery */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900">Payment & Delivery</h3>
                </div>

                <div className="space-y-4">
                  <Label className={`text-base font-medium ${errors.paymentMethods ? "text-red-500" : ""}`}>
                    Payment Methods*
                  </Label>
                  <div className={`space-y-3 p-1 rounded-lg ${errors.paymentMethods ? "border border-red-200 bg-red-50/20" : ""}`}>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 bg-white">
                      <Checkbox
                        id="paystack"
                        checked={uiOptions.paystack}
                        onCheckedChange={(c) => setUiOptions({...uiOptions, paystack: !!c})}
                      />
                      <div className="flex flex-col">
                        <Label htmlFor="paystack" className="font-medium cursor-pointer">Paystack</Label>
                        <span className="text-xs text-muted-foreground">Accept card payments online via Paystack</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id="bankTransfer"
                        checked={uiOptions.bankTransfer}
                        onCheckedChange={(c) => setUiOptions({...uiOptions, bankTransfer: !!c})}
                      />
                      <div className="flex flex-col">
                        <Label htmlFor="bankTransfer" className="font-medium cursor-pointer">Bank Transfer</Label>
                        <span className="text-xs text-muted-foreground">Customers can pay direct to your account</span>
                      </div>
                    </div>
                  </div>
                  {errors.paymentMethods && (
                    <p className="text-xs text-red-500">{errors.paymentMethods}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label className={`text-base font-medium ${errors.deliveryOptions ? "text-red-500" : ""}`}>
                    Delivery Options*
                  </Label>
                  <div className={`space-y-3 p-1 rounded-lg ${errors.deliveryOptions ? "border border-red-200 bg-red-50/20" : ""}`}>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-blue-50/50 border-blue-100 bg-white">
                      <Checkbox
                        id="inHouse"
                        checked={uiOptions.inHouse}
                        onCheckedChange={(c) => setUiOptions({...uiOptions, inHouse: !!c})}
                      />
                      <Label htmlFor="inHouse" className="font-medium cursor-pointer flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        In-house Delivery
                      </Label>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Third-Party Services
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {thirdPartyServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center space-x-3 p-2 border rounded-md hover:bg-gray-50"
                          >
                            <Checkbox
                              id={service.id}
                              checked={uiOptions.thirdParty.includes(service.id)}
                              onCheckedChange={(c) =>
                                handleThirdPartyChange(service.id, !!c)
                              }
                            />
                            <Label htmlFor={service.id} className="text-sm cursor-pointer">{service.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {errors.deliveryOptions && (
                    <p className="text-xs text-red-500">{errors.deliveryOptions}</p>
                  )}
                </div>

                <div className="rounded-lg bg-[#D8DFFB] p-4 pb-8">
                  <div className="flex gap-3">
                    <SettingsIcon className="w-5 h-5 text-[#365BEB]" />
                    <div>
                      <h4 className="font-medium text-[#202E4B] pb-1 text-[14px]">
                        Delivery Setup
                      </h4>
                      <p className="text-[12px] text-[#202E4B]">
                        Configure your delivery options to ensure smooth order
                        fulfillment. You can add more options later in your
                        store settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50 shrink-0 flex gap-4 mt-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-full py-6"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-full py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditMode ? (
                "Update Store"
              ) : (
                "Create Store"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
