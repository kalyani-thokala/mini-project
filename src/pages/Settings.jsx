import React, { useState } from "react";
import API from "../services/api";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiAward, FiSettings, FiCheckCircle, FiXCircle, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Settings() {
  const { user, updateUserProfile, theme } = useApp();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [togglingLeaderboard, setTogglingLeaderboard] = useState(false);

  // Predefined avatars for quick selecting
  const avatars = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Molly",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Daisy",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Bear"
  ];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (fullName.trim().length < 3) {
      return toast.error("Name must be at least 3 characters long");
    }

    try {
      setUpdatingProfile(true);
      const res = await API.put("/auth/profile", { fullName, avatar });
      updateUserProfile(res.data.user);
      toast.success("Profile details updated!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      return toast.error("New password must be at least 8 characters long");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return toast.error("New password must contain uppercase, lowercase, number, and special character");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }

    try {
      setUpdatingPassword(true);
      await API.put("/auth/change-password", {
        currentPassword,
        newPassword
      });

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to change password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setVerifyingEmail(true);
      const res = await API.post("/auth/verify-email");
      updateUserProfile(res.data.user);
      toast.success("Email verified successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to verify email");
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleToggleLeaderboard = async () => {
    try {
      setTogglingLeaderboard(true);
      const res = await API.post("/leaderboard/toggle");
      updateUserProfile({
        ...user,
        leaderboardOptIn: res.data.leaderboardOptIn
      });
      toast.success(
        res.data.leaderboardOptIn
          ? "You have opted into the leaderboard!"
          : "You have opted out of the leaderboard."
      );
    } catch (error) {
      toast.error("Failed to toggle leaderboard settings");
    } finally {
      setTogglingLeaderboard(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Profile Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
          Manage your personal details, select avatars, configure verification, and browse accomplishments
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium flex flex-col md:flex-row items-center md:space-x-8 space-y-6 md:space-y-0">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary-500 to-secondary-500 text-white flex items-center justify-center font-bold text-4xl shadow-md border-4 border-slate-100 dark:border-slate-800 flex-shrink-0">
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            user?.fullName?.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white flex flex-col md:flex-row md:items-center gap-2">
              <span>{user?.fullName}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold w-fit mx-auto md:mx-0 ${
                user?.emailVerified
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              }`}>
                {user?.emailVerified ? (
                  <>
                    <FiCheckCircle className="mr-1" /> Verified
                  </>
                ) : (
                  <>
                    <FiXCircle className="mr-1" /> Email Unverified
                  </>
                )}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              {user?.email}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100/60 dark:border-slate-800 text-xs font-bold text-slate-500">
            <div>
              <p className="text-slate-400 uppercase text-[9px] tracking-wider">Total Exams</p>
              <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-1">
                {user?.totalExams || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-[9px] tracking-wider">Interviews</p>
              <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-1">
                {user?.totalInterviews || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-[9px] tracking-wider">Code Reviews</p>
              <p className="text-sm font-extrabold text-slate-800 dark:text-white mt-1">
                {user?.totalCodingChallenges || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-[9px] tracking-wider">Avg Score</p>
              <p className="text-sm font-extrabold text-primary-500 mt-1">
                {user?.averageScore || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account verification & settings alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Email Verification Action Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
            <FiMail className="text-primary-500" />
            <span>Email Verification Status</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            {user?.emailVerified
              ? `Your email was verified on ${new Date(user?.emailVerifiedAt).toLocaleDateString()}. You have access to all features.`
              : "Your email address is currently not verified. Please verify your email to secure your account and remove status alerts."}
          </p>
          {!user?.emailVerified && (
            <button
              onClick={handleVerifyEmail}
              disabled={verifyingEmail}
              className="py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all text-xs flex items-center justify-center"
            >
              {verifyingEmail ? "Verifying..." : "Verify Email Now"}
            </button>
          )}
        </div>

        {/* Leaderboard Opt-In Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-4">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
            <FiTrendingUp className="text-primary-500" />
            <span>Leaderboard Preferences</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Toggle your visibility on the PrepMaster AI global user leaderboard. If enabled, other students can see your total practice statistics and average grades.
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleToggleLeaderboard}
              disabled={togglingLeaderboard}
              className={`py-2.5 px-4 rounded-2xl font-bold shadow-md transition-all text-xs flex items-center ${
                user?.leaderboardOptIn
                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              {togglingLeaderboard
                ? "Updating..."
                : user?.leaderboardOptIn
                ? "Opt Out of Leaderboard"
                : "Opt In to Leaderboard"}
            </button>
            <span className="text-[11px] font-bold text-slate-400">
              Current Status: <span className={user?.leaderboardOptIn ? "text-emerald-500" : "text-rose-500"}>{user?.leaderboardOptIn ? "Opted In" : "Opted Out"}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Update Details Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
            <FiUser className="text-primary-500" />
            <span>Update Personal Details</span>
          </h4>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                required
              />
            </div>

            {/* Predefined Avatars list */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Choose Profile Avatar
              </label>
              <div className="flex flex-wrap gap-2.5">
                {avatars.map((avUrl) => {
                  const isSelected = avatar === avUrl;
                  return (
                    <div
                      key={avUrl}
                      onClick={() => setAvatar(avUrl)}
                      className={`w-11 h-11 rounded-xl p-0.5 cursor-pointer border-2 transition-all hover:scale-105 bg-slate-50 dark:bg-slate-800 ${
                        isSelected ? "border-primary-500 scale-105" : "border-transparent"
                      }`}
                    >
                      <img src={avUrl} alt="Avatar Selection" className="w-full h-full object-cover rounded-lg" />
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-2xl font-bold shadow-md transition-all text-xs"
            >
              {updatingProfile ? "Updating Details..." : "Save Details"}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
            <FiLock className="text-primary-500" />
            <span>Update Password</span>
          </h4>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                required
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                required
              />
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-darkBorder rounded-2xl text-sm font-semibold dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white rounded-2xl font-bold shadow-md transition-all text-xs"
            >
              {updatingPassword ? "Updating Password..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium space-y-6">
        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
          <FiAward className="text-primary-500" />
          <span>My Achievements</span>
        </h4>

        {user?.achievements && user.achievements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {user.achievements.map((achievement, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={achievement._id || achievement.name}
                className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
                  <FiAward className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                    {achievement.name}
                  </h5>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-darkBorder/40 rounded-2xl">
            <FiAward className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2 animate-bounce" />
            <p className="text-xs font-bold text-slate-400">No achievements unlocked yet.</p>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Complete exams and coding problems to unlock rewards!</p>
          </div>
        )}
      </div>
    </div>
  );
}
