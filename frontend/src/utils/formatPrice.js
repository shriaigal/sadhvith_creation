import { config } from "../config";

// Formats a number as Indian Rupee currency, e.g. formatPrice(1499) -> "₹1,499"
export function formatPrice(amount) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "";

  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);

  return `${config.currencySymbol}${formatted}`;
}

// Returns the discount percentage between an original and current price,
// or 0 when there is no real discount. Kept for any legacy/local data;
// backend-driven products carry their own authoritative offerPercentage.
export function getDiscountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
