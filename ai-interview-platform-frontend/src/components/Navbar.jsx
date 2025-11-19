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
} from "lucide-react";
import logo from "../assets/intervueai-logo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State for UI interactions
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Helper to get display name/initials
  const userDisplayName =
    (user?.displayName && user.displayName.trim()) || user?.email || "User";
  const userInitials = userDisplayName.slice(0, 2).toUpperCase();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
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

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 py-2"
          : "bg-white border-b border-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <Link
            to={user ? "/dashboard" : "/"}
            className="flex items-center gap-2 group"
          >
            <img
              src={logo}
              alt="InterVueAI"
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {user && (
            <div className="hidden md:flex items-center bg-gray-100/50 rounded-full p-1 border border-gray-200/50 backdrop-blur-sm">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-white text-primary-600 shadow-sm ring-1 ring-gray-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        active ? "text-primary-600" : "text-gray-400"
                      }`}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="relative hidden md:block" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className={`flex items-center gap-3 pl-1 pr-2 py-1 rounded-full transition-all duration-200 border ${
                      profileDropdownOpen
                        ? "bg-gray-50 border-primary-200 ring-2 ring-primary-50"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {userInitials}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {userDisplayName}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                        profileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                      <div className="px-4 py-3 border-b border-gray-100 mb-1">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          Signed in as
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                      >
                        <Settings className="h-4 w-4" /> Settings
                      </Link>

                      <div className="h-px bg-gray-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 active:scale-95 transition-transform"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            ) : (
              /* Guest State */
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-xl md:hidden animate-in slide-in-from-top-5 duration-200">
          <div className="px-4 py-6 space-y-4">
            {user && (
              <div className="flex items-center gap-3 px-2 pb-4 border-b border-gray-100">
                <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg">
                  {userInitials}
                </div>
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
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                          isActive(link.path)
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
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
                    className="flex justify-center w-full px-4 py-3 rounded-xl text-white bg-primary-600 font-medium shadow-sm"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
