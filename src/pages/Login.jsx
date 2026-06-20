import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";
import { FiMail, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password
      });

      toast.success("Successfully logged in!");
      login(response.data.user, response.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-220px)] flex items-center justify-center pt-[50px] pb-12 px-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-md w-full p-8 rounded-3xl border border-slate-200/80 dark:border-darkBorder/40 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md shadow-premium relative overflow-hidden"
      >
        {/* Decorative subtle background gradient blobs */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-secondary-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Log in to access your dashboard and resume prep
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <FiMail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-darkBorder/60 hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary-500 focus:outline-none rounded-2xl text-sm font-semibold transition-all dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <FiLock className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-darkBorder/60 hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary-500 focus:outline-none rounded-2xl text-sm font-semibold transition-all dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-primary-500 hover:text-primary-600 hover:underline cursor-pointer transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary-500 hover:underline">
            Register Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}