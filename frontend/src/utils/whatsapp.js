import { config } from "../config";
import { formatPrice } from "./formatPrice";

// Builds the wa.me URL for a general enquiry with no specific product.
export function getGeneralWhatsAppUrl() {
  const message = `Hello ${config.brandName},\n\nI'd like to know more about your products.`;
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

// Builds the wa.me URL for a product-specific enquiry, with the product's
// name, final (offer) price, and a couple of key specs filled in
// automatically. `product` is the shape returned by the backend API
// (title, finalPrice, material, size, ...).
export function getProductWhatsAppUrl(product) {
  const specLines = [];
  if (product.material) specLines.push(`Material: ${product.material}`);
  if (product.size) specLines.push(`Size: ${product.size}`);

  const message = [
    `Hello ${config.brandName},`,
    "",
    "I am interested in this product:",
    "",
    `Product: ${product.title}`,
    `Price: ${formatPrice(product.finalPrice)}`,
    ...specLines,
    "",
    "Please provide more information.",
  ].join("\n");

  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

// Opens a WhatsApp enquiry for a given product in a new tab.
export function openWhatsApp(product) {
  const url = product ? getProductWhatsAppUrl(product) : getGeneralWhatsAppUrl();
  window.open(url, "_blank", "noopener,noreferrer");
}
