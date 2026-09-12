import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search products..." }) {
  return (
    <div className="search-bar">
      <Search size={17} className="search-bar-icon" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
      />
      {value && (
        <button
          type="button"
          className="search-bar-clear"
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
