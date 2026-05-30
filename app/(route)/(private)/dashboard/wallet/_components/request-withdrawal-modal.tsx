"use client";

import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { formatCurrency } from "@/lib/format-currency";
import type {
  WalletBankAccount,
  RequestWithdrawalPayload,
} from "@/hooks/use-wallet";

interface RequestWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

export function RequestWithdrawalModal({
  open,
  onOpenChange,
  currentBalance,
}: RequestWithdrawalModalProps) {
  const {
    bankAccounts = [],
    isFetchingBankAccounts,
    requestWithdrawal,
    isRequestingWithdrawal,
  } = useWallet();

  const [selectedBankAccountId, setSelectedBankAccountId] =
    useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [error, setError] = useState<string>("");

  const selectedAccount = useMemo(() => {
    return bankAccounts?.find(
      (acc) => acc.id === Number(selectedBankAccountId),
    );
  }, [selectedBankAccountId, bankAccounts]);

  const amountNumber = parseFloat(amount) || 0;
  const isValidAmount = amountNumber > 0 && amountNumber <= currentBalance;
  const isFormValid =
    selectedBankAccountId && isValidAmount && !isRequestingWithdrawal;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (value === "" || /^\d+\.?\d{0,2}$/.test(value)) {
      setAmount(value);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBankAccountId || !isValidAmount) {
      setError("Please select a bank account and enter a valid amount");
      return;
    }

    try {
      const payload: RequestWithdrawalPayload = {
        amount: amountNumber,
        bankAccountId: Number(selectedBankAccountId),
      };

      await requestWithdrawal(payload);

      // Reset form on success
      setSelectedBankAccountId("");
      setAmount("");
      setError("");
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to request withdrawal",
      );
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setSelectedBankAccountId("");
      setAmount("");
      setError("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-[24px] sm:max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-[#111827]">
            Request Withdrawal
          </DialogTitle>
          <DialogDescription className="text-[#808080]">
            Enter the amount and select a bank account to withdraw your funds.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-y-auto flex-1 px-6"
        >
          {/* Current Balance Info */}
          <div className="bg-[#365BEB]/5 border border-[#365BEB]/10 rounded-xl p-4">
            <p className="text-xs text-[#808080] mb-1">Available Balance</p>
            <p className="text-lg font-bold text-[#365BEB]">
              {formatCurrency(currentBalance)}
            </p>
          </div>

          {/* Amount Input */}
          <div className="flex flex-col gap-2">
            <Label className="text-[#4D4D4D]">Amount</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={handleAmountChange}
              className="rounded-xl h-11"
              disabled={isRequestingWithdrawal}
            />
            {amount && !isValidAmount && (
              <p className="text-xs text-red-500">
                {amountNumber <= 0
                  ? "Amount must be greater than 0"
                  : "Amount exceeds available balance"}
              </p>
            )}
          </div>

          {/* Bank Account Select */}
          <div className="flex flex-col gap-2">
            <Label className="text-[#4D4D4D]">Select Bank Account</Label>
            {isFetchingBankAccounts ? (
              <div className="flex items-center gap-2 text-sm text-[#808080] py-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#365BEB]" />
                Loading bank accounts...
              </div>
            ) : !bankAccounts?.length ? (
              <Alert className="rounded-xl border-orange-200 bg-orange-50">
                <AlertCircle className="text-orange-600" />
                <AlertTitle className="text-orange-800 font-semibold">
                  No bank accounts
                </AlertTitle>
                <AlertDescription className="text-orange-700 text-sm mt-1">
                  You need to add a bank account first. Go to your withdrawal
                  accounts to add one.
                </AlertDescription>
              </Alert>
            ) : (
              <Select
                value={selectedBankAccountId}
                onValueChange={setSelectedBankAccountId}
              >
                <SelectTrigger className="rounded-xl h-11 w-full">
                  <SelectValue placeholder="Choose a bank account" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={String(account.id)}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate">
                          {account.accountName}
                        </span>

                        <span className="text-xs text-[#808080] truncate">
                          {account.bankName} · {account.accountNumber}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Account Details */}
          {selectedAccount && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-[#808080] mb-2">Withdrawing to</p>
              <div className="space-y-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827] break-words">
                  {selectedAccount.accountName}
                </p>

                <p className="text-xs text-[#808080] break-all">
                  {selectedAccount.bankName}
                </p>

                <p className="text-xs text-[#808080] break-all">
                  {selectedAccount.accountNumber}
                </p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="rounded-xl border-red-200 bg-red-50">
              <AlertCircle className="text-red-600" />
              <AlertTitle className="text-red-800 font-semibold">
                Error
              </AlertTitle>
              <AlertDescription className="text-red-700 text-sm mt-1">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter className="px-6 pb-6 pt-2 border-t border-gray-100 gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => handleOpenChange(false)}
            disabled={isRequestingWithdrawal}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={undefined}
            onClick={handleSubmit}
            className="rounded-full bg-[#365BEB] hover:bg-blue-700 flex-1"
            disabled={!isFormValid}
          >
            {isRequestingWithdrawal ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Request Withdrawal"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
