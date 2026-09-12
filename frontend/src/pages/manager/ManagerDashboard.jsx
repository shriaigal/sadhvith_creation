import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, CheckCircle2, AlertTriangle, Star, Plus, List } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { managerApi } from "../../services/api";
import { usePageTitle } from "../../utils/usePageTitle";
import LoadingState from "../../components/LoadingState";

export default function ManagerDashboard() {
  usePageTitle("Manager Dashboard");
  const { manager, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    managerApi
      .dashboard()
      .then((res) => {
        if (!cancelled) setStats(res.stats);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: "Total Products", value: stats?.totalProducts, icon: Package },
    { label: "Active Products", value: stats?.activeProducts, icon: CheckCircle2 },
    { label: "Out of Stock", value: stats?.outOfStock, icon: AlertTriangle },
    { label: "Featured Products", value: stats?.featuredProducts, icon: Star },
  ];

  return (
    <div className="manager-shell">
      <div className="container">
        <div className="manager-topbar">
          <div>
            <h1>Welcome, {manager?.name}</h1>
            <p className="muted">Here's how your catalogue is doing.</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>

        {loading ? (
          <LoadingState count={4} />
        ) : (
          <div className="stats-grid">
            {cards.map(({ label, value, icon: Icon }) => (
              <div className="stat-card" key={label}>
                <Icon size={20} strokeWidth={1.6} color="var(--color-primary)" />
                <div className="stat-value">{value ?? 0}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="manager-actions">
          <Link to="/manager/products/add" className="btn btn-primary">
            <Plus size={16} /> Add Product
          </Link>
          <Link to="/manager/products" className="btn btn-secondary">
            <List size={16} /> Manage Products
          </Link>
        </div>
      </div>
    </div>
  );
}
