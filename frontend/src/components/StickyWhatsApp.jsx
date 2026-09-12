import { MessageCircle } from "lucide-react";
import { getGeneralWhatsAppUrl } from "../utils/whatsapp";

// A small floating WhatsApp CTA shown only on mobile widths (see CSS),
// kept out of the way of the bottom of the viewport and any content.
export default function StickyWhatsApp() {
  return (
    <a
      href={getGeneralWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="sticky-whatsapp"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={22} />
    </a>
  );
}
