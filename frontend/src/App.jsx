import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

// Components
import ConditionalNavbar from './components/ConditionalNavbar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import AdminNavbar from './components/AdminNavbar';
import HomeRoute from './components/HomeRoute';
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Shipping from './pages/Shipping';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCourses from './pages/AdminCourses';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminNotifications from './pages/AdminNotifications';
import AdminChats from './pages/AdminChats';
import AdminPaymentSettings from './pages/AdminPaymentSettings';
import AdminInvoices from './pages/AdminInvoices';
import Wishlist from './pages/Wishlist';
import MyCourses from './pages/MyCourses';
import CustomerChat from './pages/CustomerChat';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Returns from './pages/Returns';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { WishlistProvider } from './context/WishlistContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <NotificationProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Admin Routes - With Navbar/Footer */}
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
              <Route path="/admin/courses" element={<AdminLayout><AdminCourses /></AdminLayout>} />
              <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
              <Route path="/admin/notifications" element={<AdminLayout><AdminNotifications /></AdminLayout>} />
              <Route path="/admin/chats" element={<AdminLayout><AdminChats /></AdminLayout>} />
              <Route path="/admin/payment-settings" element={<AdminLayout><AdminPaymentSettings /></AdminLayout>} />
              <Route path="/admin/invoices" element={<AdminLayout><AdminInvoices /></AdminLayout>} />

              {/* Public Routes - With Navbar/Footer */}
              <Route path="/*" element={
                <div className="App">
                  <ConditionalNavbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<HomeRoute />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/shop/:id" element={<ProductDetail />} />
                      <Route path="/courses" element={<Courses />} />
                      <Route path="/courses/:id" element={<CourseDetail />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/verify-otp" element={<VerifyOTP />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/returns" element={<Returns />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                  />
                </div>
              } />

              {/* Authenticated Routes - With Navbar/Footer */}
              <Route path="/dashboard" element={
                <div className="App">
                  <Navbar />
                  <main>
                    <CustomerDashboard />
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                  />
                </div>
              } />
              <Route path="/cart" element={
                <div className="App">
                  <Navbar />
                  <main>
                    <Cart />
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                  />
                </div>
              } />
              <Route path="/checkout" element={
                <div className="App">
                  <Navbar />
                  <main>
                    <Checkout />
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                  />
                </div>
              } />
              <Route path="/shipping" element={
                <div className="App">
                  <Navbar />
                  <main>
                    <Shipping />
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                  />
                </div>
              } />
              <Route path="/profile" element={
                <div className="App">
                  <Navbar />
                  <main>
                    <Profile />
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                  />
                </div>
              } />
              <Route path="/notifications" element={
                <div className="App">
                  <Navbar />
                  <main>
                    <Notifications />
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                  />
                </div>
              } />
              <Route path="/orders" element={
                <div className="App">
                  <Navbar />
                  <main>
                    <Orders />
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                  />
                </div>
              } />
              <Route path="/orders/:id" element={
                <div className="App">
                  <Navbar />
                  <main>
                    <OrderDetail />
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                  />
                </div>
              } />
              <Route path="/wishlist" element={
                <div className="App">
                  <Navbar />
                  <main>
                    <Wishlist />
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                  />
                </div>
              } />
              <Route path="/my-courses" element={
                <div className="App">
                  <Navbar />
                  <main>
                    <MyCourses />
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                  />
                </div>
              } />
              <Route path="/chat/:orderId" element={
                <div className="App">
                  <Navbar />
                  <main>
                    <CustomerChat />
                  </main>
                  <Footer />
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                  />
                </div>
              } />
            </Routes>
          </Router>
          </NotificationProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
