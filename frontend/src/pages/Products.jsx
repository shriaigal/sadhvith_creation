import { useEffect, useMemo, useState } from "react";
import SearchBar from "../components/SearchBar";
import ProductGrid from "../components/ProductGrid";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import { productsApi } from "../services/api";
import { usePageTitle } from "../utils/usePageTitle";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

export default function Products() {
  usePageTitle("Products");

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await productsApi.list({ limit: 200 });
        if (!cancelled) setAllProducts(res.products || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Categories are derived from the product data, not hardcoded, so a new
  // category added by a manager shows up here automatically.
  const categories = useMemo(() => {
    const unique = new Set(allProducts.map((p) => p.category).filter(Boolean));
    return ["All", ...unique];
  }, [allProducts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = allProducts.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      if (!matchesCategory) return false;

      if (!q) return true;

      const haystack = [
        product.title,
        product.description,
        product.shortDescription,
        product.category,
        product.material,
        ...(product.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });

    list = [...list];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.finalPrice - b.finalPrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.finalPrice - a.finalPrice);
        break;
      case "rating":
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        list.sort((a, b) => (b.featured === true) - (a.featured === true));
    }

    return list;
  }, [allProducts, query, category, sort]);

  return (
    <section className="section">
      <div className="container">
        <div className="page-intro">
          <h1>Our Products</h1>
          <p>Explore our collection</p>
        </div>

        <div className="products-toolbar">
          <SearchBar value={query} onChange={setQuery} />
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort by"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </div>

        {categories.length > 1 && (
          <div className="category-filter">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={
                  "category-chip" + (category === cat ? " category-chip-active" : "")
                }
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <LoadingState count={8} />
        ) : error ? (
          <EmptyState title="Could not load products" message={error} />
        ) : (
          <>
            <p className="results-count">{filtered.length} Products</p>
            <ProductGrid
              products={filtered}
              emptyTitle="No matching products"
              emptyMessage="Try a different search or category."
            />
          </>
        )}
      </div>
    </section>
  );
}
