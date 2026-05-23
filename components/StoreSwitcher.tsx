"use client"
import * as React from "react"
import {
  Check,
  Store,
  ChevronDown,
  Loader2,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuthStore } from "@/store/useAuthStore"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function StoreSwitcher() {
  const [open, setOpen] = React.useState(false)
  const { stores, activeStore, switchStore, _hasHydrated, user } = useAuthStore()
  const queryClient = useQueryClient()
  const router = useRouter()

  if (!_hasHydrated) {
    return (
      <Button
        variant="outline"
        disabled
        className="w-[200px] justify-between rounded-full"
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (!stores || stores.length === 0) {
    if (user?.business) {
      console.warn("User has business but no stores in Zustand state")
    }
    return null
  }

  const handleStoreSelect = (storeId: number) => {
    try {
      switchStore(storeId)
      setOpen(false)

      // Invalidate store-dependent queries
      const queries = ['products', 'categories', 'orders', 'dashboard', 'inventory']
      queries.forEach(key => queryClient.invalidateQueries({ queryKey: [key] }))

      toast.success(`Switched to ${stores.find(s => s.id === storeId)?.storeName}`)
    } catch (error) {
      console.error("Store switch error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to switch store")
    }
  }

  const handleAddNewStore = () => {
    setOpen(false)
    router.push("/dashboard/storefront") // 👈 "New Store" button is in the storefront page header
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="rounded-full">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
          className="w-[130px] sm:w-[200px] justify-between px-2 sm:px-4"
        >
          <Store className="mr-1 sm:mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{activeStore?.storeName || "Select store"}</span>
          <ChevronDown className="ml-1 sm:ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[220px] p-0">
        <Command>
          <CommandInput placeholder="Search store..." />
          <CommandEmpty>No store found.</CommandEmpty>
          <CommandGroup heading="Stores">
            {stores.map((store) => (
              <CommandItem
                key={store.id}
                onSelect={() => handleStoreSelect(store.id)}
                className="text-sm"
              >
                <Store className="mr-2 h-4 w-4" />
                {store.storeName}
                {activeStore?.id === store.id && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          {/* 👇 Add New Store Button */}
          <div className="border-t p-2">
            <Button
              // variant="ghost"
              className="w-full justify-center rounded-full text-sm"
              onClick={handleAddNewStore}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Store
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
