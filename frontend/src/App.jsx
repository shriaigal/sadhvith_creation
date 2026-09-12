import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import StickyWhatsApp from "./components/StickyWhatsApp";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ManagerLogin from "./pages/manager/ManagerLogin";
import ManagerRegister from "./pages/manager/ManagerRegister";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManageProducts from "./pages/manager/ManageProducts";
import AddProduct from "./pages/manager/AddProduct";
import EditProduct from "./pages/manager/EditProduct";

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <ScrollToTop />
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/manager/login" element={<ManagerLogin />} />
            <Route path="*" element={<ManagerRegister />} />
            <Route
              path="/manager/dashboard"
              element={
                <ProtectedRoute>
                  <ManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/products"
              element={
                <ProtectedRoute>
                  <ManageProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/products/add"
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/products/edit/:id"
              element={
                <ProtectedRoute>
                  <EditProduct />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        <StickyWhatsApp />
      </div>
    </AuthProvider>
  );
}
