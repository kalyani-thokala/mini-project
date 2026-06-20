import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  FiGrid,
  FiBookOpen,
  FiTerminal,
  FiPieChart,
  FiUser,
  FiShield,
  FiLogOut,
  FiTrendingUp,
  FiCpu,
  FiClock
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function Sidebar() {
  const { user, logout, theme } = useApp();
  const navigate = useNavigate();

  if (!user) return null;

  const links = [
    { path: "/dashboard", label: "Dashboard", icon: <FiGrid className="w-5 h-5" /> },
    { path: "/exams", label: "Mock Exams", icon: <FiBookOpen className="w-5 h-5" /> },
    { path: "/interviews", label: "Mock Interviews", icon: <FiCpu className="w-5 h-5" /> },
    { path: "/coding", label: "Coding Reviews", icon: <FiTerminal className="w-5 h-5" /> },
    { path: "/leaderboard", label: "Leaderboard", icon: <FiTrendingUp className="w-5 h-5" /> },
    { path: "/history", label: "Practice History", icon: <FiClock className="w-5 h-5" /> },
    { path: "/analytics", label: "Analytics", icon: <FiPieChart className="w-5 h-5" /> },
    { path: "/settings", label: "Profile", icon: <FiUser className="w-5 h-5" /> }
  ];

  if (user.role === "admin") {
    links.push({
      path: "/admin",
      label: "Admin Panel",
      icon: <FiShield className="w-5 h-5 text-rose-500" />
    });
  }

  const activeClass =
    "flex items-center space-x-3 px-4 py-3 rounded-2xl bg-primary-600 text-white font-semibold shadow-lg shadow-primary-500/20 transition-all";
  const inactiveClass =
    "flex items-center space-x-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium transition-all";

  return (
    <div className="w-64 fixed top-20 bottom-4 left-4 z-45 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-6">
        {/* User profile brief card */}
        <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100/60 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
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
          <div className="truncate flex-1">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">
              {user.fullName}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium capitalize">
              {user.role} Member
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout button */}
      <div>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-semibold transition-all"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
