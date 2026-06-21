import { createContext, useCallback, useContext, useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user: authUser, signOut: authSignOut, loading: authLoading } = useAuth();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("prepmaster_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem("prepmaster_user");
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("prepmaster_token") || "";
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("prepmaster_theme") || "dark";
  });

  const [notifications, setNotifications] = useState([]);
  const [loadingUser, setLoadingUser] = useState(authLoading);

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

  const clearBackendSession = useCallback(() => {
    setToken("");
    setUser(authUser || null);
    setNotifications([]);
    localStorage.removeItem("prepmaster_token");

    if (authUser) {
      localStorage.setItem("prepmaster_user", JSON.stringify(authUser));
    } else {
      localStorage.removeItem("prepmaster_user");
    }
  }, [authUser]);

  useEffect(() => {
    const initializeUser = async () => {
      if (!authLoading && token && !authUser) {
        try {
          const res = await API.get("/auth/profile");
          setUser(res.data);
          localStorage.setItem("prepmaster_user", JSON.stringify(res.data));

          const notifRes = await API.get("/notifications");
          setNotifications(notifRes.data);
        } catch {
          clearBackendSession();
        }
      }

      if (!authLoading) {
        setLoadingUser(false);
      }
    };

    initializeUser();
  }, [token, authLoading, authUser, clearBackendSession]);

  useEffect(() => {
    try {
      const justRegistered = sessionStorage.getItem("prepmaster_just_registered");
      if (justRegistered) {
        // Skip auto-login when the user has just registered and is being redirected to login.
        sessionStorage.removeItem("prepmaster_just_registered");
        return;
      }
    } catch {
      // ignore session storage errors
    }

    const syncId = window.setTimeout(() => {
      if (authUser) {
        setUser(authUser);
        localStorage.setItem("prepmaster_user", JSON.stringify(authUser));
        setLoadingUser(false);
      } else {
        setUser(null);
        localStorage.removeItem("prepmaster_user");
      }
    }, 0);

    return () => window.clearTimeout(syncId);
  }, [authUser]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const login = (userData, jwtToken) => {
    setToken(jwtToken || "");
    setUser(userData);
    localStorage.setItem("prepmaster_token", jwtToken || "");
    localStorage.setItem("prepmaster_user", JSON.stringify(userData));
    toast.success("Welcome back!", {
      style: {
        borderRadius: "12px",
        background: theme === "dark" ? "#1e293b" : "#ffffff",
        color: theme === "dark" ? "#f8fafc" : "#1e293b"
      }
    });
  };

  const logout = async () => {
    setToken("");
    setUser(null);
    setNotifications([]);
    localStorage.removeItem("prepmaster_token");
    localStorage.removeItem("prepmaster_user");

    if (authSignOut) {
      await authSignOut();
      return;
    }

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
    } catch {
      setNotifications([]);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast.error("Notification could not be updated.");
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch {
      toast.error("Notifications could not be updated.");
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
