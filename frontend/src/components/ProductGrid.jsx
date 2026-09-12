import ProductCard from "./ProductCard";
import EmptyState from "./EmptyState";

// Renders a responsive grid of product cards from a list of products.
// Products come from the backend API — adding a product through the
// manager dashboard automatically produces a new card here.
export default function ProductGrid({ products, emptyTitle, emptyMessage }) {
  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || "No products available"}
        message={emptyMessage || "Please check back soon."}
      />
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
