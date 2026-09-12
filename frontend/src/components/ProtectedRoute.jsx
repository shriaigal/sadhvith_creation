import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingState from "./LoadingState";

// Guards manager-only routes. Unauthenticated managers, or managers whose
// JWT has expired, are redirected to /manager/login.
export default function ProtectedRoute({ children }) {
  const { manager, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "3rem" }}>
        <LoadingState count={4} />
      </div>
    );
  }

  if (!manager) {
    return <Navigate to="/manager/login" state={{ from: location }} replace />;
  }

  return children;
}
