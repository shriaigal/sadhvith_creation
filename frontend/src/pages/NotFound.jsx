import { Link } from "react-router-dom";
import { usePageTitle } from "../utils/usePageTitle";

export default function NotFound() {
  usePageTitle("Page Not Found");

  return (
    <section className="section">
      <div className="container not-found">
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </section>
  );
}
