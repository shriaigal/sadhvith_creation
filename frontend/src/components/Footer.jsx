import { Link } from "react-router-dom";
import { Instagram, Facebook, MessageCircle } from "lucide-react";
import { config } from "../config";
import { getGeneralWhatsAppUrl } from "../utils/whatsapp";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-brand-name">{config.brandName}</span>
          <p>{config.tagline}</p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Connect</h4>
          <ul className="footer-social">
            <li>
              <a
                href={getGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </li>
            {config.social.instagram && (
              <li>
                <a href={config.social.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram size={16} />
                  Instagram
                </a>
              </li>
            )}
            {config.social.facebook && (
              <li>
                <a href={config.social.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook size={16} />
                  Facebook
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>
          © {year} {config.brandName}. All rights reserved.
        </p>
        {/* <Link to="/manager/login" className="footer-manager-link">
          Manager Login
        </Link> */}
      </div>
    </footer>
  );
}
