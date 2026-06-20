import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { CompareProvider } from './context/CompareContext'
import { AuthProvider } from './context/AuthContext'
import { AddressProvider } from './context/AddressContext'
import { CategoryProvider } from './context/CategoryContext'
import ScrollToTop from './components/common/ScrollToTop'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import CompareFloatingBar from './components/product/CompareFloatingBar'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import AccountPage from './pages/AccountPage'
import WishlistPage from './pages/WishlistPage'
import ComparePage from './pages/ComparePage'
import BlogPage from './pages/BlogPage'
import BlogPostPage from './pages/BlogPostPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import InvoicePage from './pages/InvoicePage'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminProductFormPage from './pages/admin/AdminProductFormPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminCustomersPage from './pages/admin/AdminCustomersPage'
import AdminDiscountsPage from './pages/admin/AdminDiscountsPage'
import AdminReviewsPage from './pages/admin/AdminReviewsPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminSlidesPage from './pages/admin/AdminSlidesPage'
import AdminAboutPage from './pages/admin/AdminAboutPage'
import AdminNewsletterPage from './pages/admin/AdminNewsletterPage'
import AdminMessagesPage from './pages/admin/AdminMessagesPage'

function MainLayout() {
  return (
    <CategoryProvider>
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <CompareFloatingBar />
    </CategoryProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AddressProvider>
        <CartProvider>
          <WishlistProvider>
            <CompareProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Admin panel — dedicated layout */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="products/new" element={<AdminProductFormPage />} />
                  <Route path="products/:id/edit" element={<AdminProductFormPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="discounts" element={<AdminDiscountsPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="slides" element={<AdminSlidesPage />} />
                  <Route path="about" element={<AdminAboutPage />} />
                  <Route path="newsletter" element={<AdminNewsletterPage />} />
                  <Route path="messages" element={<AdminMessagesPage />} />
                  <Route path="notifications" element={<AdminNotificationsPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>

                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/invoice/:orderNumber" element={<InvoicePage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </CompareProvider>
          </WishlistProvider>
        </CartProvider>
        </AddressProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
