import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProductForm from "./ProductForm";
import { managerProductsApi } from "../../services/api";
import { usePageTitle } from "../../utils/usePageTitle";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";

export default function EditProduct() {
  usePageTitle("Edit Product");
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      try {
        // The manager list endpoint includes inactive products too, so we
        // fetch from there and find the one being edited by id.
        const res = await managerProductsApi.list({ limit: 500 });
        const found = (res.products || []).find((p) => p.id === id);
        if (!found) throw new Error("Product not found.");
        if (!cancelled) setProduct(found);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="manager-shell">
      <div className="container">
        <Link to="/manager/products" className="back-link">
          <ArrowLeft size={16} />
          Back to Products
        </Link>
        <div className="manager-topbar">
          <div>
            <h1>Edit Product</h1>
            <p className="muted">Update the details and save your changes.</p>
          </div>
        </div>

        {loading ? (
          <LoadingState count={1} />
        ) : error || !product ? (
          <EmptyState title="Could not load product" message={error} />
        ) : (
          <div className="manager-form-card">
            <ProductForm mode="edit" initialProduct={product} />
          </div>
        )}
      </div>
    </div>
  );
}
