export const formatCurrency = (amount: number) => {
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
  return formatted.replace(/^₦\s*/, "₦ ");
};