import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiBell,
  FiSettings,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiBookOpen,
  FiCpu,
  FiTerminal,
  FiPieChart,
  FiGrid
} from "react-icons/fi";
import { useApp } from "../context/AppContext";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const {
    user,
    logout,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    theme
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Scroll logic
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside notification panel close logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const guestLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" }
  ];

  const authLinks = [
    { path: "/dashboard", label: "Dashboard", icon: <FiGrid className="w-4 h-4" /> },
    { path: "/exams", label: "Mock Exams", icon: <FiBookOpen className="w-4 h-4" /> },
    { path: "/interviews", label: "Mock Interviews", icon: <FiCpu className="w-4 h-4" /> },
    { path: "/coding", label: "Coding Reviews", icon: <FiTerminal className="w-4 h-4" /> },
    { path: "/analytics", label: "Analytics", icon: <FiPieChart className="w-4 h-4" /> }
  ];

  const activeStyle =
    "text-primary-500 font-semibold border-b-2 border-primary-500 py-1.5 flex items-center space-x-1";
  const inactiveStyle =
    "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-medium py-1.5 transition-colors flex items-center space-x-1";

  const handleNotificationClick = async (notif) => {
    await markNotificationRead(notif._id);
    setShowNotifications(false);
    if (notif.type === "exam") navigate("/exams");
    else if (notif.type === "interview") navigate("/settings");
    else if (notif.type === "coding") navigate("/coding");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-white/80 dark:bg-darkBg/80 backdrop-blur-md shadow-lg border-b border-slate-100 dark:border-darkBorder"
          : "py-4 bg-white dark:bg-darkBg border-b border-slate-100/50 dark:border-darkBorder/30"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 text-white flex items-center justify-center font-extrabold text-xl shadow-lg shadow-primary-500/20">
              PM
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight leading-none">
                PrepMaster <span className="text-primary-500">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5 tracking-wider">
                Placement Prep Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!user &&
              guestLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
                >
                  {link.label}
                </NavLink>
              ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            {user ? (
              <>
                {/* Notifications dropdown trigger */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 relative transition-all"
                  >
                    <FiBell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown panel */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="absolute right-0 mt-3 w-80 bg-white dark:bg-darkCard rounded-3xl border border-slate-200 dark:border-darkBorder shadow-premium overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
                            Notifications
                          </h4>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllNotificationsRead}
                              className="text-xs text-primary-500 hover:text-primary-600 font-semibold"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                              No new notifications.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif._id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-3.5 border-b border-slate-100/60 dark:border-slate-800/40 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-start space-x-3 ${
                                  !notif.read ? "bg-primary-500/5" : ""
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                    !notif.read ? "bg-primary-500 animate-pulse" : "bg-slate-300"
                                  }`}
                                />
                                <div className="flex-1 text-xs">
                                  <p className="font-bold text-slate-800 dark:text-slate-200">
                                    {notif.title}
                                  </p>
                                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                    {notif.message}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Settings cog shortcut */}
                <Link
                  to="/settings"
                  className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all hidden md:block"
                >
                  <FiSettings className="w-5 h-5" />
                </Link>

                {/* Logged in desktop brief profile avatar */}
                <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-sm hidden md:flex">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    user.fullName.charAt(0).toUpperCase()
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500 hover:text-primary-500 dark:text-white transition-all font-semibold text-sm"
                >
                  <FiLogIn />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/10 transition-all font-semibold text-sm"
                >
                  <FiUserPlus />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 md:hidden transition-all"
            >
              {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (links & sidebar navigation on mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-darkBg border-t border-slate-200 dark:border-darkBorder"
          >
            <div className="px-4 py-4 space-y-2">
              {user ? (
                <>
                  {authLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm ${
                          isActive
                            ? "bg-primary-500 text-white font-bold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`
                      }
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </NavLink>
                  ))}
                  {user.role === "admin" && (
                    <NavLink
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm ${
                          isActive
                            ? "bg-rose-500 text-white font-bold"
                            : "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        }`
                      }
                    >
                      <FiSettings className="w-4 h-4" />
                      <span>Admin CRUD Dashboard</span>
                    </NavLink>
                  )}
                  <hr className="my-2 border-slate-100 dark:border-slate-800" />
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-600 dark:text-slate-300 text-sm"
                  >
                    <FiSettings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10 text-sm font-bold text-left"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  {guestLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-slate-700 dark:text-slate-300"
                    >
                      {link.label}
                    </NavLink>
                  ))}
                  <hr className="my-2 border-slate-100" />
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl text-slate-700 dark:text-slate-400 text-sm font-semibold"
                  >
                    <FiLogIn />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary-500 text-white text-sm font-bold shadow-md shadow-primary-500/10"
                  >
                    <FiUserPlus />
                    Register
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}