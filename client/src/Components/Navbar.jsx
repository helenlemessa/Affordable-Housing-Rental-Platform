import { useState, useEffect, useRef, useContext } from "react";
import { Menu, X, Bell, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from './NotificationBell';
import { NotificationContext } from '../context/NotificationContext';

const Navbar = ({ onLoginClick, currentUser }) => {
  // Debug: Log current user and role on every render
  console.log('Navbar currentUser:', currentUser);
  console.log('User role:', currentUser?.role);
  
  const { notifications, unreadCount } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const { t } = useTranslation();

  // Enhanced role detection
  const isLandowner = currentUser?.role?.toLowerCase() === "landowner";
  const isAdmin = currentUser?.role === "admin" || localStorage.getItem("adminToken");

  console.log('isLandowner:', isLandowner, 'isAdmin:', isAdmin); // Debug role detection

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutsideMobile = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutsideMobile);
    } else {
      document.removeEventListener("mousedown", handleClickOutsideMobile);
    }

    return () => document.removeEventListener("mousedown", handleClickOutsideMobile);
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600">RentEasy</div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <li><Link to="/" className="hover:text-blue-600">{t("nav.home")}</Link></li>
          <li><Link to="/browse" className="hover:text-blue-600">{t("nav.browse")}</Link></li>
          {isAdmin && (
            <li>
              <Link to="/admin/dashboard" className="flex items-center text-purple-600 hover:text-purple-800">
                <Shield size={18} className="mr-1" />
                Admin
              </Link>
            </li>
          )}
          <li><Link to="/aboutus" className="hover:text-blue-600">{t("nav.about")}</Link></li>
          <li><Link to="/contact" className="hover:text-blue-600">{t("nav.contact")}</Link></li>
        </ul>

        {/* Right side (Desktop) */}
        <div className="hidden md:flex items-center space-x-6">
          <LanguageSwitcher />
          <NotificationBell notifications={notifications} unreadCount={unreadCount} />

          {currentUser || isAdmin ? (
            <div className="flex items-center space-x-4">
              {isLandowner && (
                <Link to="/add-listing">
                  <button 
                    className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-green-700 transition"
                    data-testid="add-listing-button" // For testing
                  >
                    {t("nav.postProperty") || "Add Listing"}
                  </button>
                </Link>
              )}
              <button 
                onClick={handleLogout} 
                className="text-red-600 hover:underline"
              >
                {t("nav.logout")}
              </button>
              {/* Debug badge */}
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {currentUser?.role || "guest"}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button onClick={onLoginClick} className="text-blue-600 hover:underline">
                {t("nav.login")}
              </button>
              <Link to="/signup">
                <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition">
                  {t("nav.signup")}
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu} aria-label="Toggle Menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-white shadow-md px-4 pb-4 space-y-3 text-gray-700 font-medium"
        >
          <Link to="/" onClick={() => setIsOpen(false)} className="block hover:text-blue-600">{t("nav.home")}</Link>
          <Link to="/browse" onClick={() => setIsOpen(false)} className="block hover:text-blue-600">{t("nav.browse")}</Link>
          {isAdmin && (
            <Link 
              to="/admin/dashboard" 
              onClick={() => setIsOpen(false)}
              className="flex items-center text-purple-600 hover:text-purple-800"
            >
              <Shield size={16} className="mr-1" />
              Admin Panel
            </Link>
          )}
          <Link to="/aboutus" onClick={() => setIsOpen(false)} className="block hover:text-blue-600">{t("nav.about")}</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className="block hover:text-blue-600">{t("nav.contact")}</Link>

          <hr />
          <LanguageSwitcher mobile />
          <NotificationBell notifications={notifications} unreadCount={unreadCount} mobile />

          {currentUser || isAdmin ? (
            <div className="space-y-2">
              {isLandowner && (
                <Link
                  to="/add-listing"
                  onClick={() => setIsOpen(false)}
                  className="block bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-green-700"
                >
                  {t("nav.postProperty") || "Add Listing"}
                </Link>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="block text-red-600 w-full text-left"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLoginClick();
                }}
                className="block text-blue-600 w-full text-left"
              >
                {t("nav.login")}
              </button>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="block bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700"
              >
                {t("nav.signup")}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;