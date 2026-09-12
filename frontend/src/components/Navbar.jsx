import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { config } from "../config";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showManager, setShowManager] = useState(false);

  const location = useLocation();

  const { manager, logout } = useAuth();

  // Close mobile menu whenever route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Prevent background scroll while mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close manager popup when route changes.
  useEffect(() => {
    setShowManager(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setShowManager(false);
    setOpen(false);
  };

  return (
    <>
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
                  (isActive
                    ? " navbar-link-active"
                    : "")
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Manager Button */}
            {manager && (
              <button
                type="button"
                className="navbar-link"
                onClick={() => setShowManager(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  font: "inherit",
                  padding: 0,
                }}
              >
                Manager
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="navbar-toggle"
            aria-label={
              open ? "Close menu" : "Open menu"
            }
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
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

            {/* Mobile Manager Button */}
            {manager && (
              <button
                type="button"
                className="mobile-menu-link"
                onClick={() => {
                  setShowManager(true);
                  setOpen(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  font: "inherit",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                Manager
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* =========================
          MANAGER POPUP
          ========================= */}
      {showManager && manager && (
        <div
          onClick={() => setShowManager(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "400px",
              background: "#ffffff",
              borderRadius: "16px",
              padding: "28px",
              boxShadow:
                "0 20px 50px rgba(0, 0, 0, 0.25)",
              position: "relative",
            }}
          >

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowManager(false)}
              aria-label="Close manager information"
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                border: "none",
                background: "#f3f4f6",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={19} />
            </button>

            {/* Title */}
            <h2
              style={{
                margin: "0 0 24px",
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              Manager Information
            </h2>

            {/* Manager Information */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  Name
                </div>

                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {manager.name || "Not available"}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  Email
                </div>

                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    wordBreak: "break-word",
                  }}
                >
                  {manager.email || "Not available"}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginBottom: "4px",
                  }}
                >
                  Role
                </div>

                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Manager
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: "100%",
                marginTop: "28px",
                padding: "12px 18px",
                border: "none",
                borderRadius: "8px",
                background: "#dc2626",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}