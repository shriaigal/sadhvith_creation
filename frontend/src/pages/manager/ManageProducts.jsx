import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { managerProductsApi } from "../../services/api";
import { formatPrice } from "../../utils/formatPrice";
import { usePageTitle } from "../../utils/usePageTitle";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import ProductImage from "../../components/ProductImage";

function statusClass(availability) {
  if (availability === "Out of Stock") return "status-out";
  if (availability === "Inactive") return "status-inactive";
  return "";
}

export default function ManageProducts() {
  usePageTitle("Manage Products");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const res = await managerProductsApi.list({ sort: "newest" });
      setProducts(res.products || []);
    } catch (err) {
      setError(err.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await managerProductsApi.remove(pendingDelete.id);
      setProducts((list) => list.filter((p) => p.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setError(err.message || "Could not delete product.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="manager-shell">
      <div className="container">
        <div className="manager-topbar">
          <div>
            <h1>Manage Products</h1>
            <p className="muted">{products.length} product(s) in your catalogue.</p>
          </div>
          <Link to="/manager/products/add" className="btn btn-primary">
            <Plus size={16} /> Add Product
          </Link>
        </div>

        {error && <div className="form-error">{error}</div>}

        {loading ? (
          <LoadingState count={4} />
        ) : products.length === 0 ? (
          <EmptyState title="No products yet" message="Add your first product to get started." />
        ) : (
          <div className="manager-table-wrap">
            <table className="manager-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Original Price</th>
                  <th>Offer</th>
                  <th>Final Price</th>
                  <th>Availability</th>
                  <th>Badge</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <ProductImage
                        src={product.images?.[0]}
                        alt={product.title}
                        className="manager-table-thumb"
                      />
                    </td>
                    <td>{product.title}</td>
                    <td>{product.category || "—"}</td>
                    <td>{formatPrice(product.originalPrice)}</td>
                    <td>{product.offerPercentage > 0 ? `${Math.round(product.offerPercentage)}%` : "—"}</td>
                    <td>{formatPrice(product.finalPrice)}</td>
                    <td>
                      <span className={`status-pill ${statusClass(product.availability)}`}>
                        {product.availability}
                      </span>
                    </td>
                    <td>{product.badge || "—"}</td>
                    <td>
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/products/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="icon-btn"
                          title="View"
                          aria-label="View product"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          to={`/manager/products/edit/${product.id}`}
                          className="icon-btn"
                          title="Edit"
                          aria-label="Edit product"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          title="Delete"
                          aria-label="Delete product"
                          onClick={() => setPendingDelete(product)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pendingDelete && (
        <div className="confirm-dialog-backdrop" role="dialog" aria-modal="true">
          <div className="confirm-dialog">
            <h3>Delete this product?</h3>
            <p>
              Are you sure you want to delete "{pendingDelete.title}"? This cannot be
              undone.
            </p>
            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
