"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconLoader
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useState } from "react"

export function NavUser({
  user,
}: {
  user: {
    fullname: string
    email: string
    avatar?: string
    phone?: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const isLoading = useAuthStore((s) => s.loading)
  const [isLoggingOut, setIsLoggingOut] = useState(false)


  const handleLogout = async (event: Event) => {
    event.preventDefault();
    if (isLoading) return;

    setIsLoggingOut(true); // Set logging out state
    try {
      // still thinking of a better way
      await logout();
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false); // Reset logging out state
    }
  };

  const handleSubscriptionClick = () => {
    // Close the dropdown if it's open
    // Since we don't have the state here, we'll rely on the natural behavior
    // or you can pass a close handler if needed.
    router.push('/dashboard/subscription');
  };

  const handleNotificationClick = () => {
    // Close the dropdown if it's open
    // Since we don't have the state here, we'll rely on the natural behavior
    // or you can pass a close handler if needed.
    router.push('/dashboard/notification');
  };


  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.fullname} />
                <AvatarFallback className="rounded-lg">
                  {user.fullname?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.fullname}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.fullname} />
                  <AvatarFallback className="rounded-lg">{user.fullname?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.fullname}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSubscriptionClick}>
                <IconCreditCard />
                Subscription
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNotificationClick}>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* <DropdownMenuItem
              // prevent the dropdown from auto-closing; handle logout manually
              onSelect={(event: any) => {
                event.preventDefault()
                if (isLoggingOut) return

                (async () => {
                  try {
                    setIsLoggingOut(true)
                    await logout()
                    router.push("/signin")
                  } catch (err) {
                    console.error("Logout failed", err)
                  } finally {
                    setIsLoggingOut(false)
                  }
                })()
              }}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
            >
              {isLoggingOut ? (
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconLogout className="mr-2 h-4 w-4" />
              )}
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem> */}
            <DropdownMenuItem
              onSelect={handleLogout}
              disabled={isLoading}
            >
              {isLoading ? (
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconLogout className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Logging out..." : "Log out"}
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
