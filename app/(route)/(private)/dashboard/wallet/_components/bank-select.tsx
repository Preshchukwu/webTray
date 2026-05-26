"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import type { WalletBank } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_BANKS = 80;

interface BankSelectProps {
  banks: WalletBank[];
  value: string;
  onChange: (bankCode: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function BankSelect({
  banks,
  value,
  onChange,
  isLoading,
  disabled,
}: BankSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = banks.find((b) => b.bankCode === value);

  const filteredBanks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return banks.slice(0, MAX_VISIBLE_BANKS);
    }
    return banks
      .filter(
        (bank) =>
          bank.name.toLowerCase().includes(query) ||
          bank.code.includes(query) ||
          bank.slug.toLowerCase().includes(query)
      )
      .slice(0, MAX_VISIBLE_BANKS);
  }, [banks, search]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  if (isLoading) {
    return <Skeleton className="h-11 w-full rounded-xl" />;
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between rounded-xl h-11 font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <span className="truncate">
            {selected ? selected.name : "Select bank"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false} className="overflow-hidden">
          <CommandInput
            placeholder="Search bank..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[240px] overflow-y-auto overscroll-contain">
            <CommandEmpty>No bank found.</CommandEmpty>
            <CommandGroup>
              {!search.trim() && banks.length > MAX_VISIBLE_BANKS && (
                <p className="px-3 py-2 text-xs text-[#808080] border-b border-gray-100">
                  Showing first {MAX_VISIBLE_BANKS} banks. Type to search all{" "}
                  {banks.length} banks.
                </p>
              )}
              {filteredBanks.map((bank) => (
                <CommandItem
                  key={bank.id}
                  value={String(bank.id)}
                  onSelect={() => {
                    onChange(bank.bankCode);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === bank.bankCode ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{bank.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
