import { PackageSearch } from "lucide-react";

// A reusable empty/no-results state. Pass children for an optional action
// (e.g. a "Browse Products" button).
export default function EmptyState({ title, message, children }) {
  return (
    <div className="empty-state">
      <PackageSearch size={32} strokeWidth={1.5} aria-hidden="true" />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children}
    </div>
  );
}
