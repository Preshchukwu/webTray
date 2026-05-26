"use client"
import { useState, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2Icon, CheckCircle, AlertTriangle, X } from "lucide-react"
import { ResetPasswordFormData, resetPasswordSchema } from "@/schemas/reset-password.schema"


type FormData = ResetPasswordFormData

type ResetPasswordPayload = {
  token: string
  newPassword: string
  confirmNewPassword: string
}

type AlertState = {
  show: boolean
  type: "success" | "error"
  message: string
}

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")
  const { resetPassword } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "success",
    message: "",
  })
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(resetPasswordSchema),
  })

  const watchedFields = watch()
  const isFormFilled = watchedFields.password?.trim() && watchedFields.confirmPassword?.trim()

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-4">This password reset link is invalid or has expired.</p>
          <button
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => router.push("/forgot-password")}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    )
  }

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ show: true, type, message })
  }

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, show: false }))
  }

  const onSubmit = async (data: FormData) => {
    hideAlert()

    try {
      const payload: ResetPasswordPayload = {
        token,
        newPassword: data.password,
        confirmNewPassword: data.confirmPassword,
      }
      await resetPassword(payload)

      setIsSuccess(true)
      showAlert("success", "Password Updated Successfully!")
      reset()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again."
      showAlert("error", errorMessage)
      console.error("Reset password error:", errorMessage)
    }
  }

  // Success state - show success message with login button
  if (isSuccess) {
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

        <div className="flex-col flex items-center justify-start w-full max-w-md px-6 sm:px-0 md:w-[30%] mx-auto">
          {/* Success Alert */}
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">Password Updated</AlertDescription>
            <button
              onClick={() => setIsSuccess(false)}
              className="absolute right-2 top-2 text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </Alert>

          <div className="text-center mb-8">
            <h2 className="text-[20px] leading-[24px] font-bold text-[#4D4D4D] mb-4">Password Updated Successfully!</h2>
            <p className="text-[#676767] text-[14px] leading-[22px]">
              You can now log in with your new password and get back to managing your business.
            </p>
          </div>

          <Button
            onClick={() => router.push("/signin")}
            className="w-full md:w-1/2 py-3 text-white font-medium rounded-full bg-gray-900 hover:bg-black"
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

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

      <div className="flex-col flex items-center justify-start w-full max-w-md px-6 sm:px-0 md:w-[30%] mx-auto">
        {/* Error Alert */}
        {alert.show && alert.type === "error" && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{alert.message}</AlertDescription>
            <button onClick={hideAlert} className="absolute right-2 top-2 text-red-600 hover:text-red-800">
              <X className="h-4 w-4" />
            </button>
          </Alert>
        )}

        <div className="mb-[18px] mt-[40px]">
          <h2 className="text-[20px] leading-[24px] text-center font-bold text-[#4D4D4D] mb-2">
            Set a Fresh, Secure Password
          </h2>
          <p className="text-[#676767] text-center text-[14px] leading-[22px]">
            Create a new password to access your business dashboard. Make it something strong but easy for you to
            remember.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
          {/* Password Field */}
          <div>
            <Label className="mb-[8px] text-[#1A1A1A] text-[16px] leading-[24px]" htmlFor="password">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                aria-invalid={!!errors.password}
                className={`pr-10 h-[44px] shadow-none ${errors.password ? "border-red-300 focus:border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-sm mt-[8px] text-red-600">{errors.password.message}</p>}
          </div>

          {/* Confirm Password Field */}
          <div>
            <Label className="mb-[8px] text-[#1A1A1A] text-[16px] leading-[24px]" htmlFor="confirmPassword">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
                className={`pr-10cshadow-none ${
                  errors.confirmPassword ? "border-red-300 focus:border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm mt-[8px] text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center pt-8">
            <Button
              type="submit"
              disabled={isSubmitting || !isFormFilled}
              size="lg"
              className="w-full md:text-[16px] md:w-1/2 py-3 text-white font-medium rounded-full bg-gray-900 hover:bg-black disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="animate-spin mr-2" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>

          {/* Login Redirect */}
          <div className="text-center pt-4">
            <p className="text-[#676767] text-[14px]">
              Remember your password?{" "}
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => router.push("/signin")}
              >
                Log In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Component() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2Icon className="animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
