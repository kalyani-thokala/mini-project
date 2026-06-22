import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { motion } from "framer-motion";
import { registerUser } from "../services/authService";

const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Network request timed out. Please try again.")), ms)
    )
  ]);
};

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (fullName.trim().length < 3) {
      return toast.error("Name must be at least 3 characters long");
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return toast.error("Please enter a valid email address");
    }

    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters long");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      return toast.error("Password must contain uppercase, lowercase, number, and a special character");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const userCredential = await withTimeout(
        createUserWithEmailAndPassword(auth, email, password),
        8000
      );
      const firebaseUser = userCredential.user;

      // Save user profile to Firestore asynchronously in background (non-blocking)
      setDoc(doc(db, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        name: fullName,
        fullName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL || "",
        avatar: firebaseUser.photoURL || "",
        createdAt: serverTimestamp()
      }).catch(() => {
        toast.error("Account created, but the Firebase profile sync is pending.");
      });

      // Register user on backend MongoDB with timeout
      try {
        await withTimeout(
          registerUser({ fullName, email, password }),
          8000
        );
      } catch {
        // The backend can create this user after verifying the Firebase ID token.
      }

      await withTimeout(firebaseSignOut(auth), 5000);

      toast.success("Registration Successful! Please login to continue.");
      // Set a short-lived session flag to prevent the app from auto-logging-in
      try {
        sessionStorage.setItem("prepmaster_just_registered", "1");
      } catch {
        // Private browsing can disable sessionStorage; navigation still works.
      }
      // Redirect to login page with a flag so Login can show a persistent message
      navigate("/login?registered=1");
    } catch (error) {
      const message = error?.userMessage || error?.message || "Registration failed. Try again.";
      toast.error(message);
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
            Create Account
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Join PrepMaster AI and start your placement prep
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <FiUser className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-darkBorder/60 hover:border-slate-300 dark:hover:border-slate-700 focus:border-primary-500 focus:outline-none rounded-2xl text-sm font-semibold transition-all dark:text-white"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
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

          {/* Confirm Password */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 active:scale-98 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Register</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-500 hover:underline">
            Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
