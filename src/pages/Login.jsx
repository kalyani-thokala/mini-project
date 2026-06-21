import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiMail, FiLock } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { loginUser } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const { signInWithGoogle, authActionLoading } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/dashboard";
  const [registeredMsg] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      let jwtToken = "";
      let loggedUser = {
        uid: firebaseUser.uid,
        fullName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "PrepMaster User",
        email: firebaseUser.email || "",
        avatar: firebaseUser.photoURL || "",
        photoURL: firebaseUser.photoURL || ""
      };

      try {
        const backendRes = await loginUser({ email, password });
        jwtToken = backendRes.token;
        if (backendRes.user) {
          loggedUser = {
            ...loggedUser,
            ...backendRes.user,
            uid: firebaseUser.uid
          };
        }
      } catch {
        // Firebase remains the source of truth; the API client will send its ID token.
      }

      toast.success("Successfully logged in!");
      login(loggedUser, jwtToken);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message =
        error?.message || "Invalid email or password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const googleUser = await signInWithGoogle();
      login(googleUser, "");
      navigate(redirectTo, { replace: true });
    } catch {
      // AuthContext displays a user-facing Firebase error.
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

        {registeredMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-semibold">
            {registeredMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || authActionLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 rounded-2xl shadow-sm transition-all font-semibold text-sm"
          >
            {loading || authActionLoading ? (
              <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FcGoogle className="w-5 h-5" />
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span className="border-b border-slate-200 dark:border-slate-700 w-full mr-3" />
            <span>OR</span>
            <span className="border-b border-slate-200 dark:border-slate-700 w-full ml-3" />
          </div>

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
