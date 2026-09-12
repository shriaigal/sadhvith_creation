import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import ProductGallery from "../components/ProductGallery";
import WhatsAppButton from "../components/WhatsAppButton";
import SectionHeading from "../components/SectionHeading";
import ProductGrid from "../components/ProductGrid";
import LoadingState from "../components/LoadingState";
import { productsApi } from "../services/api";
import { formatPrice } from "../utils/formatPrice";
import { usePageTitle } from "../utils/usePageTitle";

export default function ProductDetails() {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  usePageTitle(product ? product.title : "Product");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await productsApi.getBySlug(slug);
        if (!cancelled) {
          setProduct(res.product);
          setRelated(res.relatedProducts || []);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.status === 404) setNotFound(true);
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <LoadingState count={1} />
        </div>
      </section>
    );
  }

  if (notFound || !product) {
    return (
      <section className="section">
        <div className="container not-found">
          <h1>Product Not Found</h1>
          <p>The product you're looking for could not be found.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  const discount = product.offerPercentage > 0 ? Math.round(product.offerPercentage) : 0;

  return (
    <section className="section">
      <div className="container">
        <Link to="/products" className="back-link">
          <ArrowLeft size={16} />
          Back to Products
        </Link>

        <div className="product-details">
          <ProductGallery images={product.images} productName={product.title} />

          <div className="product-info">
            {product.category && (
              <span className="product-info-category">{product.category}</span>
            )}

            <h1>{product.title}</h1>

            {typeof product.rating === "number" && (
              <div className="product-info-rating">
                <Star size={16} fill="currentColor" strokeWidth={0} />
                <span>{product.rating.toFixed(1)}</span>
                {typeof product.reviewCount === "number" && (
                  <span className="muted">({product.reviewCount} reviews)</span>
                )}
              </div>
            )}

            <div className="product-info-price">
              <span className="price-current">{formatPrice(product.finalPrice)}</span>
              {discount > 0 && (
                <>
                  <span className="price-original">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="price-discount">{discount}% off</span>
                </>
              )}
            </div>

            <p className="product-info-desc">{product.description}</p>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <dl className="spec-table">
                {Object.entries(product.specifications).map(([label, value]) => (
                  <div className="spec-row" key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="product-info-actions">
              <WhatsAppButton product={product} label="WhatsApp Enquire" size="lg" />
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="related-products">
            <SectionHeading title="You May Also Like" />
            <ProductGrid products={related} />
          </div>
        )}
      </div>
    </section>
  );
}
