"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

const steps = [
  {
    title: "Welcome to WebTray!",
    description: "Let's get your business up and running. We'll show you around the key features of your new dashboard so you can make the most out of WebTray.",
    target: null,
  },
  {
    title: "Manage Inventory",
    description: "Keep track of your products here. Add new items, update stock levels, and organize your catalog efficiently.",
    target: "nav-inventory",
  },
  {
    title: "Process Orders",
    description: "View and fulfill customer orders seamlessly. Track statuses from pending to delivered to keep your customers happy.",
    target: "nav-order",
  },
  {
    title: "Your Storefront",
    description: "Customize your public store, manage settings, and see exactly how your customers view your brand online.",
    target: "nav-storefront",
  },
  {
    title: "Wallet & Payouts",
    description: "Track your earnings, view your transaction history, and manage payouts directly to your bank account.",
    target: "nav-wallet",
  }
];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  const { user, completedOnboardingUsers, setCompletedOnboarding } = useAuthStore();

  // We add a tiny delay before showing the wizard to let the dashboard render
  useEffect(() => {
    if (!user) return;
    
    // Check if user has already completed onboarding
    if (completedOnboardingUsers[user.id]) {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [user, completedOnboardingUsers]);

  const handleClose = () => {
    setVisible(false);
    if (user) {
      setCompletedOnboarding(user.id, true);
    }
  };

  useEffect(() => {
    if (!visible) return;
    
    const targetId = steps[step].target;
    if (!targetId) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect);
        } else {
          setTargetRect(null);
        }
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    
    // Observe sidebar animations if possible
    const timeout = setTimeout(updateRect, 300);
    
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      clearTimeout(timeout);
    };
  }, [step, visible]);

  if (!visible) return null;

  const currentStep = steps[step];

  const cardStyle = targetRect 
    ? { 
        position: "fixed" as const, 
        left: `${targetRect.right + 20}px`, 
        top: `${targetRect.top + targetRect.height / 2}px`,
        transform: "translateY(-50%)"
      }
    : {
        position: "fixed" as const,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)"
      };

  return (
    <>
      <svg 
        className="fixed inset-0 z-[100] pointer-events-auto w-full h-full transition-opacity duration-300" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="cutout-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect 
                x={targetRect.x - 8} 
                y={targetRect.y - 4} 
                width={targetRect.width + 16} 
                height={targetRect.height + 8} 
                rx="8" 
                fill="black" 
              />
            )}
          </mask>
        </defs>
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(0,0,0,0.6)" 
          mask="url(#cutout-mask)" 
        />
      </svg>

      <div 
        className="fixed z-[101] bg-white rounded-[24px] shadow-2xl p-6 w-[350px] flex flex-col gap-3 transition-all duration-300 ease-in-out border border-gray-100"
        style={cardStyle}
      >
        <div className="flex flex-col gap-1">
          {step > 0 && (
            <span className="text-[#365BEB] text-xs font-semibold uppercase tracking-wider">
              Step {step} of {steps.length - 1}
            </span>
          )}
          <h3 className="text-[#111827] font-semibold text-xl">
            {currentStep.title}
          </h3>
        </div>
        
        <p className="text-[#4D4D4D] text-sm leading-relaxed mb-2">
          {currentStep.description}
        </p>

        <div className="flex justify-between items-center mt-1">
          <button 
            onClick={handleClose} 
            className="text-[#808080] text-sm font-medium hover:text-[#4D4D4D] transition-colors"
          >
            Skip Tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button 
                variant="outline" 
                className="rounded-full border-gray-200 text-[#4D4D4D] h-9 px-4" 
                onClick={() => setStep(s => s - 1)}
              >
                Back
              </Button>
            )}
            <Button 
              className="bg-[#365BEB] hover:bg-[#365BEB]/90 text-white rounded-full h-9 px-6" 
              onClick={() => {
                if (step === steps.length - 1) {
                  handleClose();
                } else {
                  setStep(s => s + 1);
                }
              }}
            >
              {step === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
