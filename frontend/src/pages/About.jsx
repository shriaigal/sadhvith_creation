import { config } from "../config";
import { usePageTitle } from "../utils/usePageTitle";

export default function About() {
  usePageTitle("About");

  return (
    <section className="section">
      <div className="container about-page">
        <div className="page-intro">
          <h1>About {config.brandName}</h1>
        </div>

        <div className="about-content">
          <p>
            {config.brandName} focuses on creating thoughtfully designed and
            beautifully crafted products, with attention to detail and
            quality in every piece.
          </p>
          <p>
            We keep the range simple and considered rather than trying to be
            everything to everyone — each product is chosen and made with a
            clear idea of who it's for and where it will sit in a home or on
            a desk.
          </p>
          <p>
            If you have a question about materials, sizing, or customisation
            before you buy, the easiest way to reach us is over WhatsApp —
            you'll hear back from the people who actually make the products.
          </p>
        </div>
      </div>
    </section>
  );
}
