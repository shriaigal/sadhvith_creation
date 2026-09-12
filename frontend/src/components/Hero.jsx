import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";
import WhatsAppButton from "./WhatsAppButton";
import { productsApi } from "../services/api";

// A small, hand-arranged stack of product photos rather than a single
// generic hero banner — it reads as a table of real, tangible objects.
// Images come from the live backend catalogue, so the hero always shows
// real current products instead of stale hardcoded ones.
export default function Hero() {
  const [heroImages, setHeroImages] = useState([]);

  useEffect(() => {
    let cancelled = false;
    productsApi
      .list({ sort: "featured", limit: 3 })
      .then((res) => {
        if (!cancelled) setHeroImages(res.products || []);
      })
      .catch(() => {
        if (!cancelled) setHeroImages([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <h1>
            Made with care.
            <br />
            Created for you.
          </h1>
          <p>
            Discover thoughtfully designed, handcrafted products from
            Sadvith Creation — made for homes and desks that like to keep
            things simple.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Explore Products
            </Link>
            <WhatsAppButton size="lg" />
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          {heroImages.map((product, index) => (
            <div className={`hero-visual-frame hero-visual-frame-${index}`} key={product.id}>
              <ProductImage src={product.images?.[0]} alt="" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
