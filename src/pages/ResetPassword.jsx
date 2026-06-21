import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { FiLock, FiArrowLeft, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters long");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return toast.error(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
    }

    try {
      setLoading(true);
      await API.post("/auth/reset-password", {
        token,
        password: newPassword
      });
      toast.success("Password reset successfully!");
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      toast.error(error?.userMessage || error?.response?.data?.message || "Failed to reset password.");
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
            {success ? "Password Updated Successfully" : "New Password"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {!success
              ? "Set a secure, strong password for your PrepMaster AI account."
              : "Redirecting to login page in 3 seconds..."}
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <FiLock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-darkBorder/60 hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary-500 focus:outline-none rounded-2xl text-sm font-semibold transition-all dark:text-white"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <FiLock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-darkBorder/60 hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary-500 focus:outline-none rounded-2xl text-sm font-semibold transition-all dark:text-white"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>Reset Password</span>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <FiCheck className="w-8 h-8" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Redirecting you to login in a moment...
            </p>
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white animate-pulse"
            >
              <FiArrowLeft />
              <span>Back to Login Now</span>
            </Link>
          </div>
        )}

        {!success && (
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
