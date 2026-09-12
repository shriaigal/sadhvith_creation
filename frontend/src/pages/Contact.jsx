import { Mail } from "lucide-react";
import WhatsAppButton from "../components/WhatsAppButton";
import { config } from "../config";
import { usePageTitle } from "../utils/usePageTitle";

export default function Contact() {
  usePageTitle("Contact");

  return (
    <section className="section">
      <div className="container">
        <div className="contact-card">
          <h1>Get in Touch</h1>
          <p>Have a question about a product? We'd be happy to help.</p>

          <WhatsAppButton size="lg" label="Chat on WhatsApp" />

          {config.contactEmail && (
            <a className="contact-email" href={`mailto:${config.contactEmail}`}>
              <Mail size={16} />
              {config.contactEmail}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
