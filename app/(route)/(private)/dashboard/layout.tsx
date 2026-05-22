import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { HasBusinessAlert } from "@/components/hasBusinessAlert"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" className="no-print" />
      <SidebarInset>
        <div className="no-print bg-[#F8F8F8]">
          <SiteHeader />
        </div>
        <main className="flex flex-1 overflow-auto flex-col p-4 bg-[#F8F8F8] print:p-0 pb-24 md:pb-4">
          <HasBusinessAlert />
          {children}
        </main>
      </SidebarInset>
      <div className="no-print">
        <OnboardingWizard />
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  )
}
