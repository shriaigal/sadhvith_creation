import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Scrolls the window to the top on every route change, so navigating to a
// new page (e.g. a product's details) doesn't leave the scroll position
// stuck partway down.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
