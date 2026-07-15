import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import MainLayout from "./shared/MainLayout";
import AdminLayout from "./shared/AdminLayout";

import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderPage from "./pages/OrderPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import WishlistPage from "./pages/WishlistPage";

import LoginPage from "./auth/LoginPage";
import RegisterPage from "./auth/RegisterPage";

import DashboardPage from "./admin/DashboardPage";
import AdminProductPage from "./admin/AdminProductPage";
import AdminOrderPage from "./admin/AdminOrderPage";
import AdminUsersPage from "./admin/AdminUsersPage";
import AdminCouponPage from "./admin/AdminCouponPage";
import AdminUserDetailPage from "./admin/AdminUserDetailPage";
import AdminOrderDetailPage from "./admin/AdminOrderDetailPage";
import AdminSubscriberPage from "./admin/AdminSubscriberPage";

import { useAuth } from "./context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // wait until we know for sure before deciding to redirect
  if (isLoading) return null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}

const router = createBrowserRouter([
  // ── PUBLIC + CUSTOMER — inside MainLayout (Navbar + Footer) ──
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/shop", element: <ShopPage /> },
      { path: "/product/:id", element: <ProductDetailsPage /> },
      { path: "/cart", element: <CartPage /> },

      // Protected — must be logged in
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/checkout", element: <CheckoutPage /> },
          { path: "/order-success", element: <OrderSuccessPage /> },
          { path: "/orders", element: <OrderPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/wishlist", element: <WishlistPage /> },
        ],
      },

      // ── 404 — kept inside MainLayout so Navbar/Footer still show ──
      { path: "*", element: <NotFoundPage /> },
    ],
  },

  // ── AUTH — standalone pages (no Navbar/Footer) ──
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // ── ADMIN — AdminLayout (sidebar only) ──
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin", element: <DashboardPage /> },
          { path: "/admin/products", element: <AdminProductPage /> },
          { path: "/admin/orders", element: <AdminOrderPage /> },
          { path: "/admin/orders/:id", element: <AdminOrderDetailPage /> },
          { path: "/admin/users", element: <AdminUsersPage /> },
          { path: "/admin/users/:id", element: <AdminUserDetailPage /> },
          { path: "/admin/coupons", element: <AdminCouponPage /> },
          { path: "/admin/subscribers", element: <AdminSubscriberPage /> },
        ],
      },
    ],
  },
]);

export default router;