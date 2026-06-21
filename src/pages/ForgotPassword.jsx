import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.post("/auth/forgot-password", { email });
      toast.success("Reset link generated!");
      setSent(true);
      if (res.data.token) {
        setResetToken(res.data.token);
      }
    } catch (error) {
      toast.error(error?.userMessage || error?.response?.data?.message || "Failed to submit reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-220px)] flex items-center justify-center pt-[50px] pb-12 px-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-darkBorder/40 bg-white/80 dark:bg-darkCard/80 backdrop-blur-md shadow-premium relative overflow-hidden"
      >
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Reset Password
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {!sent
              ? "Enter your email address to receive a password reset token link."
              : "Reset instructions generated successfully."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10 text-xs font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-bold text-slate-800 dark:text-white mb-2">Mock Reset Link (Token):</p>
              <Link
                to={`/reset-password/${resetToken}`}
                className="text-primary-500 hover:underline break-all block font-mono"
              >
                {window.location.origin}
                {import.meta.env.BASE_URL}#/reset-password/{resetToken}
              </Link>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <FiArrowLeft />
              <span>Back to Login</span>
            </Link>
          </div>
        )}

        {!sent && (
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
            >
              <FiArrowLeft />
              <span>Back to Login</span>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
