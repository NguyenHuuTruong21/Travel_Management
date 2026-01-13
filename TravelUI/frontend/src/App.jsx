import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
// Forgot/Reset password pages removed
import LogoutButton from './components/LogoutButton';

// Admin imports
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UsersList from './pages/admin/Users/UsersList';
import ToursList from './pages/admin/Tours/ToursList';
import TourForm from './pages/admin/Tours/TourForm';
import BookingsList from './pages/admin/Bookings/BookingsList';
import HotelsList from './pages/admin/Hotels/HotelsList';
import HotelForm from './pages/admin/Hotels/HotelForm';
import GuidesList from './pages/admin/Guides/GuidesList';
import GuideForm from './pages/admin/Guides/GuideForm';
import VehiclesList from './pages/admin/Vehicles/VehiclesList';
import VehicleForm from './pages/admin/Vehicles/VehicleForm';
import Banners from './pages/admin/CMS/Banners';
import Posts from './pages/admin/CMS/Posts';
import Promotions from './pages/admin/CMS/Promotions';
import ReviewsList from './pages/admin/Reviews/ReviewsList';
import RevenueReport from './pages/admin/Reports/RevenueReport';
import CustomerReport from './pages/admin/Reports/CustomerReport';
import ServiceReport from './pages/admin/Reports/ServiceReport';
import Settings from './pages/admin/Settings/Settings';
import ContactsList from './pages/admin/Contacts/ContactsList';

// User imports
import UserLayout from './components/user/UserLayout';
import Home from './pages/user/Home';
import ToursPage from './pages/user/ToursPage';
import TourDetailPage from './pages/user/TourDetailPage';
import BookingPage from './pages/user/BookingPage';
import HotelBookingPage from './pages/user/HotelBookingPage';
import HotelsPage from './pages/user/HotelsPage';
import BlogPage from './pages/user/BlogPage';
import BlogDetailPage from './pages/user/BlogDetailPage';
import ContactPage from './pages/user/ContactPage';
import AboutPage from './pages/user/AboutPage';
import ProfilePage from './pages/user/ProfilePage';
import ServicesPage from './pages/user/ServicesPage';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="tours" element={<ToursPage />} />
            <Route path="tours/:id" element={<TourDetailPage />} />
            <Route path="booking/:id" element={<BookingPage />} />
            <Route path="booking/hotel/:id" element={<HotelBookingPage />} />
            <Route path="hotels" element={<HotelsPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:id" element={<BlogDetailPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Forgot/Reset password routes removed */}

          {/* Private routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Dashboard
                      </h1>
                      <LogoutButton />
                    </div>
                    <div className="border-t border-gray-200 pt-6">
                      <p className="text-lg text-gray-700">
                        Chào mừng bạn đã đăng nhập thành công! 🎉
                      </p>
                      <p className="mt-2 text-gray-600">
                        Đây là trang dashboard của bạn.
                      </p>
                      <a
                        href="/admin/dashboard"
                        className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                      >
                        Vào trang quản trị
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </PrivateRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersList />} />
            <Route path="tours" element={<ToursList />} />
            <Route path="tours/create" element={<TourForm />} />
            <Route path="tours/:id" element={<TourForm />} />
            <Route path="hotels" element={<HotelsList />} />
            <Route path="hotels/create" element={<HotelForm />} />
            <Route path="hotels/:id" element={<HotelForm />} />
            <Route path="guides" element={<GuidesList />} />
            <Route path="guides/create" element={<GuideForm />} />
            <Route path="guides/:id" element={<GuideForm />} />
            <Route path="vehicles" element={<VehiclesList />} />
            <Route path="vehicles/create" element={<VehicleForm />} />
            <Route path="vehicles/:id" element={<VehicleForm />} />
            <Route path="bookings" element={<BookingsList />} />
            <Route path="reviews" element={<ReviewsList />} />
            <Route path="banners" element={<Banners />} />
            <Route path="posts" element={<Posts />} />
            <Route path="promotions" element={<Promotions />} />
            <Route path="reports/revenue" element={<RevenueReport />} />
            <Route path="reports/customers" element={<CustomerReport />} />
            <Route path="reports/services" element={<ServiceReport />} />
            <Route path="settings" element={<Settings />} />
            <Route path="contacts" element={<ContactsList />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
