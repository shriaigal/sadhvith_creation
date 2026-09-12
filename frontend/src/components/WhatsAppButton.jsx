import { MessageCircle } from "lucide-react";
import { openWhatsApp } from "../utils/whatsapp";

// A WhatsApp call-to-action button. Pass a `product` to generate a
// product-specific enquiry message, or omit it for a general enquiry.
export default function WhatsAppButton({
  product,
  label = "Chat on WhatsApp",
  size = "md",
  className = "",
}) {
  return (
    <button
      type="button"
      className={`btn btn-whatsapp ${size === "lg" ? "btn-lg" : ""} ${className}`}
      onClick={() => openWhatsApp(product)}
    >
      <MessageCircle size={18} strokeWidth={2} aria-hidden="true" />
      {label}
    </button>
  );
}
