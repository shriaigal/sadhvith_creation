import { useState } from "react";
import { ImageOff } from "lucide-react";

// Renders a product image, falling back to a neutral placeholder if the
// source fails to load, so a broken URL never breaks the layout.
export default function ProductImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`image-fallback ${className}`} role="img" aria-label={alt}>
        <ImageOff size={28} strokeWidth={1.5} />
        <span>Product Image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
