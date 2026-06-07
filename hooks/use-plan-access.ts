import { useSubscription } from "@/hooks/use-subscription";

export const INVENTORY_PATH = "/dashboard/inventory";

export function usePlanAccess() {
  const { subscription, isFetchingSubscription } = useSubscription();

  const hasInventoryAccess =
    subscription?.limits?.hasInventoryManagement === true;

  const isInventoryLocked = !isFetchingSubscription && !hasInventoryAccess;

  return {
    subscription,
    isFetchingSubscription,
    hasInventoryAccess,
    isInventoryLocked,
  };
}
