"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  IconLayoutDashboard, 
  IconPackage, 
  IconShoppingCart, 
  IconDotsVertical 
} from "@tabler/icons-react"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/ui/sidebar"
import { usePlanAccess, INVENTORY_PATH } from "@/hooks/use-plan-access"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toggleSidebar } = useSidebar()
  const { isInventoryLocked } = usePlanAccess()

  const showInventoryLockedToast = () => {
    toast.info("Upgrade your plan to access Inventory", {
      action: {
        label: "Upgrade",
        onClick: () => router.push("/dashboard/subscription"),
      },
    })
  }

  const navItems = [
    { label: "Home", href: "/dashboard", icon: IconLayoutDashboard, locked: false },
    { label: "Inventory", href: INVENTORY_PATH, icon: IconPackage, locked: isInventoryLocked },
    { label: "Orders", href: "/dashboard/order", icon: IconShoppingCart, locked: false },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[80px] items-center justify-around bg-white md:hidden px-4 border-t border-gray-100 pb-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

        if (item.locked) {
          return (
            <button
              key={item.label}
              type="button"
              onClick={showInventoryLockedToast}
              className="flex flex-col items-center gap-1.5 transition-all w-full text-[#808080] opacity-60 cursor-not-allowed"
            >
              <div className="relative p-2 rounded-2xl bg-transparent">
                <item.icon size={24} stroke={2} />
                <Lock className="absolute -top-0.5 -right-0.5 w-3 h-3 text-[#808080]" />
              </div>
              <span className="text-[10px] font-semibold tracking-tight text-[#808080]">
                {item.label}
              </span>
            </button>
          )
        }

        return (
          <Link 
            key={item.label} 
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all w-full",
              isActive ? "text-[#365BEB]" : "text-[#808080]"
            )}
          >
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-200",
              isActive ? "bg-[#365BEB]/10" : "bg-transparent"
            )}>
              <item.icon size={24} stroke={isActive ? 2.5 : 2} />
            </div>
            <span className={cn(
              "text-[10px] font-semibold tracking-tight",
              isActive ? "text-[#365BEB]" : "text-[#808080]"
            )}>
              {item.label}
            </span>
          </Link>
        )
      })}
      
      {/* More Trigger */}
      <button 
        onClick={toggleSidebar}
        className="flex flex-col items-center gap-1.5 transition-all w-full text-[#808080]"
      >
        <div className="p-2 rounded-2xl bg-gray-50">
          <IconDotsVertical size={24} stroke={2} />
        </div>
        <span className="text-[10px] font-semibold tracking-tight text-[#808080]">More</span>
      </button>
    </div>
  )
}
