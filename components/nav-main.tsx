"use client"

import React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import { toast } from "sonner"
import clsx from "clsx"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
    locked?: boolean
  }[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, setOpenMobile } = useSidebar()

  const showInventoryLockedToast = () => {
    toast.info("Upgrade your plan to access Inventory", {
      action: {
        label: "Upgrade",
        onClick: () => router.push("/dashboard/subscription"),
      },
    })
  }

  if (isMobile) {
    return (
      <div className="grid grid-cols-3 gap-3 p-4">
        {items.map((item) => {
          const isActive = item.url === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname === item.url || pathname.startsWith(item.url + "/")

          if (item.locked) {
            return (
              <button
                key={item.title}
                type="button"
                onClick={showInventoryLockedToast}
                className={clsx(
                  "flex flex-col items-center justify-center p-3 rounded-2xl transition-all gap-1.5",
                  "bg-transparent text-[#808080] opacity-60 cursor-not-allowed"
                )}
              >
                <div className="relative p-2.5 rounded-2xl bg-gray-100">
                  {item.icon && <item.icon className="w-6 h-6" />}
                  <Lock className="absolute -top-1 -right-1 w-3.5 h-3.5 text-[#808080] bg-white rounded-full p-0.5" />
                </div>
                <span className="text-[11px] font-semibold tracking-tight text-[#808080]">
                  {item.title}
                </span>
              </button>
            )
          }

          return (
            <Link 
              key={item.title} 
              href={item.url} 
              onClick={() => setOpenMobile(false)}
              className={clsx(
                "flex flex-col items-center justify-center p-3 rounded-2xl transition-all gap-1.5",
                isActive 
                  ? "bg-[#365BEB]/5 text-[#365BEB]" 
                  : "bg-transparent text-[#808080] hover:bg-gray-50"
              )}
            >
              <div className={clsx(
                "p-2.5 rounded-2xl transition-colors",
                isActive ? "bg-[#365BEB] text-white" : "bg-gray-100"
              )}>
                {item.icon && <item.icon className="w-6 h-6" />}
              </div>
              <span className={clsx(
                "text-[11px] font-semibold tracking-tight",
                isActive ? "text-[#365BEB]" : "text-[#808080]"
              )}>
                {item.title}
              </span>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = item.url === "/dashboard" 
              ? pathname === "/dashboard" 
              : pathname === item.url || pathname.startsWith(item.url + "/")

            if (item.locked) {
              return (
                <SidebarMenuItem key={item.title} id={`nav-${item.title.toLowerCase()}`}>
                  <SidebarMenuButton
                    type="button"
                    tooltip="Upgrade your plan to access Inventory"
                    onClick={showInventoryLockedToast}
                    className={clsx(
                      "transition-colors opacity-60 cursor-not-allowed hover:bg-transparent",
                      isActive && "bg-muted text-primary font-medium"
                    )}
                  >
                    {item.icon && <item.icon className="text-[#808080] w-[24px] h-[24px]" />}
                    <span className="font-normal text-[16px] leading-[100%] text-[#808080]">
                      {item.title}
                    </span>
                    <Lock className="ml-auto w-4 h-4 text-[#808080]" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            }

            return (
              <SidebarMenuItem key={item.title} id={`nav-${item.title.toLowerCase()}`}>
                <Link href={item.url} passHref>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={clsx(
                      "transition-colors",
                      isActive
                        ? "bg-muted text-primary font-medium"
                        : "hover:bg-accent"
                    )}
                  >
                    {item.icon && <item.icon className="text-[#808080] w-[24px] h-[24px]"/>}
                    <span className=" font-normal text-[16px] leading-[100%] text-[#808080]">{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
