import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  History,
  FileText,
  ChevronDown,
  Settings,
  Shield,
} from "lucide-react";
import logo from "../assets/intervueai-logo.png";
import prephireIcon from "../assets/prephire-icon-circle.png";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();


  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const dropdownRef = useRef(null);


  const userDisplayName =
    (user?.displayName && user.displayName.trim()) || user?.email || "User";
  const userInitials = userDisplayName.slice(0, 2).toUpperCase();


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    // Set initial state
    handleScroll();
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/history", label: "History", icon: History },
    { path: "/upload-resume", label: "Resume", icon: FileText },
  ];

  if (user?.role === "admin") {
    navLinks.push({ path: "/admin", label: "Admin", icon: Shield });
  }

  return (
    <>
      {/* Backdrop overlay for mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && windowWidth < 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] rounded-full border ${
          isScrolled || (mobileMenuOpen && windowWidth < 768)
            ? "top-2 w-[calc(100%-1rem)] md:w-[calc(100%-3rem)] max-w-5xl bg-white shadow-md border-gray-200/50 py-1"
            : "top-4 w-[calc(100%-2rem)] max-w-screen-2xl bg-white/60 backdrop-blur-md shadow-sm border-transparent py-1.5"
        }`}
      >
        <div className="px-4 sm:px-6 py-1">
          <div className="flex justify-between items-center">

            <Link
              to={user ? "/dashboard" : "/"}
              className="flex items-center group relative z-10"
            >
              <img
                src={prephireIcon}
                alt="PrepHire Icon"
                className="h-8 w-8 transition-transform duration-300 group-hover:scale-105 rounded-full"
              />
              <img
                src={logo}
                alt="PrepHire"
                className="h-6 w-auto transition-transform duration-300 group-hover:scale-105 -ml-2"
              />
            </Link>


            {user && (
              <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1 p-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        data-tour={`nav-${link.label.toLowerCase()}`}
                        className={`relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                          active ? "text-[#1d2f62]" : "text-gray-500 hover:text-[#1d2f62]"
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="navbar-active-pill"
                            className="absolute inset-0 bg-white rounded-full shadow-sm ring-1 ring-black/5"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${active ? "text-primary-600" : "text-gray-400"}`} />
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}


            <div className="flex items-center gap-4 relative z-10">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="relative hidden md:block" ref={dropdownRef} data-tour="nav-profile">
                      <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className={`flex items-center gap-2 pl-2 pr-4 py-2 rounded-full transition-all duration-200 border ${
                        profileDropdownOpen
                          ? "bg-white border-primary-200 ring-2 ring-primary-100 shadow-md"
                          : "bg-white/50 border-transparent hover:bg-white hover:shadow-sm hover:border-gray-200"
                      }`}
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={userDisplayName}
                          className="h-7 w-7 rounded-full object-cover border border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold shadow-sm">
                          {userInitials}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 max-w-[150px] truncate">
                        {userDisplayName}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                          profileDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>


                    <AnimatePresence>
                      {profileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              Signed in as
                            </p>
                            <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">
                              {user.email}
                            </p>
                          </div>

                          <div className="p-1">
                            <Link
                              to="/settings"
                              className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-xl transition-colors"
                            >
                              <Settings className="h-4 w-4" /> Settings
                            </Link>
                            
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <LogOut className="h-4 w-4" /> Sign out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>


                  {windowWidth < 768 && (
                    <button
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                      className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-200 z-50"
                      aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                    >
                      {mobileMenuOpen ? (
                        <X className="h-6 w-6 stroke-[2.5]" />
                      ) : (
                        <Menu className="h-6 w-6 stroke-[2.5]" />
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="hidden sm:block px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-[#1d2f62] hover:bg-[#1d2f62] rounded-full shadow-lg hover:shadow-xl hover:shadow-[#1d2f62]/40 hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
         </div>


      </motion.nav>

      {/* Mobile Menu Dropdown - Outside navbar */}
      <AnimatePresence>
        {mobileMenuOpen && windowWidth < 768 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden ${
              isScrolled ? "top-[72px]" : "top-[88px]"
            }`}
          >
            <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
              {user && (
                <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl border border-primary-100/50">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={userDisplayName}
                      className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {userInitials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {userDisplayName}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {user ? (
                  <>
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex flex-row items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                            isActive(link.path)
                              ? "bg-gradient-to-r from-primary-50 to-blue-50 text-primary-700 shadow-sm"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isActive(link.path) ? "text-primary-600" : "text-gray-500"}`} />
                          {link.label}
                        </Link>
                      );
                    })}
                    

                    <Link
                      to="/settings"
                      className={`flex flex-row items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                        isActive("/settings")
                          ? "bg-gradient-to-r from-primary-50 to-blue-50 text-primary-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Settings className={`h-5 w-5 ${isActive("/settings") ? "text-primary-600" : "text-gray-500"}`} />
                      Settings
                    </Link>
                    
                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex flex-row items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-3 pt-2">
                    <Link
                      to="/login"
                      className="flex justify-center w-full px-4 py-3.5 rounded-xl text-gray-700 bg-gray-50 hover:bg-gray-100 font-medium transition-all duration-200"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="flex justify-center w-full px-4 py-3.5 rounded-xl text-white bg-gradient-to-r from-[#1d2f62] to-[#2a4080] font-medium shadow-lg hover:shadow-xl hover:shadow-[#1d2f62]/40 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
