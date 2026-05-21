"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, ChevronRight, CircleCheck, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BankSelect } from "./bank-select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWallet } from "@/hooks/use-wallet";
import type { ValidatedAccount, WalletBankAccount } from "@/hooks/use-wallet";
import { cn } from "@/lib/utils";

interface AddBankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddBankAccountDialog({ open, onOpenChange }: AddBankAccountDialogProps) {
  const {
    banks = [],
    isFetchingBanks,
    validateAccount,
    isValidatingAccount,
    resetValidation,
    addBankAccount,
    isAddingBankAccount,
  } = useWallet();

  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedAccount, setResolvedAccount] = useState<ValidatedAccount | null>(
    null
  );
  const lastVerifiedRef = useRef<string>("");

  const resetForm = useCallback(() => {
    setBankCode("");
    setAccountNumber("");
    setResolvedAccount(null);
    lastVerifiedRef.current = "";
    resetValidation();
  }, [resetValidation]);

  useEffect(() => {
    if (!open) resetForm();
  }, [open, resetForm]);

  const selectedBank = banks.find((b) => b.bankCode === bankCode);
  const digitsOnly = accountNumber.replace(/\D/g, "");
  const canSave =
    !!resolvedAccount && !!selectedBank && !isAddingBankAccount && !isValidatingAccount;

  useEffect(() => {
    if (!bankCode || digitsOnly.length !== 10) {
      setResolvedAccount(null);
      lastVerifiedRef.current = "";
      return;
    }

    const verifyKey = `${bankCode}:${digitsOnly}`;
    if (lastVerifiedRef.current === verifyKey) return;

    const timeout = setTimeout(async () => {
      try {
        const result = await validateAccount({
          accountNumber: digitsOnly,
          bankCode,
        });
        lastVerifiedRef.current = verifyKey;
        setResolvedAccount(result);
      } catch {
        lastVerifiedRef.current = "";
        setResolvedAccount(null);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [bankCode, digitsOnly, validateAccount]);

  const handleSave = async () => {
    if (!resolvedAccount || !selectedBank) return;

    const bankCodeToSend =
      bankCode || selectedBank.bankCode || selectedBank.code;
    const accountNumberToSend =
      resolvedAccount.accountNumber || digitsOnly;

    try {
      await addBankAccount({
        accountNumber: accountNumberToSend,
        bankCode: bankCodeToSend,
        bankName: selectedBank.name,
        accountName: resolvedAccount.accountName,
      });
      onOpenChange(false);
    } catch {
      // toast handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[24px] sm:max-w-md overflow-visible">
        <DialogHeader>
          <DialogTitle className="text-[#111827]">
            Add withdrawal account
          </DialogTitle>
          <DialogDescription className="text-[#808080]">
            Select your bank and enter your 10-digit account number. We verify
            automatically, then you can save.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label className="text-[#4D4D4D]">Bank</Label>
            <BankSelect
              banks={banks}
              value={bankCode}
              onChange={(code) => {
                setBankCode(code);
                lastVerifiedRef.current = "";
                setResolvedAccount(null);
              }}
              isLoading={isFetchingBanks}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[#4D4D4D]">Account number</Label>
            <Input
              inputMode="numeric"
              placeholder="8114528984"
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/\D/g, ""))
              }
              className="rounded-xl h-11"
              maxLength={10}
            />
          </div>

          {isValidatingAccount && (
            <div className="flex items-center gap-2 text-sm text-[#808080] py-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#365BEB]" />
              Verifying account...
            </div>
          )}

          {resolvedAccount && !isValidatingAccount && (
            <Alert className="rounded-xl border-green-200 bg-green-50 text-green-900">
              <CircleCheck className="text-green-600" />
              <AlertTitle className="text-green-800 font-semibold">
                Account verified
              </AlertTitle>
              <AlertDescription className="text-[#4D4D4D] space-y-2 mt-1">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#808080]">Bank</span>
                  <span className="font-semibold text-[#111827] text-right">
                    {selectedBank?.name ?? "—"}
                  </span>
                </div>
                {resolvedAccount.bankId && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-[#808080]">Bank ID</span>
                    <span className="font-semibold text-[#111827] text-right">
                      {resolvedAccount.bankId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-[#808080]">Account number</span>
                  <span className="font-semibold text-[#111827] tracking-wide">
                    {resolvedAccount.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-sm pt-1 border-t border-green-100">
                  <span className="text-[#808080]">Account name</span>
                  <span className="font-semibold text-[#111827] text-right">
                    {resolvedAccount.accountName}
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {digitsOnly.length === 10 &&
            bankCode &&
            !isValidatingAccount &&
            !resolvedAccount && (
              <p className="text-sm text-red-500">
                Could not verify this account. Check the bank and account number.
              </p>
            )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="rounded-full bg-[#365BEB] hover:bg-blue-700 w-full"
            onClick={handleSave}
            disabled={!canSave}
          >
            {isAddingBankAccount ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BankAccountRow({
  account,
  onDelete,
  isDeleting,
}: {
  account: WalletBankAccount;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-[#365BEB]/10 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-[#365BEB]" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-sm font-semibold text-[#111827] truncate">
            {account.accountName}
          </p>
          <p className="text-xs text-[#808080]">
            {account.bankName} · {account.accountNumber}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
        onClick={onDelete}
        disabled={isDeleting}
        aria-label="Remove bank account"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </Button>
    </div>
  );
}

export function WithdrawalBankAccounts({
  className,
  addDialogOpen: controlledAddOpen,
  onAddDialogOpenChange,
  showAll = false,
}: {
  className?: string;
  addDialogOpen?: boolean;
  onAddDialogOpenChange?: (open: boolean) => void;
  showAll?: boolean;
}) {
  const [internalAddOpen, setInternalAddOpen] = useState(false);
  const addOpen = controlledAddOpen ?? internalAddOpen;
  const setAddOpen = onAddDialogOpenChange ?? setInternalAddOpen;
  const [deleteTarget, setDeleteTarget] = useState<WalletBankAccount | null>(
    null
  );

  const {
    bankAccounts,
    isFetchingBankAccounts,
    bankAccountsError,
    deleteBankAccount,
    isDeletingBankAccount,
  } = useWallet();

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBankAccount(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // toast in hook
    }
  };

  return (
    <>
      <Card
        className={cn(
          "rounded-[24px] border border-gray-200 shadow-sm",
          className
        )}
      >
        <CardHeader className="pb-2 lg:flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-[16px] font-bold text-[#111827]">
              Withdrawal account
            </CardTitle>
            <p className="text-sm text-[#808080] mt-1">
              Bank account linked for wallet withdrawals.
            </p>
          </div>
          <Button
            type="button"
            className="rounded-full bg-[#365BEB] hover:bg-blue-700 text-white shrink-0 gap-2"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add bank account
          </Button>
        </CardHeader>
        <CardContent>
          {isFetchingBankAccounts ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : bankAccountsError ? (
            <p className="text-sm text-red-500 py-4 text-center">
              Could not load withdrawal accounts.
            </p>
          ) : !bankAccounts?.length ? (
            <div className="py-8 text-center flex flex-col items-center gap-3">
              <Building2 className="w-10 h-10 text-[#808080]/40" />
              <p className="text-sm text-[#808080]">
                No bank account added yet. Use the button above to add one for
                withdrawals.
              </p>
            </div>
          ) : (
            <div>
              {(showAll ? bankAccounts : bankAccounts.slice(0, 2)).map(
                (account) => (
                  <BankAccountRow
                    key={account.id}
                    account={account}
                    isDeleting={
                      isDeletingBankAccount && deleteTarget?.id === account.id
                    }
                    onDelete={() => setDeleteTarget(account)}
                  />
                )
              )}
              {!showAll && (bankAccounts?.length ?? 0) > 2 && (
                <div className="pt-3 border-t border-gray-100 mt-1">
                  <Link
                    href="/dashboard/wallet/bank-accounts"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#365BEB] hover:text-blue-700 transition-colors"
                  >
                    View all banks
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddBankAccountDialog open={addOpen} onOpenChange={setAddOpen} />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-[24px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove bank account?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  This will remove{" "}
                  <span className="font-medium text-[#111827]">
                    {deleteTarget.accountName}
                  </span>{" "}
                  ({deleteTarget.bankName} · {deleteTarget.accountNumber}) from
                  your withdrawal accounts.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="rounded-full"
              onClick={handleConfirmDelete}
              disabled={isDeletingBankAccount}
            >
              {isDeletingBankAccount ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Remove"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
