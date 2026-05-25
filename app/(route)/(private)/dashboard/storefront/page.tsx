"use client";

import StoreFrontHeader from "@/components/storefront/store-front-header";
import { Edit, Globe, Copy, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStoreFront } from "@/hooks/use-store-front";
import { useActiveStore } from "@/hooks/use-active-store";
import { DomainSettingsSheet } from "@/components/storefront/domain-settings-sheet";
import { CreateStoreSheet, CreateStoreFormData } from "@/components/storefront/create-store-sheet";
import { useState } from "react";
import { CreateStorePayload } from "@/hooks/use-store-front";
import { Badge } from "@/components/ui/badge";
import { StoreFrontSkeleton } from "@/components/storefront/store-front-skeleton";
import { useAuthStore } from "@/store/useAuthStore";

export default function Page() {
  // Use the safe hook to get activeStore
  const { activeStore, isLoading: storeLoading } = useActiveStore();
  
  const { refreshStores } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialFormData, setInitialFormData] = useState<
    Partial<CreateStoreFormData>
  >();

  const [pendingOnlineStatus, setPendingOnlineStatus] = useState<
    boolean | null
  >(null);
  
  const [isCopied, setIsCopied] = useState(false);

  const {
    storeInfo,
    isFetchingStoreInfo,
    changeStoreStatus,
    isUpdatingStoreStatus,
    createStore,
    isCreatingStore,
    updateStore,
    isUpdatingStore,
    uploadStoreLogo,
    isUploadingLogo,
  } = useStoreFront();


 if (storeLoading || isFetchingStoreInfo) {
    return <StoreFrontSkeleton />;
  }
  // Guard: Ensure we have an active store
  if (!activeStore) {
    return (
      <div className="p-6">
        <Card className="shadow-none rounded-none">
          <CardHeader className="text-center">
            <CardTitle className="text-[#4D4D4D] font-bold text-[20px]">
              No Active Store
            </CardTitle>
            <CardDescription>
              Please select or create a store to continue.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const storeId = storeInfo?.store?.id ?? activeStore.id;
  const isStoreOnline = storeInfo?.store?.online ?? false;

  const displayOnlineStatus =
    isUpdatingStoreStatus && pendingOnlineStatus !== null
      ? pendingOnlineStatus
      : isStoreOnline;

  const handleToggleStoreOnline = async (checked: boolean) => {
    if (!storeId || isUpdatingStoreStatus) return;
    // ✅ Set pending status immediately  
    setPendingOnlineStatus(checked);

    try {
      await changeStoreStatus({ storeId, onlineStatus: checked });
      // ✅ Clear pending status on success
      setPendingOnlineStatus(null);
    } catch (err) {
      console.error("Failed to change store status:", err);
      // ✅ Clear pending status on error (will revert to actual status)
      setPendingOnlineStatus(null);
    }
  };

  const defaultDomain = `${activeStore.storeName
    ?.replace(/\s+/g, "")
    .toLowerCase()}@webtry.com`;

  const customDomain = storeInfo?.store?.customDomain || defaultDomain;
  const storeSlug = storeInfo?.store?.slug || activeStore.slug;
  const storeUrl = typeof window !== 'undefined' ? `${window.location.origin}/${storeSlug}` : "";

  const handleCopyUrl = () => {
    if (!storeUrl) return;
    navigator.clipboard.writeText(storeUrl);
    setIsCopied(true);
    toast.success("Store link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleUpdate = async (data: CreateStorePayload, logoFile?: File | null) => {
    try {
      const updated = await updateStore({ storeId, ...data });
      if (logoFile && storeId) {
        const uploadData = new FormData();
        uploadData.append("image", logoFile);
        await uploadStoreLogo({ storeId, formData: uploadData });
      }
      setIsOpen(false);
      setIsEditMode(false);
    } catch {
      // Error toast is already shown by the mutation
    }
  };

  const handleCreate = async (data: CreateStorePayload, logoFile?: File | null) => {
    try {
      const newStore = await createStore(data);
      
      if (logoFile && newStore?.id) {
        const uploadData = new FormData();
        uploadData.append("image", logoFile);
        await uploadStoreLogo({ storeId: newStore.id, formData: uploadData });
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error("Store creation flow failed:", error);
      // Error toast is already shown by the mutation
    }
  };

  const handleEditStoreClick = () => {
    setIsEditMode(true);
    // Map stored store info back to form shape
    const pm = storeInfo?.store?.paymentMethods as Record<string, boolean> | null | undefined;
    const dl = storeInfo?.store?.deliveryOptions as Record<string, unknown> | null | undefined;
    setInitialFormData({
      id: storeInfo?.store?.id || activeStore.id,
      storeName: storeInfo?.store?.storeName || activeStore.storeName || "",
      slogan: storeInfo?.store?.slogan || "",
      logoUrl: storeInfo?.store?.logoUrl || "",
      description: storeInfo?.store?.description || "",
      whatsappNumber: storeInfo?.store?.phone || "",
      customDomain: storeInfo?.store?.customDomain || "",
      category: storeInfo?.store?.category || "",
      currency: storeInfo?.store?.currency || "NGN",
      status: (storeInfo?.store?.status as "active" | "inactive") || "active",
      paymentMethods: {
        cash: pm?.cash ?? pm?.paystack ?? false,
        card: pm?.card ?? pm?.bankTransfer ?? false,
      },
      deliveryOptions: {
        pickup: !!(dl?.pickup ?? dl?.inHouse),
        delivery: !!(dl?.delivery ?? (Array.isArray(dl?.thirdParty) && dl.thirdParty.length > 0)),
      },
    });
    setIsOpen(true);
  };

  return (
    <div>
      <StoreFrontHeader />
      <div className="mt-[20px]">
        {!storeInfo ? (
          <Card className="shadow-none rounded-none">
            <CardHeader className="text-center leading-[24px]">
              <CardTitle className="text-[#4D4D4D] font-bold text-[20px]">
                No Storefronts Yet
              </CardTitle>
              <CardDescription>
                You don&apos;t have an active store yet.{" "}
                <button
                  className="text-[#365BEB] ml-1 cursor-pointer font-normal text-[16px]"
                  onClick={() => { setIsEditMode(false); setIsOpen(true); }}
                >
                  Create new store
                </button>
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card className="shadow-none rounded-none">
            <CardHeader className="leading-[24px]">
              <CardTitle className="text-[#4D4D4D] flex justify-between">
                <p className="font-bold text-[20px]">
                  {storeInfo?.store?.storeName || activeStore.storeName}
                </p>

                <div className="flex items-center gap-[8px]">
                  {isUpdatingStoreStatus ? (
                    <div className="flex items-center gap-2">
                      <p className="text-[16px] leading-[24px] font-normal">
                        Updating...
                      </p>
                      <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                    </div>
                  ) : (
                    <p className="text-[16px] leading-[24px] font-normal">
                      {isStoreOnline ? "Store online" : "Store offline"}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isStoreOnline}
                      onCheckedChange={handleToggleStoreOnline}
                      disabled={isUpdatingStoreStatus}
                      aria-label="Toggle store online"
                    />
                  </div>
                </div>
              </CardTitle>
              <CardDescription>
                Your store is live and accepting orders
              </CardDescription>
              <CardContent className="flex p-0 gap-3 items-center w-full min-w-0">
                <Badge variant="default" className="rounded-full shrink-0">
                  {isStoreOnline ? "Online" : "Offline"}
                </Badge>
                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                  <Link 
                    href={`/${storeSlug}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`flex items-center gap-1.5 min-w-0 flex-1 hover:no-underline group ${!isStoreOnline && "line-through text-gray-400 decoration-2 decoration-red-500"}`}
                  >
                    <Globe className="w-4 h-4 text-black shrink-0" />
                    <span className="truncate text-[#365BEB] text-[16px] font-normal">
                      {storeUrl}
                    </span>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-gray-600 hover:text-black shrink-0 flex items-center gap-1 border-none"
                    onClick={handleCopyUrl}
                    title="Copy store link"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-[11px] font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[11px] font-semibold">Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="container mx-auto mt-[24px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Store Information Card */}
          <Card className="flex flex-col shadow-none rounded-none">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Store Information
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Basic details about your store
                  </p>
                </div>
                {/* Store Logo */}
                <div className="shrink-0">
                  {storeInfo?.store?.logoUrl ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <Image
                        src={storeInfo.store.logoUrl}
                        alt={storeInfo.store.storeName || "Store logo"}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 shadow-sm flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xl">
                        {(storeInfo?.store?.storeName || activeStore.storeName || "S")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Store Name</h3>
                <p className="text-gray-600">
                  {storeInfo?.store?.storeName || activeStore.storeName}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Description</h3>
                <p className="text-gray-600">
                  {storeInfo?.store?.description || ""}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Domain</h3>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600 truncate">{defaultDomain}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-400 hover:text-black shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(defaultDomain);
                      toast.success("Domain copied to clipboard!");
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="pt-4">
                <Button
                  onClick={handleEditStoreClick}
                  variant="outline"
                  className="w-full rounded-full bg-transparent"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Store Info
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Two Cards Stacked */}
          <div className="space-y-6">
            {/* Manage Products Card */}
            <Card className="flex flex-col shadow-none rounded-none">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Manage Products
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Add, edit and organize your store products
                  </p>
                </div>
                <Link href="/dashboard/storefront/manage-product">
                  <Button
                    className="rounded-full border-black"
                    variant="default"
                    size="default"
                  >
                    Manage Products
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-center py-8">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {storeInfo?.productCount || 0}
                  </div>
                  <p className="text-gray-500">Products listed</p>
                </div>
              </CardContent>
            </Card>

            {/* Domain Settings Card */}
            <Card className="flex flex-col shadow-none rounded-none">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Domain Settings
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure your custom domain
                  </p>
                </div>

                <DomainSettingsSheet storeUrl={storeUrl} />
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                      {defaultDomain}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Default Domain</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CreateStoreSheet
        isOpen={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setIsEditMode(false);
            setInitialFormData(undefined);
          }
        }}
        isEditMode={isEditMode}
        initialData={initialFormData}
        onSubmit={isEditMode ? handleUpdate : handleCreate}
        isSubmitting={isEditMode ? isUpdatingStore : isCreatingStore}
      />
    </div>
  );
}
