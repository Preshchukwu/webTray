"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomAlert } from "@/components/CustomAlert";
import { useAlertManager } from "@/hooks/use-alert-manager";
import { Loader2Icon } from "lucide-react";
import { ForgetPasswordFormData, forgetPasswordschema } from "@/schemas/forget-password.schema";
import Link from "next/link";


type FormData = ForgetPasswordFormData;

export default function Component() {
  const { forgotPassword } = useAuthStore();
  const { alertType, alertMessage, showAlertMessage } = useAlertManager();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(forgetPasswordschema),
  });

  const watchedFields = watch();
  const isFormFilled = watchedFields.email?.trim();

  const onSubmit = async (data: FormData) => {
    setShowError(false);
    try {
      setError("");
      await forgotPassword(data.email);

      showAlertMessage(
        "success",
        "Password reset link has been sent to your email. Please check your inbox."
      );
      setSubmitSuccess(true);
      setShowSuccessAlert(true);
      reset();

      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 10000);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";

      setError(errorMessage);
      showAlertMessage("error", errorMessage);
      setShowError(true);
      console.error("Forgot password error:", errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <Image 
            src="/webtraylogo.png" 
            width={140} 
            height={40} 
            alt="logo" 
            className="w-[120px] sm:w-[140px] h-auto"
            priority
          />
        </Link>
      </div>

      <div className="flex-col flex items-center justify-start w-full max-w-md px-6 sm:px-0 md:w-[40%] mx-auto">

        {showSuccessAlert && submitSuccess && (
          <CustomAlert
            type={alertType}
            message={alertMessage}
            onClose={() => setShowSuccessAlert(false)}
          />
        )}

        {error && showError && (
          <CustomAlert
            type="error"
            message={error}
            onClose={() => setShowError(false)}
          />
        )}

        <div className="mb-[18px] mt-[40px]">
          <h2 className="text-[20px] leading-[24px] text-center font-bold text-[#4D4D4D] mb-2">
            We’ve Got You Covered
          </h2>
          <p className="text-[#676767] text-center text-[14px] leading-[22px]">
            Forgot your password? Just enter your email and we’ll send you a
            secure link to reset it, no stress.
          </p>
        </div>


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 w-full ">
          <div>
            <Label
              className="mb-[8px] text-[#1A1A1A] text-[16px] leading-[24px] font-normal"
              htmlFor="email"
            >
              Email Address (registered email)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              {...register("email")}
              aria-invalid={!!errors.email}
              className="h-[44px] shadow-none text-[14px] leading-[24px] text-[#1A1A1A]"
            />
            {errors.email && (
              <p className="text-sm mt-[8px] text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center">
            <Button
              size="lg"
              type="submit"
              disabled={isSubmitting || !isFormFilled}
              className="w-full md:text-[16px] md:w-1/2 py-3 my-[54px] text-white font-medium rounded-full bg-gray-900 hover:bg-black"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              {"Remember your password?"}
              <Link href="/signin" className="text-blue-600 ml-2 hover:text-blue-800 font-medium">
                Log In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
