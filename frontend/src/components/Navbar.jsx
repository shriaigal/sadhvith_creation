import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { config } from "../config";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000/api";

  // Close mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Check manager session
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          if (!cancelled) {
            setUser(null);
          }
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          setUser(data.user || data);
        }
      } catch (error) {
        if (!cancelled) {
          setUser(null);
        }
      }
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [API_URL, location.pathname]);

  // Logout
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    setUser(null);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">

        {/* Brand */}
        <NavLink
          to="/"
          className="navbar-brand"
          aria-label={`${config.brandName} home`}
        >
          <span
            className="navbar-brand-mark"
            aria-hidden="true"
          />

          {config.brandName}
        </NavLink>

        {/* Desktop Navigation */}
        <nav
          className="navbar-links"
          aria-label="Primary"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                "navbar-link" +
                (isActive ? " navbar-link-active" : "")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Show ONLY when manager is logged in */}
        {user && (
          <div className="navbar-session">
            <span className="navbar-username">
              {user.username ||
                user.name ||
                user.email ||
                "Manager"}
            </span>

            <button
              type="button"
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}

        {/* Mobile menu button */}
        <button
          type="button"
          className="navbar-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={
          "mobile-menu" +
          (open ? " mobile-menu-open" : "")
        }
      >
        <nav
          className="mobile-menu-links"
          aria-label="Mobile"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                "mobile-menu-link" +
                (isActive
                  ? " mobile-menu-link-active"
                  : "")
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Mobile session */}
          {user && (
            <div className="mobile-session">
              <span className="mobile-username">
                {user.username ||
                  user.name ||
                  user.email ||
                  "Manager"}
              </span>

              <button
                type="button"
                className="mobile-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}