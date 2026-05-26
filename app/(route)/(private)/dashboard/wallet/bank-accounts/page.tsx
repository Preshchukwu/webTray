import { PageHeader } from "@/components/page-header";
import { WithdrawalBankAccounts } from "../_components/withdrawal-bank-accounts";

export const metadata = {
  title: "Withdrawal Accounts | Webtray",
  description: "Manage your saved bank accounts for withdrawals.",
};

export default function BankAccountsPage() {
  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 w-full">
      <PageHeader
        showBackButton
        backButtonHref="/dashboard/wallet"
        backButtonLabel="Back to Wallet"
        title="Withdrawal Accounts"
        subtitle="Manage your saved bank accounts for withdrawals."
      />

      <div className="max-w-2xl w-full">
        <WithdrawalBankAccounts showAll={true} />
      </div>
    </div>
  );
}
