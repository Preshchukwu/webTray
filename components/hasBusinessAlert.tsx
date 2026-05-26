"use client"

import { AlertCircleIcon} from "lucide-react"

import {
  Alert,

  AlertTitle,
} from "@/components/ui/alert"
import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"

export function HasBusinessAlert() {
  const { user } = useAuthStore()
  
  if (!user || user.business != null) {
    return null;
  }

  return (
    <div className="grid w-full mb-[20px] items-start gap-4">
   
      <Alert variant='default' className="border-[#F59E0B] text-[16px] bg-[#FDF0D94A] border-[0.05rem] w-full">
        <AlertCircleIcon />
        <AlertTitle className="line-clamp-none flex flex-wrap gap-x-2 gap-y-1 mt-[-2px]">
          <span>Finish setting up your account to start adding business.</span>
          <Link href="/register-business" className="underline text-[#365BEB] font-semibold">
            Add Business
          </Link>
        </AlertTitle>
      
      </Alert>
    </div>
  )
}
