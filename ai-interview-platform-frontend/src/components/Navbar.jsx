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
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
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
    
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 rounded-2xl border w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] max-w-7xl ${
          isScrolled
            ? "bg-white/90 backdrop-blur-xl shadow-lg border-white/20"
            : "bg-white/80 backdrop-blur-md shadow-md border-white/40"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">

            <Link
              to={user ? "/dashboard" : "/"}
              className="flex items-center group relative z-10"
            >
              <img
                src={prephireIcon}
                alt="PrepHire Icon"
                className="h-10 w-10 transition-transform duration-300 group-hover:scale-105 rounded-full"
              />
              <img
                src={logo}
                alt="PrepHire"
                className="h-9 w-auto transition-transform duration-300 group-hover:scale-105 -ml-2"
              />
            </Link>


            {user && (
              <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-full border border-gray-200/50 backdrop-blur-sm">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        data-tour={`nav-${link.label.toLowerCase()}`}
                        className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                          active ? "text-[#1d2f62]" : "text-[#1d2f62] hover:text-[#1d2f62]"
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="navbar-active-pill"
                            className="absolute inset-0 bg-white rounded-full shadow-sm ring-1 ring-black/5"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
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
                      className={`flex items-center gap-3 pl-2 pr-4 py-2 rounded-full transition-all duration-200 border ${
                        profileDropdownOpen
                          ? "bg-white border-primary-200 ring-2 ring-primary-100 shadow-md"
                          : "bg-white/50 border-transparent hover:bg-white hover:shadow-sm hover:border-gray-200"
                      }`}
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={userDisplayName}
                          className="h-8 w-8 rounded-full object-cover border border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold shadow-sm">
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
                      className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 active:scale-95 transition-transform"
                    >
                      {mobileMenuOpen ? (
                        <X className="h-6 w-6" />
                      ) : (
                        <Menu className="h-6 w-6" />
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


        <AnimatePresence>
          {mobileMenuOpen && windowWidth < 768 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-t border-gray-100 bg-white/50 backdrop-blur-xl rounded-b-2xl overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {user && (
                  <div className="flex items-center gap-3 px-2 pb-4 border-b border-gray-200/50">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={userDisplayName}
                        className="h-10 w-10 rounded-full object-cover border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                        {userInitials}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {userDisplayName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
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
                            className={`flex flex-row items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                              isActive(link.path)
                                ? "bg-primary-50 text-primary-700"
                                : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            {link.label}
                          </Link>
                        );
                      })}
                      

                      <Link
                        to="/settings"
                        className={`flex flex-row items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                          isActive("/settings")
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900"
                        }`}
                      >
                        <Settings className="h-5 w-5" />
                        Settings
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex flex-row items-center gap-3 px-4 py-3 mt-4 rounded-xl text-base font-medium text-red-600 hover:bg-red-50/80 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="grid gap-3">
                      <Link
                        to="/login"
                        className="flex justify-center w-full px-4 py-3 rounded-xl text-gray-700 bg-gray-50 font-medium"
                      >
                        Log In
                      </Link>
                      <Link
                        to="/register"
                        className="flex justify-center w-full px-4 py-3 rounded-xl text-white bg-[#1d2f62] font-medium shadow-lg hover:shadow-xl hover:shadow-[#1d2f62]/40 hover:scale-105 active:scale-95 transition-all duration-300"
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
      </motion.nav>
    </>
  );
};

export default Navbar;
