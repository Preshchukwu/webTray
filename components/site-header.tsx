"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { User, Settings, Zap, TrendingUp, Briefcase, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
// import SearchComponent from "@/components/search-component";
import { StoreSwitcher } from "./StoreSwitcher";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { NotificationPanel } from "./notification-panel";

export function SiteHeader() {
  const pathname = usePathname();
  const { subscription } = useSubscription();

  const renderBadges = () => {
    if (!subscription) return null;
    return (
      <>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#365BEB] text-white border border-[#365BEB] shadow-sm transition-all duration-300">
          {subscription.tier === "BUSINESS" && <Briefcase className="w-3 h-3" />}
          {subscription.tier === "GROWTH" && <TrendingUp className="w-3 h-3" />}
          {subscription.tier === "STARTER" && <Zap className="w-3 h-3" />}
          {subscription.tier}
        </div>

        {subscription.status === "TRIAL" && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-600 border border-orange-200 shadow-sm transition-all duration-300">
            TRIAL - {subscription.daysLeft} DAY{subscription.daysLeft !== 1 ? 'S' : ''} LEFT
          </div>
        )}

        {subscription.status === "EXPIRED" && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 border border-red-200 shadow-sm transition-all duration-300">
            EXPIRED
          </div>
        )}

        {subscription.status === "ACTIVE" && typeof subscription.daysLeft === 'number' && subscription.daysLeft <= 7 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm transition-all duration-300">
            RENEWS IN {subscription.daysLeft} DAY{subscription.daysLeft !== 1 ? 'S' : ''}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <header className="mt-[34px] bg-[#ffffff] border mb-3 sm:mb-[24px] rounded-full flex h-[69px] shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <Link href="/dashboard" className="flex md:hidden items-center mr-2 shrink-0">
            <Image src="/webtraylogo.png" width={90} height={26} alt="Webtray" className="object-contain" />
          </Link>
          <SidebarTrigger className="-ml-1 hidden md:flex" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <StoreSwitcher />
          
          {subscription && (
            <div className="ml-2 hidden sm:flex items-center gap-2">
              {renderBadges()}
            </div>
          )}

          {/* {pathname === "/dashboard" && <SearchComponent />} */}

          {/* Right section */}
          <div className="ml-auto flex items-center gap-2 sm:gap-8">
            <div className="flex items-center gap-3 sm:gap-4 md:gap-8">
              <Link href="/dashboard/settings" aria-label="Settings" className="hidden sm:block">
                <Settings className={cn("w-5 h-5 md:w-6 md:h-6", pathname.startsWith("/dashboard/settings") ? "text-[#365BEB]" : "text-[#808080]")} />
              </Link>
              {/* <Link href="/profile" aria-label="Profile" className="hidden sm:block">
                <User className={pathname.startsWith("/profile") ? "text-[#365BEB]" : "text-[#808080]"} />
              </Link> */}
              <NotificationPanel
                bellClassName={pathname.startsWith("/notification") ? "text-[#365BEB]" : "text-[#808080]"}
              />
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Badges */}
      {subscription && (
        <div className="flex sm:hidden items-center justify-center gap-2 mb-4 px-4 flex-wrap">
          {renderBadges()}
        </div>
      )}
    </>
  );
}
