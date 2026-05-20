"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User, Settings, Zap, TrendingUp, Briefcase } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import SearchComponent from "@/components/search-component";
import { StoreSwitcher } from "./StoreSwitcher";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { NotificationPanel } from "./notification-panel";

export function SiteHeader() {
  const pathname = usePathname();
  const { subscription } = useSubscription();

  return (
    <header className="mt-[34px] mb-[24px] bg-[#FFFFFF] rounded-full border flex h-[69px] shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 hidden md:flex" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <StoreSwitcher />
        {subscription && (
          <div className="ml-2 hidden sm:flex items-center">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#365BEB] text-white border border-[#365BEB] shadow-sm transition-all duration-300">
              {subscription.tier === "BUSINESS" && <Briefcase className="w-3 h-3" />}
              {subscription.tier === "GROWTH" && <TrendingUp className="w-3 h-3" />}
              {subscription.tier === "STARTER" && <Zap className="w-3 h-3" />}
              {subscription.tier}
            </div>
          </div>
        )}

        {/* {pathname === "/dashboard" && <SearchComponent />} */}

        {/* Right section */}
        <div className="ml-auto flex items-center gap-8">
          <div className="hidden md:flex items-center gap-8">
            <Link href="/dashboard/settings" aria-label="Settings">
              <Settings className={pathname.startsWith("/dashboard/settings") ? "text-[#365BEB]" : "text-[#808080]"} />
            </Link>
            <Link href="/profile" aria-label="Profile">
              <User className={pathname.startsWith("/profile") ? "text-[#365BEB]" : "text-[#808080]"} />
            </Link>
            <NotificationPanel
              bellClassName={pathname.startsWith("/notification") ? "text-[#365BEB]" : "text-[#808080]"}
            />
          </div>

          {/* Mobile Trigger on Right */}
          <SidebarTrigger className="flex md:hidden" />
        </div>
      </div>
    </header>
  );
}
