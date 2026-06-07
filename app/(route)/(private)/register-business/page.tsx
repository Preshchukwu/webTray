"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import * as yup from "yup";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  ShoppingCart,
  Check,
  SettingsIcon,
  AlertCircle,
  Camera,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useStoreFront } from "@/hooks/use-store-front";

// Yup validation schemas
const step1Schema = yup.object().shape({
  businessName: yup
    .string()
    .min(2, "Business name must be at least 2 characters")
    .required("Business name is required"),
  businessType: yup
    .string()
    .min(1, "Please select a business type")
    .required("Business type is required"),
  description: yup
    .string()
    .min(10, "Description must be at least 10 characters")
    .required("Description is required"),
  // category: yup.object().shape({
  //   main: yup
  //     .array()
  //     .of(yup.string())
  // }),
  address: yup
    .string()
    .min(5, "Please enter a valid address")
    .required("Address is required"),
  contactInfo: yup.object().shape({
    phone: yup
      .string()
      .matches(/^(0|(\+234))\d{10}$/, "Please enter a valid Nigerian phone number (e.g., 07038172430 or +2347038172430)")
      .required("Phone number is required"),
    email: yup
      .string()
      .email("Please enter a valid email address")
      .required("Email is required"),
  }),
});

const step2Schema = yup.object().shape({
  storeName: yup
    .string()
    .min(2, "Store name must be at least 2 characters")
    .required("Store name is required"),
  slogan: yup.string().optional(),
  customeDomain: yup.string().optional(),
  storeCategory: yup.string().required("Store category is required"),
  currency: yup
    .string()
    .min(1, "Please select a currency")
    .required("Currency is required"),
  whatsappNumber: yup
    .string()
    .matches(/^(0|(\+234))\d{10}$/, "Please enter a valid 11-digit number")
    .required("WhatsApp number is required"),
});

const step3Schema = yup.object().shape({
  paymentMethods: yup
    .object()
    .shape({
      paystack: yup.boolean(),
      bankTransfer: yup.boolean(),
      cashOnDelivery: yup.boolean(),
    })
    .test(
      "at-least-one-payment",
      "Please select at least one payment method",
      (value) => value?.paystack || value?.bankTransfer || value?.cashOnDelivery
    ),
  deliveryOptions: yup
    .object()
    .shape({
      inHouse: yup.boolean(),
      thirdParty: yup.array().of(yup.string()),
    })
    .test(
      "at-least-one-delivery",
      "Please select at least one delivery option",
      (value) =>
        value?.inHouse || (value?.thirdParty && value.thirdParty.length > 0)
    ),
});

const fullFormSchema = step1Schema.concat(step2Schema).concat(step3Schema);

type FormData = {
  businessName: string;
  businessType: string;
  description: string;
  // category: {
  //   main: string[];
  // };
  address: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  storeName: string;
  slogan?: string;
  customeDomain?: string;
  storeCategory: string;
  currency: string;
  whatsappNumber: string;
  paymentMethods: {
    paystack: boolean;
    bankTransfer: boolean;
    cashOnDelivery: boolean;
  };
  deliveryOptions: {
    inHouse: boolean;
    thirdParty: string[];
  };
};

type ValidationErrors = Partial<Record<keyof FormData | string, string>>;

