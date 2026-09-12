import { useState } from "react";
import ProductImage from "./ProductImage";

// Displays a main product image with a thumbnail strip. Works correctly
// even when a product only has a single image.
export default function ProductGallery({ images = [], productName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = images.length > 0 ? images : [null];
  const activeImage = safeImages[activeIndex] ?? safeImages[0];

  return (
    <div className="product-gallery">
      <div className="product-gallery-main">
        <ProductImage src={activeImage} alt={productName} />
      </div>

      {safeImages.length > 1 && (
        <div className="product-gallery-thumbs" role="tablist" aria-label="Product images">
          {safeImages.map((image, index) => (
            <button
              key={image || index}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              className={
                "product-gallery-thumb" +
                (index === activeIndex ? " product-gallery-thumb-active" : "")
              }
              onClick={() => setActiveIndex(index)}
            >
              <ProductImage src={image} alt={`${productName} view ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
