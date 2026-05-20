"use client";

import React, { useState, useEffect  } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CircleAlert, CheckCircle2, Zap, TrendingUp, Briefcase, Check, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { PricingPlan } from "@/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export function SubscriptionClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [subscribingTier, setSubscribingTier] = useState<string | null>(null);
  const { 
    subscription, 
    plans, 
    isFetchingPlans, 
    isFetchingSubscription,
    subscribe,
    isSubscribing,
    useVerifySubscription,
    refetchSubscription,
    history,
    isFetchingHistory,
    cancelSubscription,
    isCancelling,
  } = useSubscription();

  // Verification Logic
  const { data: verifyData, isLoading: isVerifying } = useVerifySubscription(reference || "");

  useEffect(() => {
    if (verifyData?.status === "SUCCESS") {
      toast.success("Subscription updated successfully!");
      refetchSubscription();
      // Clear the reference from URL
      router.replace("/dashboard/subscription");
    } else if (verifyData?.status === "FAILED") {
      toast.error("Subscription verification failed. Please contact support.");
      router.replace("/dashboard/subscription");
    }
  }, [verifyData, refetchSubscription, router]);

  const initiateSubscription = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmSubscribe = async () => {
    if (!selectedPlan) return;
    
    const tier = selectedPlan.tier as "STARTER" | "GROWTH" | "BUSINESS";
    try {
      setSubscribingTier(tier);
      const callback_url = `${window.location.origin}/dashboard/subscription`;
      const response = await subscribe({ tier, callback_url });
      
      if (response.authorization_url) {
        window.location.href = response.authorization_url;
      }
    } catch (error: any) {
      setSubscribingTier(null);
      setIsCheckoutModalOpen(false);
      toast.error(error.message || "Failed to initialize subscription");
    }
  };

  const handleCancelPlan = async () => {
    try {
      await cancelSubscription();
      setIsCancelModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error) {
      // Error handled by hook toast
    }
  };

  const tiers = ["STARTER", "GROWTH", "BUSINESS"] as const;

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "STARTER": return <Zap className="h-5 w-5 text-gray-600" />;
      case "GROWTH": return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case "BUSINESS": return <Briefcase className="h-5 w-5 text-gray-700" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const getTierOrder = (tier: string) => {
    return tiers.indexOf(tier as any);
  };

  const currentTierOrder = subscription ? getTierOrder(subscription.tier) : -1;

  if (isFetchingPlans || isFetchingSubscription) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-8 w-full">
        <Skeleton className="h-4 w-20 mb-2 bg-gray-200" />
        
        {/* Banner Skeleton */}
        <Skeleton className="h-[120px] w-full rounded-[24px] bg-gray-200" />

        {/* Title & Subtitle Skeleton */}
        <div className="flex flex-col gap-3 mt-4">
          <Skeleton className="h-8 w-40 rounded-lg bg-gray-200" />
          <Skeleton className="h-5 w-64 rounded-lg bg-gray-200" />
        </div>

        {/* Pricing Cards Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col p-6 rounded-[24px] border border-gray-100 gap-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl bg-gray-200" />
                <Skeleton className="h-6 w-24 rounded-lg bg-gray-200" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-32 rounded-lg bg-gray-200" />
                <Skeleton className="h-4 w-16 rounded-lg bg-gray-200" />
              </div>
              <div className="space-y-4 my-4">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full bg-gray-200" />
                    <Skeleton className={cn("h-3 rounded-lg bg-gray-200", j % 2 === 0 ? "w-full" : "w-2/3")} />
                  </div>
                ))}
              </div>
              <Skeleton className="h-12 w-full rounded-full mt-auto bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Payment Section Skeleton */}
        <div className="flex flex-col gap-5 mt-4">
          <Skeleton className="h-7 w-32 rounded-lg bg-gray-200" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-12 rounded-full bg-gray-200" />
            <Skeleton className="h-5 w-48 rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  // Sort plans by tier order
  const sortedPlans = [...(plans || [])].sort((a, b) => getTierOrder(a.tier) - getTierOrder(b.tier));
  const currentPlan = sortedPlans.find(p => p.tier === subscription?.tier);

  return (
    <div className="flex flex-col gap-8 p-2 md:p-2 w-full relative">
      {isVerifying && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-lg font-bold text-gray-900">Verifying your subscription...</p>
        </div>
      )}
      <h1 className="font-regular text-[14px] text-[#676767]">Subscription</h1>

      {/* Active Plan Banner */}
      {subscription && (
        <div className="bg-[#365BEB] rounded-[24px] p-4 flex flex-col md:flex-row justify-between items-center gap-6 shadow-md border border-blue-400/20">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 w-fit">
              <span className="text-white text-[10px] font-bold uppercase tracking-[0.15em]">
                {subscription.tier} PLAN
              </span>
            </div>
            <div className="flex flex-col">
              {currentPlan?.slashedPrice && (
                <span className="text-[16px] text-white line-through decoration-2  mb-1">
                  ₦{parseInt(currentPlan.slashedPrice).toLocaleString()}
                </span>
              )}
              <div className="flex items-baseline leading-[24px] gap-2">
                <span className="text-white text-[20px] md:text-[32px] leading-tight font-bold">
                  ₦{currentPlan ? parseInt(currentPlan.price).toLocaleString() : "0"}
                </span>
                <span className="text-white text-[18px] font-regular leading-[100%]">/month</span>
              </div>
            </div>
          </div>
          <button 
            disabled={isSubscribing}
            onClick={() => initiateSubscription(currentPlan!)}
            className="bg-gray-900 text-white px-10 py-3 rounded-full text-[14px] leading-[100%] font-regular flex items-center justify-center gap-2 min-w-[120px] hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-70"
          >
            {isSubscribing && subscribingTier === subscription.tier ? <Loader2 className="w-4 h-4 animate-spin" /> : "Renew"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 mt-4 rounded-[24px] p-4 bg-[#FFFFFF]">
        <div className="flex flex-col gap-2 mt-4">
        <h2 className="text-[16px] leading-[24px] font-bold text-[#4D4D4D]">Your Plan</h2>
        <p className="text-[#4D4D4D] text-[16px] font-regular leading-[100%] ">Choose the plan that fits your workflow.</p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sortedPlans.map((plan) => {
          const isCurrent = subscription?.tier === plan.tier;
          const planOrder = getTierOrder(plan.tier);
          const isUpgrade = planOrder > currentTierOrder;
          const isDowngrade = planOrder < currentTierOrder && currentTierOrder !== -1;

          return (
            <div 
              key={plan.id}
              className={cn(
                "relative flex flex-col p-6 rounded-[24px] border transition-all duration-300",
                isCurrent 
                  ? "border-blue-500 ring-1 ring-blue-500 shadow-lg scale-[1.02]" 
                  : "border-gray-200 hover:border-gray-300 shadow-sm"
              )}
            >
              {isCurrent && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-blue-500/50">
                  <Check className="w-3 h-3" />
                  Current
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  plan.tier === "GROWTH" ? "bg-blue-50" : "bg-gray-50"
                )}>
                  {getTierIcon(plan.tier)}
                </div>
                <h3 className="text-lg font-bold text-[#4D4D4D]">{plan.name}</h3>
              </div>

              <div className="flex flex-col mb-4">
                {plan.slashedPrice && (
                  <span className="text-[16px] text-gray-600 line-through decoration-2 decoration-[#4D4D4D]/50 mb-1">
                    ₦{parseInt(plan.slashedPrice).toLocaleString()}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-[#4D4D4D]">₦{parseInt(plan.price).toLocaleString()}</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
              </div>

              <div className="mt-6 mb-4">
                <p className="text-xs font-semibold text-[#4D4D4D] uppercase tracking-wider mb-4">Features included:</p>
                <ul className="space-y-4 flex-grow">
                  {plan.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-[#1A1A1A] mt-0.5 shrink-0" strokeWidth={3} />
                      <span className="text-[14px] text-[#4D4D4D] leading-tight font-regular">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-8">
                <button
                  disabled={isCurrent || isSubscribing}
                  onClick={() => initiateSubscription(plan)}
                  className={cn(
                    "w-full py-3 px-6 rounded-full font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2",
                    isCurrent 
                      ? "bg-white border border-blue-600 text-blue-600 cursor-default"
                      : isUpgrade
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                        : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {isSubscribing && subscribingTier === plan.tier ? <Loader2 className="w-4 h-4 animate-spin" /> : (isCurrent ? "Current Plan" : isUpgrade ? "Upgrade" : "Downgrade")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Payment Section */}
      <div className="flex flex-col gap-4 rounded-[24px] p-4 bg-[#FFFFFF]">
        <h2 className="text-[16px] font-bold text-[#4D4D4D]">Payment</h2>
        <div className="flex items-center gap-3 text-gray-600 p-1">
          <div className="flex -space-x-2">
             <div className="h-6 w-6 rounded-full bg-blue-600" />
             <div className="h-6 w-6 rounded-full bg-blue-400/50" />
          </div>
          <span className="font-regular text-[16px] text-[#4D4D4D]">Mastercard • • • • 1555</span>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Invoices Section */}
      <div className="flex flex-col gap-6 rounded-[24px] p-4 bg-[#FFFFFF]">
        <h2 className="text-lg font-bold text-gray-900">Invoices</h2>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left min-w-[600px] border-collapse">
            <thead>
              <tr className="text-gray-400 font-medium text-sm border-b border-gray-100">
                <th className="pb-4">Date</th>
                <th className="pb-4">Total</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 text-[15px]">
              {isFetchingHistory ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : history && history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-5">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-5">NGN {parseInt(item.amount).toLocaleString()}</td>
                    <td className="py-5">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium capitalize",
                        item.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {item.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      <Button variant="outline" size="sm" className="rounded-full px-4 h-8 text-[#676767] border-gray-200 flex items-center gap-2 ml-auto">
                        <Eye className="h-4 w-4 text-[#999999]" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Cancellation Section */}
      {/* <div className="flex flex-row justify-between items-center rounded-[24px] p-4 bg-[#FFFFFF]">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-gray-900">Cancellation</h2>
          <p className="text-[15px] text-gray-500 font-medium">Cancel plan</p>
        </div>
        <button 
          onClick={() => setIsCancelModalOpen(true)}
          disabled={isCancelling || !subscription || subscription.status === "CANCELLED"}
          className="bg-[#eb4b4b] text-white px-8 py-3 text-sm rounded-full font-bold hover:bg-[#d94444] transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Plan"}
        </button>
      </div> */}

      {/* Cancel Confirmation Modal */}
      {/* <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-8 md:p-10 border-0 shadow-xl rounded-[24px] gap-0" showCloseButton={false}>
          <div className="flex flex-col items-center justify-center w-full text-center">
            <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <CircleAlert className="h-7 w-7 text-red-500" />
            </div>
            
            <DialogHeader className="w-full">
              <DialogTitle className="text-xl font-bold text-gray-900 mb-8 px-4">
                Are you sure you want to cancel your plan?
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="w-full py-3 rounded-full border border-gray-200 font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all"
              >
                Keep your Plan
              </button>
              <button 
                onClick={handleCancelPlan}
                disabled={isCancelling}
                className="w-full py-3 rounded-full bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancel Plan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog> */}

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-10 py-16 border-0 shadow-2xl rounded-[32px] gap-0" showCloseButton={false}>
           <div className="flex flex-col items-center justify-center w-full text-center">
              <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center mb-8">
                <CheckCircle2 className="h-10 w-10 text-green-500" strokeWidth={2.5} />
              </div>
              
              <DialogHeader className="w-full items-center">
                <DialogTitle className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
                  Plan Cancelled
                </DialogTitle>
                <DialogDescription className="text-lg text-gray-500 font-medium max-w-[300px]">
                  Your plan has successfully been cancelled
                </DialogDescription>
              </DialogHeader>
           </div>
        </DialogContent>
      </Dialog>
      
      {/* Checkout Confirmation Modal */}
      <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 border-0 shadow-2xl rounded-[32px] overflow-hidden gap-0" showCloseButton={false}>
          <div className="p-8 md:p-10 flex flex-col gap-8">
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Confirm Plan Change
                </DialogTitle>
                <DialogDescription className="text-gray-500 text-[15px]">
                  You are about to switch to the <span className="font-bold text-gray-900">{selectedPlan?.name}</span> plan. Please review your selection below.
                </DialogDescription>
              </div>
            </div>

            <div className="bg-gray-50 rounded-[24px] p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Selected Plan</span>
                <span className="font-bold text-gray-900">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-medium">Billing Cycle</span>
                <span className="font-bold text-gray-900">Monthly</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-500 font-medium">Total Amount</span>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-bold text-blue-600">
                    ₦{selectedPlan ? parseInt(selectedPlan.price).toLocaleString() : "0"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleConfirmSubscribe}
                disabled={isSubscribing}
                className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[16px] shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {isSubscribing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : "Confirm & Proceed to Payment"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setIsCheckoutModalOpen(false)}
                disabled={isSubscribing}
                className="w-full h-12 rounded-full font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