export default function WebTrayOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const { registerBusiness, isRegisteringBusiness } = useUser();
  const { uploadStoreLogo, isUploadingLogo } = useStoreFront();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [customBusinessCategory, setCustomBusinessCategory] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Guard: Redirect if business is already registered
  useEffect(() => {
    if (user?.business) {
      router.replace("/dashboard");
    }
  }, [user, router]);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  

  const [formData, setFormData] = useState<FormData>({
    // Step 1 data
    businessName: "",
    businessType: "",
    description: "",
    // category: {
    //   main: [],
    // },
    address: "",
    contactInfo: {
      phone: "",
      email: "",
    },
    // Step 2 data
    storeName: "",
    slogan: "",
    customeDomain: "",
    storeCategory: "",
    currency: "NGN",
    whatsappNumber: "",
    // Step 3 data
    paymentMethods: {
      paystack: false,
      bankTransfer: false,
      cashOnDelivery: false,
    },
    deliveryOptions: {
      inHouse: false,
      thirdParty: [],
    },
  });

  // Step completion logic
  const isStep1Complete = useMemo(() => {
    try {
      // const hasCategory = formData.category.main.length > 0 || customBusinessCategory.trim().length > 0;
      // if (!hasCategory) return false;
      return step1Schema.isValidSync(formData);
    } catch (e) {
      return false;
    }
  }, [formData]); // removed customBusinessCategory as dependency

  const isStep2Complete = useMemo(() => {
    try {
      return step2Schema.isValidSync(formData);
    } catch (e) {
      return false;
    }
  }, [formData]);

  const isStep3Complete = useMemo(() => {
    try {
      return step3Schema.isValidSync(formData);
    } catch (e) {
      return false;
    }
  }, [formData]);

  // Validate individual fields on blur/change
  const validateField = async (
    fieldPath: string,
    value:
      | string
      | string[]
      | {
          paystack: boolean;
          bankTransfer: boolean;
          cashOnDelivery: boolean;
        }
      | {
          inHouse: boolean;
          thirdParty: string[];
        }
  ) => {
    try {
      if (fieldPath === "businessName") {
        await yup
          .string()
          .min(2, "Business name must be at least 2 characters")
          .required("Business name is required")
          .validate(value as string);
      } else if (fieldPath === "businessType") {
        await yup
          .string()
          .min(1, "Please select a business type")
          .required("Business type is required")
          .validate(value as string);
      } else if (fieldPath === "description") {
        await yup
          .string()
          .min(10, "Description must be at least 10 characters")
          .required("Description is required")
          .validate(value as string);
      } else if (fieldPath === "address") {
        await yup
          .string()
          .min(5, "Please enter a valid address")
          .required("Address is required")
          .validate(value as string);
      } else if (fieldPath === "contactInfo.phone") {
        await yup
          .string()
          .matches(/^(0|(\+234))\d{10}$/, "Please enter a valid Nigerian phone number (e.g., 07038172430 or +2347038172430)")
          .required("Phone number is required")
          .validate(value as string);
      } else if (fieldPath === "contactInfo.email") {
        await yup
          .string()
          .email("Please enter a valid email address")
          .required("Email is required")
          .validate(value as string);
      } else if (fieldPath === "storeName") {
        await yup
          .string()
          .min(2, "Store name must be at least 2 characters")
          .required("Store name is required")
          .validate(value as string);
      } else if (fieldPath === "storeCategory") {
        await yup
          .string()
          .required("Store category is required")
          .validate(value as string);
      } else if (fieldPath === "currency") {
        await yup
          .string()
          .min(1, "Please select a currency")
          .required("Currency is required")
          .validate(value as string);
      } else if (fieldPath === "whatsappNumber") {
        await yup
          .string()
          .matches(/^(0|(\+234))\d{10}$/, "Please enter a valid 11-digit number")
          .required("WhatsApp number is required")
          .validate(value as string);
      // } else if (fieldPath === "category.main") {
      //   await yup
      //     .array()
      //     .of(yup.string())
      //     .optional()
      //     .min(1, "Please select at least one category")
      //     .validate(value as string[]);
      } else if (fieldPath === "paymentMethods") {
        const paymentMethods = value as {
          paystack: boolean;
          bankTransfer: boolean;
          cashOnDelivery: boolean;
        };
        if (
          !paymentMethods.paystack &&
          !paymentMethods.bankTransfer &&
          !paymentMethods.cashOnDelivery
        ) {
          throw new yup.ValidationError(
            "Please select at least one payment method"
          );
        }
      } else if (fieldPath === "deliveryOptions") {
        const deliveryOptions = value as {
          inHouse: boolean;
          thirdParty: string[];
        };
        if (
          !deliveryOptions.inHouse &&
          deliveryOptions.thirdParty.length === 0
        ) {
          throw new yup.ValidationError(
            "Please select at least one delivery option"
          );
        }
      }

      // Clear error if validation passes
      setFieldErrors((prev) => ({ ...prev, [fieldPath]: undefined }));
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setFieldErrors((prev) => ({ ...prev, [fieldPath]: error.message }));
      }
    }
  };

  // Check if all required fields are filled for final submission
  const validateAllFields = async () => {
    try {
      // const hasCategory = formData.category.main.length > 0 || customBusinessCategory.trim().length > 0;
      // if (!hasCategory) {
      //   setFieldErrors((prev) => ({ ...prev, "category.main": "Please select at least one category or enter a custom one" }));
      //   return false;
      // }

      await fullFormSchema.validate(formData, { abortEarly: false });
      return true;
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors: ValidationErrors = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        setFieldErrors(errors);

        // Mark all fields as touched to show errors
        const allFields = new Set([
          "businessName",
          "businessType",
          "description",
          "address",
          "contactInfo.phone",
          "contactInfo.email",
          // "category.main",
          "storeName",
          "storeCategory",
          "currency",
          "whatsappNumber",
          "paymentMethods",
          "deliveryOptions",
        ]);
        setTouchedFields(allFields);
      }
      return false;
    }
  };

  // const handleCategoryChange = (category: string, checked: boolean) => {
  //   let newCategories: string[];
  //   if (checked) {
  //     newCategories = [...formData.category.main, category];
  //   } else {
  //     newCategories = formData.category.main.filter((c) => c !== category);
  //   }
  //   setFormData((prev) => ({
  //     ...prev,
  //     category: { main: newCategories },
  //   }));
  //   // Validate categories
  //   setTouchedFields((prev) => new Set(prev).add("category.main"));
  //   validateField("category.main", newCategories);
  // };

  const handlePaymentMethodChange = (
    method: keyof typeof formData.paymentMethods,
    checked: boolean
  ) => {
    const newPaymentMethods = {
      ...formData.paymentMethods,
      [method]: checked,
    };
    setFormData((prev) => ({
      ...prev,
      paymentMethods: newPaymentMethods,
    }));
    setTouchedFields((prev) => new Set(prev).add("paymentMethods"));
    validateField("paymentMethods", newPaymentMethods);
  };

  const handleDeliveryOptionChange = (
    option: keyof typeof formData.deliveryOptions,
    value: boolean | string[]
  ) => {
    const newDeliveryOptions = {
      ...formData.deliveryOptions,
      [option]: value,
    };
    setFormData((prev) => ({
      ...prev,
      deliveryOptions: newDeliveryOptions,
    }));
    setTouchedFields((prev) => new Set(prev).add("deliveryOptions"));
    validateField("deliveryOptions", newDeliveryOptions);
  };

  const handleThirdPartyChange = (service: string, checked: boolean) => {
    let newThirdParty: string[];
    if (checked) {
      newThirdParty = [...formData.deliveryOptions.thirdParty, service];
    } else {
      newThirdParty = formData.deliveryOptions.thirdParty.filter(
        (s) => s !== service
      );
    }
    const newDeliveryOptions = {
      ...formData.deliveryOptions,
      thirdParty: newThirdParty,
    };
    setFormData((prev) => ({
      ...prev,
      deliveryOptions: newDeliveryOptions,
    }));
    setTouchedFields((prev) => new Set(prev).add("deliveryOptions"));
    validateField("deliveryOptions", newDeliveryOptions);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof FormData] as Record<string, string>),
            [child]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
    // Mark field as touched and validate
    setTouchedFields((prev) => new Set(prev).add(field));
    validateField(field, value);
  };

  const handleInputBlur = (field: string, value: string) => {
    setTouchedFields((prev) => new Set(prev).add(field));
    validateField(field, value);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateAllFields();
    if (!isValid) {
      toast.error("Please fill all required fields", {
        description:
          "Complete all required information before submitting your registration.",
      });
      return;
    }

    try {
      // Format phone number: replace leading 0 with +234
      let formattedPhone = formData.contactInfo.phone;
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+234' + formattedPhone.slice(1);
      }

      // Prepare the payload according to the API requirements
      const payload = {
        businessName: formData.businessName,
        businessType: formData.businessType,
        description: formData.description,
        category: {
          main: "",
          // [
          //   ...formData.category.main,
          //   ...(customBusinessCategory.trim() ? [customBusinessCategory.trim()] : []),
          // ].join(", "),
        },
        address: formData.address,
        contactInfo: {
          phone: formattedPhone,
          email: formData.contactInfo.email,
        },
        status: "active",
        storeName: formData.storeName,
        slogan: formData.slogan || "",
        customeDomain: formData.customeDomain || "",
        storeCategory: formData.storeCategory,
        currency: formData.currency,
        paymentMethods: {
          paystack: formData.paymentMethods.paystack,
          bankTransfer: formData.paymentMethods.bankTransfer,
          cashOnDelivery: formData.paymentMethods.cashOnDelivery,
        },
        phone: formData.whatsappNumber.startsWith('0') 
          ? '+234' + formData.whatsappNumber.slice(1) 
          : formData.whatsappNumber,
        deliveryOptions: {
          inHouse: formData.deliveryOptions.inHouse,
          thirdParty: formData.deliveryOptions.thirdParty,
        },
      };
      const registerResponse = await registerBusiness(payload);
      
      // Sequential Logo Upload if present
      if (logoFile && registerResponse?.store?.id) {
        try {
          const uploadData = new FormData();
          uploadData.append("image", logoFile);
          await uploadStoreLogo({ storeId: registerResponse.store.id, formData: uploadData });
        } catch (uploadError) {
          console.error("Logo upload failed after registration:", uploadError);
          toast.error("Business registered, but logo upload failed. You can update it later in the dashboard.");
        }
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed", {
        description:
          "There was an error registering your business. Please try again.",
      });
    }
  };

  const getProgressValue = () => {
    switch (currentStep) {
      case 1:
        return 33;
      case 2:
        return 66;
      case 3:
        return 100;
      default:
        return 33;
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

  const currencies = [{ id: "NGN", label: "Nigerian Naira (₦)" }];

  const renderFieldError = (fieldName: string) => {
    const error = fieldErrors[fieldName];
    const isTouched = touchedFields.has(fieldName);
    if (!error || !isTouched) return null;
    return (
      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
    );
  };

  const getFieldClassName = (fieldName: string) => {
    const hasError = fieldErrors[fieldName] && touchedFields.has(fieldName);
    return hasError ? "border-red-500" : "";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="flex w-full px-2 md:w-[80%] mt-5 mx-auto items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/webtraylogo.png" width={100} height={100} alt="logo" />
          </div>
          <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
        </div>

        {/* Progress Section */}
        <div className="mt-8 px-2 w-full md:w-[70%] mx-auto">
          <div className="w-full mb-8">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              <ArrowLeft />
              Back to Dashboard
            </Button>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-[20px] font-semibold text-[#4D4D4D]">
              Welcome to WebTray
            </h1>
            <span className="text-sm text-gray-500">
              {getProgressValue()}% Complete
            </span>
          </div>
          <Progress value={getProgressValue()} className="" />

          {/* Step Indicators */}
          <div className="flex items-center justify-center my-6 gap-4">
            <div className="flex items-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  isStep1Complete || currentStep === 1
                    ? "bg-blue-600"
                    : "bg-gray-200"
                }`}
              >
                {isStep1Complete ? (
                  <Check className="h-6 w-6 text-white" />
                ) : (
                  <Package
                    className={`h-6 w-6 ${
                      currentStep === 1 ? "text-white" : "text-gray-400"
                    }`}
                  />
                )}
              </div>
            </div>
            <div className="h-px w-12 bg-gray-300" />
            <div className="flex items-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  isStep2Complete || currentStep === 2
                    ? "bg-blue-600"
                    : "border-[0.09rem]"
                }`}
              >
                {isStep2Complete ? (
                  <Check className="h-6 w-6 text-white" />
                ) : (
                  <ShoppingCart
                    className={`h-6 w-6 ${
                      currentStep === 2 ? "text-white" : "text-[#DADADA]"
                    }`}
                  />
                )}
              </div>
            </div>
            <div className="h-px w-12 bg-gray-300" />
            <div className="flex items-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  isStep3Complete || currentStep === 3
                    ? "bg-blue-600"
                    : "border-[0.09rem]"
                }`}
              >
                {isStep3Complete ? (
                  <Check className="h-6 w-6 text-white" />
                ) : (
                  <SettingsIcon
                    className={`h-6 w-6 ${
                      currentStep === 3 ? "text-white" : "text-[#DADADA]"
                    }`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <Card className="bg-gray-50 px-0 border-[0.08rem] shadow-none border-[#EBEBEB] rounded-md">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Business Information</CardTitle>
                <CardDescription>Tell us about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-2 md:px-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name*</Label>
                    <Input
                      id="business-name"
                      placeholder="Enter your business name"
                      value={formData.businessName}
                      onChange={(e) =>
                        handleInputChange("businessName", e.target.value)
                      }
                      onBlur={(e) =>
                        handleInputBlur("businessName", e.target.value)
                      }
                      className={`w-full ${getFieldClassName("businessName")}`}
                      required
                    />
                    {renderFieldError("businessName")}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="business-type">Business Type*</Label>
                      {formData.businessType !== "" && !["retail", "restaurant", "service", "manufacturing", "wholesale"].includes(formData.businessType) ? (
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto p-0 text-xs"
                          onClick={() => handleInputChange("businessType", "")}
                        >
                          Back to options
                        </Button>
                      ) : null}
                    </div>
                    
                    {["retail", "restaurant", "service", "manufacturing", "wholesale", ""].includes(formData.businessType) ? (
                      <Select
                        value={formData.businessType}
                        onValueChange={(value) => {
                          handleInputChange("businessType", value);
                          handleInputBlur("businessType", value);
                        }}
                        required
                      >
                        <SelectTrigger
                          className={`w-full ${getFieldClassName(
                            "businessType"
                          )}`}
                        >
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="manufacturing">
                            Manufacturing
                          </SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                          <SelectItem value="others">Others (Type custom)</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Type your business type"
                        value={formData.businessType === "others" ? "" : formData.businessType}
                        onChange={(e) => handleInputChange("businessType", e.target.value)}
                        onBlur={(e) => handleInputBlur("businessType", e.target.value)}
                        className={`w-full ${getFieldClassName("businessType")}`}
                        autoFocus
                      />
                    )}
                    {renderFieldError("businessType")}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description*</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your business"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    onBlur={(e) =>
                      handleInputBlur("description", e.target.value)
                    }
                    className={`w-full ${getFieldClassName("description")}`}
                    required
                  />
                  {renderFieldError("description")}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address*</Label>
                  <Input
                    id="address"
                    placeholder="Enter your business address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    onBlur={(e) => handleInputBlur("address", e.target.value)}
                    className={`w-full ${getFieldClassName("address")}`}
                    required
                  />
                  {renderFieldError("address")}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number*</Label>
                    <Input
                      id="phone"
                      placeholder="07038172430"
                      value={formData.contactInfo.phone}
                      onChange={(e) =>
                        handleInputChange("contactInfo.phone", e.target.value)
                      }
                      onBlur={(e) =>
                        handleInputBlur("contactInfo.phone", e.target.value)
                      }
                      className={`w-full ${getFieldClassName("contactInfo.phone")}`}
                      required
                    />
                    {renderFieldError("contactInfo.phone")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address*</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="info@yourbusiness.com"
                      value={formData.contactInfo.email}
                      onChange={(e) =>
                        handleInputChange("contactInfo.email", e.target.value)
                      }
                      onBlur={(e) =>
                        handleInputBlur("contactInfo.email", e.target.value)
                      }
                      className={`w-full ${getFieldClassName("contactInfo.email")}`}
                      required
                    />
                    {renderFieldError("contactInfo.email")}
                  </div>
                </div>

                {/* <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Business Categories*
                  </Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      {categories.slice(0, 3).map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={category.id}
                            checked={formData.category.main.includes(
                              category.id
                            )}
                            onCheckedChange={(checked) =>
                              handleCategoryChange(
                                category.id,
                                checked as boolean
                              )
                            }
                          />
                          <Label
                            htmlFor={category.id}
                            className="text-sm font-normal"
                          >
                            {category.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {categories.slice(3).map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={category.id}
                            checked={formData.category.main.includes(
                              category.id
                            )}
                            onCheckedChange={(checked) =>
                              handleCategoryChange(
                                category.id,
                                checked as boolean
                              )
                            }
                          />
                          <Label
                            htmlFor={category.id}
                            className="text-sm font-normal"
                          >
                            {category.label}
                          </Label>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 pt-2">
                        {!customBusinessCategory ? (
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => setCustomBusinessCategory(" ")}
                          >
                            Others
                          </Button>
                        ) : (
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-gray-500">Custom Category</Label>
                              <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-xs"
                                onClick={() => setCustomBusinessCategory("")}
                              >
                                Cancel
                              </Button>
                            </div>
                            <Input
                              placeholder="Type your category..."
                              value={customBusinessCategory.trim()}
                              onChange={(e) => setCustomBusinessCategory(e.target.value)}
                              className="w-full h-8 text-sm"
                              autoFocus
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {renderFieldError("category.main")}
                </div> */}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Store Setup */}
          {currentStep === 2 && (
            <Card className="bg-gray-50 border-[0.08rem] shadow-none border-[#EBEBEB] rounded-md">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Store Setup</CardTitle>
                <CardDescription>Configure your online store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-2 md:px-6">
                {/* Store Logo Upload Area */}
                <div className="flex flex-col items-center justify-center py-4 border-b border-dashed mb-6">
                  <div 
                    className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 group cursor-pointer hover:border-blue-400 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        {formData.storeName ? (
                          <span className="text-2xl font-bold text-blue-600 bg-blue-50 w-full h-full flex items-center justify-center">
                            {formData.storeName.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <Package className="w-8 h-8" />
                        )}
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>

                    {isUploadingLogo && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setLogoPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  
                  <div className="text-center mt-3">
                    <p className="text-sm font-medium text-gray-700">Store Logo</p>
                    <p className="text-xs text-gray-500">Recommended: Square, max 2MB</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Store Name*</Label>
                    <Input
                      id="store-name"
                      placeholder="Enter your store name"
                      value={formData.storeName}
                      onChange={(e) =>
                        handleInputChange("storeName", e.target.value)
                      }
                      onBlur={(e) =>
                        handleInputBlur("storeName", e.target.value)
                      }
                      className={`w-full ${getFieldClassName("storeName")}`}
                      required
                    />
                    {renderFieldError("storeName")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slogan">Slogan (Optional)</Label>
                    <Input
                      id="slogan"
                      placeholder="Your catchy slogan"
                      value={formData.slogan}
                      onChange={(e) =>
                        handleInputChange("slogan", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-1">
                  {/* <div className="space-y-2">
                    <Label htmlFor="domain">Custom Domain (Optional)</Label>
                    <Input
                      id="domain"
                      placeholder="yourstore.com"
                      value={formData.customeDomain}
                      onChange={(e) =>
                        handleInputChange("customeDomain", e.target.value)
                      }
                    />
                  </div> */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="storeCategory">Store Category*</Label>
                      {formData.storeCategory === "others" || !categories.find(c => c.id === formData.storeCategory) && formData.storeCategory !== "" ? (
                        <Button 
                          type="button" 
                          variant="link" 
                          className="h-auto p-0 text-xs"
                          onClick={() => {
                            handleInputChange("storeCategory", "");
                            handleInputBlur("storeCategory", "");
                          }}
                        >
                          Back to options
                        </Button>
                      ) : null}
                    </div>

                    {categories.find(c => c.id === formData.storeCategory) || formData.storeCategory === "" ? (
                      <Select
                        value={formData.storeCategory}
                        onValueChange={(value) => {
                          handleInputChange("storeCategory", value);
                          handleInputBlur("storeCategory", value);
                        }}
                      >
                        <SelectTrigger
                          className={`w-full ${getFieldClassName("storeCategory")}`}
                        >
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
                        value={formData.storeCategory === "others" ? "" : formData.storeCategory}
                        onChange={(e) => {
                          handleInputChange("storeCategory", e.target.value);
                        }}
                        onBlur={(e) => {
                          handleInputBlur("storeCategory", e.target.value);
                        }}
                        className={`w-full ${getFieldClassName("storeCategory")}`}
                        autoFocus
                      />
                    )}
                    {renderFieldError("storeCategory")}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency*</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => {
                        handleInputChange("currency", value);
                        handleInputBlur("currency", value);
                      }}
                    >
                      <SelectTrigger
                        className={`w-full ${getFieldClassName("currency")}`}
                      >
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.id} value={currency.id}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {renderFieldError("currency")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number*</Label>
                    <Input
                      id="whatsapp"
                      placeholder="07038172450"
                      value={formData.whatsappNumber}
                      onChange={(e) =>
                        handleInputChange("whatsappNumber", e.target.value)
                      }
                      onBlur={(e) =>
                        handleInputBlur("whatsappNumber", e.target.value)
                      }
                      className={`w-full ${getFieldClassName("whatsappNumber")}`}
                      required
                    />
                    {renderFieldError("whatsappNumber")}
                  </div>
                </div>

                <div className="rounded-lg bg-[#D8DFFB] p-4">
                  <div className="flex gap-3">
                    <ShoppingCart className="text-[#365BEB]" />
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
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment & Delivery */}
          {currentStep === 3 && (
            <Card className="bg-gray-50 border-[0.08rem] shadow-none border-[#EBEBEB] rounded-md">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Payment & Delivery</CardTitle>
                <CardDescription>
                  {"Set up how you'll accept payments and deliver orders"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-2 md:px-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Payment Methods*
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="paystack"
                        checked={formData.paymentMethods.paystack}
                        onCheckedChange={(checked) =>
                          handlePaymentMethodChange(
                            "paystack",
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor="paystack" className="text-sm font-normal">
                        Paystack
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bank-transfer"
                        checked={formData.paymentMethods.bankTransfer}
                        onCheckedChange={(checked) =>
                          handlePaymentMethodChange(
                            "bankTransfer",
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor="bank-transfer"
                        className="text-sm font-normal"
                      >
                        Bank Transfer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cash-delivery"
                        checked={formData.paymentMethods.cashOnDelivery}
                        onCheckedChange={(checked) =>
                          handlePaymentMethodChange(
                            "cashOnDelivery",
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor="cash-delivery"
                        className="text-sm font-normal"
                      >
                        Cash on Delivery
                      </Label>
                    </div>
                  </div>
                  {renderFieldError("paymentMethods")}
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    Delivery Options*
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="in-house"
                        checked={formData.deliveryOptions.inHouse}
                        onCheckedChange={(checked) =>
                          handleDeliveryOptionChange(
                            "inHouse",
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor="in-house" className="text-sm font-normal">
                        In-house Delivery
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Third-Party Services
                      </Label>
                      <div className="grid gap-4 md:grid-cols-2">
                        {thirdPartyServices.map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={service.id}
                              checked={formData.deliveryOptions.thirdParty.includes(
                                service.id
                              )}
                              onCheckedChange={(checked) =>
                                handleThirdPartyChange(
                                  service.id,
                                  checked as boolean
                                )
                              }
                            />
                            <Label
                              htmlFor={service.id}
                              className="text-sm font-normal"
                            >
                              {service.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {renderFieldError("deliveryOptions")}
                </div>

                <div className="rounded-lg bg-[#D8DFFB] p-4">
                  <div className="flex gap-3">
                    <SettingsIcon className="w-4 h-4 text-[#365BEB]" />
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
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1 || isRegisteringBusiness}
              className="flex items-center gap-2 border-[0.09rem]"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              onClick={nextStep}
              disabled={isRegisteringBusiness}
              className="flex items-center gap-2"
            >
              {isRegisteringBusiness ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Registering...
                </>
              ) : currentStep === 3 ? (
                "Register"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
