import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProductForm from "./ProductForm";
import { usePageTitle } from "../../utils/usePageTitle";

export default function AddProduct() {
  usePageTitle("Add Product");

  return (
    <div className="manager-shell">
      <div className="container">
        <Link to="/manager/products" className="back-link">
          <ArrowLeft size={16} />
          Back to Products
        </Link>
        <div className="manager-topbar">
          <div>
            <h1>Add Product</h1>
            <p className="muted">Fill in the details below to publish a new product.</p>
          </div>
        </div>

        <div className="manager-form-card">
          <ProductForm mode="create" />
        </div>
      </div>
    </div>
  );
}
