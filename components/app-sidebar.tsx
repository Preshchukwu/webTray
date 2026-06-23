"use client"

import * as React from "react"
import { Store, ShoppingCart, ChartSpline, ReceiptText, LayoutTemplate } from "lucide-react"
import {
  IconChartBar,
  IconFolder,
  IconUsers,
  IconLayoutDashboard,
  IconPackage,
  IconWallet,
  IconSpeakerphone,
} from "@tabler/icons-react"
import { useAuthStore } from "@/store/useAuthStore"
// import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
// import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Inventory",
      url: "/dashboard/inventory",
      icon: IconPackage,
    },
    {
      title: "Order",
      url: "/dashboard/order",
      icon: ShoppingCart,
    },
    {
      title: "Storefront",
      url: "/dashboard/storefront",
      icon: Store,
    },
    {
      title: "Customer",
      url: "/dashboard/customer",
      icon: IconUsers,
    },
    {
      title: "Wallet",
      url: "/dashboard/wallet",
      icon: IconWallet,
    },
    {
      title: "Ads",
      url: "/dashboard/ads",
      icon: IconSpeakerphone,
    },
    {
      title: "Portfolio",
      url: "/dashboard/portfolio",
      icon: LayoutTemplate,
    },
    // {
    //   title: "Analytics",
    //   url: "/dashboard/analytics",
    //   icon: ChartSpline,
    // },
    // {
    //   title: "Subscription",
    //   url: "/dashboard/subscription",
    //   icon: ReceiptText,
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore()
  const { isMobile } = useSidebar()
  return (
    <Sidebar className="" collapsible="offcanvas" {...props}>
      {!isMobile && (
        <SidebarHeader className="my-[30px]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <Link href="#" className="flex items-center z-[60]">
                  <Image src="/webtraylogo.png" width={140} height={40} alt="logo" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      )}
      <SidebarContent className={isMobile ? "flex-none" : ""}>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className={isMobile ? "mt-10" : ""}>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}
