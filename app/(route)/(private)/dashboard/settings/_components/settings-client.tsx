"use client"

import * as React from "react"
import { Search, User, CreditCard, Bell, ShieldCheck, Landmark, BanknoteArrowUp, TruckElectric } from "lucide-react"
import { SettingsPageHeader } from "./settings-page-header"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DetailItem {
  text: string
  icon?: React.ElementType
  className?: string
}

interface SettingOption {
  title: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  details?: DetailItem[]
  description?: string
  href: string
  detailIcon?: React.ElementType
}

const settingsOptions: SettingOption[] = [
  {
    title: "Account Settings",
    icon: User,
    iconBg: "bg-[#D8DFFB]",
    iconColor: "text-[#6366F1]",
    details: [
      { text: "John Kennedy", icon: User },
      { text: "johnkennedy@gmail.com" }
    ],
    href: "/dashboard/settings/account"
  },
  {
    title: "Business Settings",
    icon: Landmark,
    iconBg: "bg-[#F8F8F8]",
    iconColor: "text-[#808080]",
    details: [
      { text: "John's Coffee Shop" },
      { text: "Premium coffee & pastries" }
    ],
    href: "/dashboard/settings/business"
  },
  {
    title: "Payment Settings",
    icon: BanknoteArrowUp,
    iconBg: "bg-[#F8F8F8]",
    iconColor: "text-[#808080]",
    details: [
      { text: "Pro Plan" },
      { text: "₦ 2,000/month", className: "font-semibold text-black" }
    ],
    href: "/dashboard/settings/payment",
    detailIcon: CreditCard
  },
  {
    title: "Notifications",
    icon: Bell,
    iconBg: "bg-[#F8F8F8]",
    iconColor: "text-[#808080]",
    description: "Control email, sms & push notification preference",
    href: "/dashboard/settings/notifications"
  },
  {
    title: "Shipping & Delivery",
    icon: TruckElectric,
    iconBg: "bg-[#F8F8F8]",
    iconColor: "text-[#808080]",
    description: "Configure shipping zones, rates and delivery options",
    href: "/dashboard/settings/shipping"
  },
  {
    title: "Security & Privacy",
    icon: ShieldCheck,
    iconBg: "bg-[#F8F8F8]",
    iconColor: "text-[#808080]",
    description: "Two-factor authentication and privacy settings",
    href: "/dashboard/settings/security"
  }
]

export function SettingsClient() {
  return (
    <div className="flex flex-col gap-8">
      <SettingsPageHeader
        title="Settings"
        description="Here's what's happening with your business today."
      />

      {/* Search Settings */}
      <div className="relative w-full max-w-[480px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#808080]" />
        <Input
          placeholder="Search settings"
          className="pl-12 placeholder:text-[#808080] placeholder:text-[14px] placeholder:leading-[24px] placeholder:font-regular md:placeholder:text-[16px] md:placeholder:leading-[100%] md:placeholder:font-regular pr-4 h-[56px] rounded-full border-[#E5E5E5] bg-white text-[14px] leading-[24px] font-regular md:text-[16px] md:leading-[100%] md:font-regular focus-visible:ring-0 focus-visible:border-[#6366F1]"
        />
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsOptions.map((option) => (
          <Link key={option.title} href={option.href}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full min-h-[180px] rounded-[20px]">
              <CardContent className="p-8 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-[6px] flex items-center justify-center", option.iconBg)}>
                    <option.icon className={cn("w-6 h-6", option.iconColor)} />
                  </div>
                  <h3 className="text-[16px] leading-[100%] font-regular text-[#1A1A1A]">{option.title}</h3>
                </div>

                <div className="flex flex-col">
                  {option.details ? (
                    option.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {detail.icon && <detail.icon className="w-4 h-4 text-[#808080]" />}
                        {option.detailIcon && idx === 0 && <option.detailIcon className="w-4 h-4 text-[#808080]" />}
                        <span className={cn(
                          "text-[#808080] md:leading-[100%] md:font-regular leading-relaxed max-w-[240px]",
                          idx === 0 ? "md:text-[14px]" : "text-[12px] md:text-[13px]",
                          detail.className
                        )}>
                          {detail.text}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[#808080] text-[12px] md:text-[13px] md:leading-[100%] md:font-regular leading-relaxed max-w-[240px]">
                      {option.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
