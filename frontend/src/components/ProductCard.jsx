import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
import ProductImage from "./ProductImage";
import { formatPrice } from "../utils/formatPrice";

// Renders a single product as a card. Used by ProductGrid via
// products.map(...) — product data always comes from the backend API.
export default function ProductCard({ product }) {
  const discount = product.offerPercentage > 0 ? Math.round(product.offerPercentage) : 0;

  return (
    <article className="product-card">
      <Link to={`/products/${product.slug}`} className="product-card-media">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <ProductImage
          src={product.images?.[0]}
          alt={product.title}
          className="product-card-image"
        />
      </Link>

      <div className="product-card-body">
        <Link to={`/products/${product.slug}`} className="product-card-name">
          {product.title}
        </Link>

        {typeof product.rating === "number" && (
          <div className="product-card-rating">
            <Star size={14} fill="currentColor" strokeWidth={0} />
            <span>{product.rating.toFixed(1)}</span>
            {typeof product.reviewCount === "number" && (
              <span className="product-card-reviews">({product.reviewCount})</span>
            )}
          </div>
        )}

        <p className="product-card-desc">{product.shortDescription}</p>

        <div className="product-card-footer">
          <div className="product-card-price">
            <span className="price-current">{formatPrice(product.finalPrice)}</span>
            {discount > 0 && (
              <>
                <span className="price-original">{formatPrice(product.originalPrice)}</span>
                <span className="price-discount">{discount}% off</span>
              </>
            )}
          </div>

          <Link to={`/products/${product.slug}`} className="product-card-link">
            View Details
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
