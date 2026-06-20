import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendResetEmail } from "../services/emailService.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "prepmaster_secret_key_123", {
    expiresIn: "30d"
  });
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validations
    if (!fullName || fullName.length < 3) {
      return res.status(400).json({ message: "Name must be at least 3 characters long" });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Registration Successful",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        totalExams: user.totalExams,
        totalInterviews: user.totalInterviews,
        totalCodingChallenges: user.totalCodingChallenges,
        averageScore: user.averageScore,
        emailVerified: user.emailVerified,
        leaderboardOptIn: user.leaderboardOptIn,
        learningStreak: user.learningStreak,
        practiceHours: user.practiceHours,
        achievements: user.achievements
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Update login streak and active date
    const today = new Date().toDateString();
    if (user.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (user.lastActiveDate === yesterday) {
        user.learningStreak += 1;
      } else {
        user.learningStreak = 1;
      }
      user.lastActiveDate = today;
      await user.save();
    }

    res.json({
      message: "Login Successful",
      token: generateToken(user._id),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        totalExams: user.totalExams,
        totalInterviews: user.totalInterviews,
        totalCodingChallenges: user.totalCodingChallenges,
        averageScore: user.averageScore,
        emailVerified: user.emailVerified,
        leaderboardOptIn: user.leaderboardOptIn,
        learningStreak: user.learningStreak,
        practiceHours: user.practiceHours,
        achievements: user.achievements
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(444).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { fullName, avatar } = req.body;
    if (fullName) {
      if (fullName.length < 3) {
        return res.status(400).json({ message: "Name must be at least 3 characters long" });
      }
      user.fullName = fullName;
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        totalExams: user.totalExams,
        totalInterviews: user.totalInterviews,
        totalCodingChallenges: user.totalCodingChallenges,
        averageScore: user.averageScore,
        emailVerified: user.emailVerified,
        leaderboardOptIn: user.leaderboardOptIn,
        learningStreak: user.learningStreak,
        practiceHours: user.practiceHours,
        achievements: user.achievements
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message: "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password Request
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Email address not found." });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Call nodemailer email service
    await sendResetEmail(email, token);

    res.json({
      success: true,
      message: "Password reset link sent.",
      token
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password Execution
export const resetPassword = async (req, res) => {
  try {
    const { token, password, newPassword } = req.body;
    const targetPassword = password || newPassword;

    if (!token) {
      return res.status(400).json({ success: false, message: "Invalid reset token." });
    }

    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid reset token." });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Reset link has expired." });
    }

    if (!targetPassword || targetPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(targetPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      });
    }

    user.password = await bcrypt.hash(targetPassword, 10);
    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: "Password reset successful." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Optional Email Verification
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    res.json({
      message: "Email verified successfully.",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        emailVerified: user.emailVerified,
        emailVerifiedAt: user.emailVerifiedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};