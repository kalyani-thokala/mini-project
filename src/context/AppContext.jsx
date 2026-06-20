import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("prepmaster_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("prepmaster_token") || "";
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("prepmaster_theme") || "dark"; // Default to dark for premium edtech feel
  });

  const [notifications, setNotifications] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);

  // Sync HTML document theme class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      document.body.classList.remove("dark");
    }
    localStorage.setItem("prepmaster_theme", theme);
  }, [theme]);

  // Load profile and notifications if logged in
  useEffect(() => {
    const initializeUser = async () => {
      if (token) {
        try {
          // Verify token and fetch profile
          const res = await API.get("/auth/profile");
          setUser(res.data);
          localStorage.setItem("prepmaster_user", JSON.stringify(res.data));
          
          // Fetch notifications
          const notifRes = await API.get("/notifications");
          setNotifications(notifRes.data);
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
      setLoadingUser(false);
    };

    initializeUser();
  }, [token]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const login = (userData, jwtToken) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem("prepmaster_token", jwtToken);
    localStorage.setItem("prepmaster_user", JSON.stringify(userData));
    toast.success("Welcome back!", {
      style: {
        borderRadius: "12px",
        background: theme === "dark" ? "#1e293b" : "#ffffff",
        color: theme === "dark" ? "#f8fafc" : "#1e293b"
      }
    });
  };

  const logout = () => {
    setToken("");
    setUser(null);
    setNotifications([]);
    localStorage.removeItem("prepmaster_token");
    localStorage.removeItem("prepmaster_user");
    toast.success("Logged out successfully.", {
      style: {
        borderRadius: "12px",
        background: theme === "dark" ? "#1e293b" : "#ffffff",
        color: theme === "dark" ? "#f8fafc" : "#1e293b"
      }
    });
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("prepmaster_user", JSON.stringify(updatedUser));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        theme,
        toggleTheme,
        login,
        logout,
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        updateUserProfile,
        loadingUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
