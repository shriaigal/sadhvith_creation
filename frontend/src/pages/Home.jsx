import { useEffect, useState } from "react";
import { Leaf, Truck, HeartHandshake } from "lucide-react";
import Hero from "../components/Hero";
import SectionHeading from "../components/SectionHeading";
import ProductGrid from "../components/ProductGrid";
import LoadingState from "../components/LoadingState";
import WhatsAppButton from "../components/WhatsAppButton";
import { productsApi } from "../services/api";
import { usePageTitle } from "../utils/usePageTitle";

const features = [
  {
    icon: Leaf,
    title: "Thoughtfully made",
    text: "Every piece is finished by hand with attention to detail, not mass-produced.",
  },
  {
    icon: HeartHandshake,
    title: "Direct to you",
    text: "Message us on WhatsApp and get real answers from the people making your product.",
  },
  {
    icon: Truck,
    title: "Made to last",
    text: "Solid materials and simple construction, built for everyday use for years.",
  },
];

export default function Home() {
  usePageTitle("");

  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFeatured() {
      setLoading(true);
      try {
        // Prefer featured products; fall back to the newest six so the
        // homepage is never empty even if nothing is marked as featured.
        const featuredRes = await productsApi.list({ featured: true, sort: "featured", limit: 6 });
        let list = featuredRes.products;
        if (!list || list.length === 0) {
          const allRes = await productsApi.list({ sort: "newest", limit: 6 });
          list = allRes.products;
        }
        if (!cancelled) setCollection(list || []);
      } catch {
        if (!cancelled) setCollection([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFeatured();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Hero />

      <section className="section">
        <div className="container">
          <SectionHeading
            title="Our Collection"
            subtitle="A look at what we've been making lately"
            linkTo="/products"
            linkLabel="View All Products"
          />
          {loading ? <LoadingState count={6} /> : <ProductGrid products={collection} />}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHeading title="Why choose us" />
          <div className="features">
            {features.map(({ icon: Icon, title, text }) => (
              <div className="feature-card" key={title}>
                <Icon size={24} strokeWidth={1.6} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-banner">
            <h2>Have a question?</h2>
            <p>Talk to Sadvith Creation directly on WhatsApp.</p>
            <WhatsAppButton size="lg" />
          </div>
        </div>
      </section>
    </>
  );
}
