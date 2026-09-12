// A lightweight skeleton grid shown while product data is loading. Not
// needed today (data is local and synchronous), but kept ready for when
// products.js is replaced with a real API call.
export default function LoadingState({ count = 8 }) {
  return (
    <div className="product-grid" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-block skeleton-image" />
          <div className="skeleton-block skeleton-line" style={{ width: "70%" }} />
          <div className="skeleton-block skeleton-line" style={{ width: "40%" }} />
          <div className="skeleton-block skeleton-line" style={{ width: "90%" }} />
        </div>
      ))}
    </div>
  );
}
