import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./i18n";

// Components
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import LoadingSpinner from "./Components/LoadingSpinner";
import LoginModal from "./pages/LoginModal";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AddListing from "./Components/AddListing";
import NewUsers from "./pages/admin/NewUsers";
import Users from "./pages/admin/Users";
import { NotificationProvider } from "./context/NotificationContext";

const Home = React.lazy(() => import("./Components/Homepage/Home"));
const Settings = React.lazy(() => import("./pages/Settings"));
const AboutUs = React.lazy(() => import("./pages/AboutUs"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));
const Signup = React.lazy(() => import("./pages/signup"));
const NotificationsPage = React.lazy(() => import("./pages/Notifications")); // Add this
import AdminRoute from './Components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import PendingListings from './pages/admin/PendingListings';
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";

export default function App() {
  const { t } = useTranslation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    try {
      if (storedUser && storedUser !== "undefined") {
        setCurrentUser(JSON.parse(storedUser));
      } else {
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Error parsing user:", error);
      localStorage.removeItem("user");
    }
  }, []);

  return (
    <NotificationProvider currentUser={currentUser}> {/* Wrap with NotificationProvider */}
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar
              currentUser={currentUser}
              onLoginClick={() => setShowLoginModal(true)}
            />

            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/aboutus" element={<AboutUs />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/notifications" element={<NotificationsPage />} /> {/* Add this route */}
                <Route path="*" element={<NotFound />} />
                <Route path="/add-listing" element={<AddListing currentUser={currentUser} />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/listing/:id" element={<ListingDetail setShowLoginModal={setShowLoginModal} />} />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <Users />
                  </AdminRoute>
                } />
                <Route path="/admin/new-users" element={
                  <AdminRoute>
                    <NewUsers />
                  </AdminRoute>
                } />
                <Route path="/admin/dashboard" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />
                <Route path="/admin/pending-listings" element={
                  <AdminRoute>
                    <PendingListings />
                  </AdminRoute>
                } />
              </Routes>
            </main>

            <Footer />

            {showLoginModal && (
              <LoginModal
                onClose={() => setShowLoginModal(false)}
              // In your login success handler
onLoginSuccess={(userData) => {
  console.log("Login success - user data:", userData); // Debug
  setCurrentUser(userData);
  localStorage.setItem('user', JSON.stringify(userData));
}}
              />
            )}
          </div>
        </Router>
      </Suspense>
    </NotificationProvider>
  );
}

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-xl text-gray-600">{t("notFound.message")}</p>
    </div>
  );
};