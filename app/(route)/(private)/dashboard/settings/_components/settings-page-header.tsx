"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface SettingsPageHeaderProps {
  title: string
  description: string
  segment?: string
  backHref?: string
  action?: React.ReactNode
}

export function SettingsPageHeader({
  title,
  description,
  segment,
  backHref = "/dashboard/settings",
  action,
}: SettingsPageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (segment) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  const headerContent = (
    <div className="flex flex-col gap-2 leading-[100%] flex-1 min-w-0">
      {segment ? (
        <div className="flex items-center gap-1 text-[12px] font-regular text-[#676767]">
          <Link
            href="/dashboard/settings"
            className="hover:text-[#365BEB] transition-colors"
          >
            Settings
          </Link>
          <span className="mx-1">/</span>
          <span>{segment}</span>
        </div>
      ) : (
        <span className="text-[12px] font-regular text-[#676767]">Settings</span>
      )}
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors -ml-2 shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-[#4D4D4D]" />
        </button>
        <h1 className="text-[16px] leading-[24px] md:text-[20px] font-bold text-[#4D4D4D]">
          {title}
        </h1>
      </div>
      <p className="text-[#4D4D4D] text-[14px] leading-[24px] font-regular md:text-[16px]">
        {description}
      </p>
    </div>
  )

  if (action) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {headerContent}
          {action}
        </div>
      </div>
    )
  }

  return headerContent
}
