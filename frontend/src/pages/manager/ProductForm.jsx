import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, ImagePlus } from "lucide-react";
import { managerProductsApi } from "../../services/api";
import { formatPrice } from "../../utils/formatPrice";

const AVAILABILITY_OPTIONS = ["Available", "Made to Order", "Out of Stock", "Inactive"];
const MAX_IMAGES = 5;

function specsObjectToRows(specs) {
  const entries = Object.entries(specs || {});
  return entries.length > 0 ? entries.map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }];
}

// Shared form for both "Add Product" and "Edit Product". `initialProduct`
// is undefined for create, or the existing product object for edit.
export default function ProductForm({ initialProduct, mode }) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [title, setTitle] = useState(initialProduct?.title || "");
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || "");
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [originalPrice, setOriginalPrice] = useState(initialProduct?.originalPrice ?? "");
  const [offerPercentage, setOfferPercentage] = useState(initialProduct?.offerPercentage ?? 0);
  const [category, setCategory] = useState(initialProduct?.category || "");
  const [material, setMaterial] = useState(initialProduct?.material || "");
  const [size, setSize] = useState(initialProduct?.size || "");
  const [finish, setFinish] = useState(initialProduct?.finish || "");
  const [availability, setAvailability] = useState(initialProduct?.availability || "Available");
  const [badge, setBadge] = useState(initialProduct?.badge || "");
  const [featured, setFeatured] = useState(initialProduct?.featured || false);
  const [tags, setTags] = useState((initialProduct?.tags || []).join(", "));
  const [specRows, setSpecRows] = useState(specsObjectToRows(initialProduct?.specifications));

  const [existingImages, setExistingImages] = useState(initialProduct?.images || []);
  const [newImages, setNewImages] = useState([]); // [{file, previewUrl}]

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalImageCount = existingImages.length + newImages.length;

  const pricePreview = useMemo(() => {
    const price = parseFloat(originalPrice);
    const offer = parseFloat(offerPercentage) || 0;
    if (!price || price <= 0) return null;
    const discountAmount = Math.round(((price * offer) / 100) * 100) / 100;
    const finalPrice = Math.round((price - discountAmount) * 100) / 100;
    return { discountAmount, finalPrice };
  }, [originalPrice, offerPercentage]);

  function handleAddImages(fileList) {
    const files = Array.from(fileList || []);
    const room = MAX_IMAGES - totalImageCount;
    if (room <= 0) {
      setError(`You can only have up to ${MAX_IMAGES} images per product.`);
      return;
    }
    const accepted = files.slice(0, room).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewImages((imgs) => [...imgs, ...accepted]);
    if (files.length > room) {
      setError(`Only ${room} more image(s) could be added — the limit is ${MAX_IMAGES}.`);
    }
  }

  function removeExistingImage(url) {
    setExistingImages((imgs) => imgs.filter((img) => img !== url));
  }

  function removeNewImage(index) {
    setNewImages((imgs) => imgs.filter((_, i) => i !== index));
  }

  function updateSpecRow(index, field, value) {
    setSpecRows((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addSpecRow() {
    setSpecRows((rows) => [...rows, { key: "", value: "" }]);
  }

  function removeSpecRow(index) {
    setSpecRows((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Product title is required.");
    if (!description.trim()) return setError("Description is required.");
    if (!originalPrice || Number(originalPrice) <= 0) return setError("Original price must be greater than 0.");
    if (totalImageCount === 0) return setError("Please add at least 1 product image.");
    if (totalImageCount > MAX_IMAGES) return setError(`A product can have at most ${MAX_IMAGES} images.`);

    const specifications = {};
    specRows.forEach(({ key, value }) => {
      if (key.trim()) specifications[key.trim()] = value.trim();
    });

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("shortDescription", shortDescription.trim());
    formData.append("description", description.trim());
    formData.append("originalPrice", String(originalPrice));
    formData.append("offerPercentage", String(offerPercentage || 0));
    formData.append("category", category.trim());
    formData.append("material", material.trim());
    formData.append("size", size.trim());
    formData.append("finish", finish.trim());
    formData.append("availability", availability);
    formData.append("badge", badge.trim());
    formData.append("featured", String(featured));
    formData.append(
      "tags",
      JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean))
    );
    formData.append("specifications", JSON.stringify(specifications));
    newImages.forEach((img) => formData.append("images", img.file));
    if (isEdit) {
      formData.append("existingImages", JSON.stringify(existingImages));
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await managerProductsApi.update(initialProduct.id, formData);
      } else {
        await managerProductsApi.create(formData);
      }
      navigate("/manager/products", { replace: true });
    } catch (err) {
      setError(err.message || "Could not save product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <h3>Basic Information</h3>
        <div className="form-field">
          <label htmlFor="title">Product Title *</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="shortDescription">Short Description</label>
          <input
            id="shortDescription"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Pricing</h3>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="originalPrice">Original Price (₹) *</label>
            <input
              id="originalPrice"
              type="number"
              min="1"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="offerPercentage">Offer Percentage (%)</label>
            <input
              id="offerPercentage"
              type="number"
              min="0"
              max="100"
              step="1"
              value={offerPercentage}
              onChange={(e) => setOfferPercentage(e.target.value)}
            />
          </div>
        </div>
        {pricePreview && (
          <div className="price-preview">
            <span>
              Discount: <strong>{formatPrice(pricePreview.discountAmount)}</strong>
            </span>
            <span>
              Final Price: <strong>{formatPrice(pricePreview.finalPrice)}</strong>
            </span>
            <span className="muted" style={{ fontSize: "0.8rem" }}>
              (recalculated and saved by the server)
            </span>
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>Product Information</h3>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="category">Category</label>
            <input id="category" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="material">Material</label>
            <input id="material" value={material} onChange={(e) => setMaterial(e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="size">Size</label>
            <input id="size" value={size} onChange={(e) => setSize(e.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="finish">Finish</label>
            <input id="finish" value={finish} onChange={(e) => setFinish(e.target.value)} />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="availability">Availability</label>
          <select id="availability" value={availability} onChange={(e) => setAvailability(e.target.value)}>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-section">
        <h3>Optional Details</h3>
        <div className="form-row">
          <div className="form-field">
            <label htmlFor="badge">Badge</label>
            <input
              id="badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. Best Seller, New, Limited"
            />
          </div>
          <div className="form-field checkbox-field">
            <input
              id="featured"
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <label htmlFor="featured">Featured Product</label>
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="wood, entrance, home" />
        </div>

        <div className="form-field">
          <label>Specifications</label>
          {specRows.map((row, index) => (
            <div className="form-row" key={index} style={{ marginBottom: "0.5rem" }}>
              <input
                placeholder="Label (e.g. Material)"
                value={row.key}
                onChange={(e) => updateSpecRow(index, "key", e.target.value)}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  placeholder="Value (e.g. Sheesham Wood)"
                  value={row.value}
                  onChange={(e) => updateSpecRow(index, "value", e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="icon-btn icon-btn-danger"
                  onClick={() => removeSpecRow(index)}
                  aria-label="Remove specification"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addSpecRow} style={{ marginTop: "0.25rem" }}>
            <Plus size={14} /> Add Specification
          </button>
        </div>
      </div>

      <div className="form-section">
        <h3>Images (1–{MAX_IMAGES})</h3>
        <div className="image-upload-grid">
          {existingImages.map((url) => (
            <div className="image-upload-tile" key={url}>
              <img src={url} alt="Product" />
              <button
                type="button"
                className="image-upload-remove"
                onClick={() => removeExistingImage(url)}
                aria-label="Remove image"
              >
                <X size={13} />
              </button>
            </div>
          ))}
          {newImages.map((img, index) => (
            <div className="image-upload-tile" key={img.previewUrl}>
              <img src={img.previewUrl} alt="New upload preview" />
              <button
                type="button"
                className="image-upload-remove"
                onClick={() => removeNewImage(index)}
                aria-label="Remove image"
              >
                <X size={13} />
              </button>
            </div>
          ))}
          {totalImageCount < MAX_IMAGES && (
            <label className="image-upload-add">
              <ImagePlus size={20} />
              Add Image
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={(e) => handleAddImages(e.target.files)}
              />
            </label>
          )}
        </div>
        <p className="image-limit-note">
          {totalImageCount}/{MAX_IMAGES} images. JPG, PNG or WEBP, up to 5MB each.
        </p>
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
      </button>
    </form>
  );
}
