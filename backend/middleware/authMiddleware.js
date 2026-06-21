import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";

const getBearerToken = (req) => {
  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) return "";
  return authorization.split(" ")[1];
};

const findOrCreateFirebaseUser = async (decodedToken) => {
  const email = decodedToken.email?.toLowerCase();
  if (!email) return null;

  let user = await User.findOne({ email }).select("-password");
  if (user) return user;

  const generatedPassword = await bcrypt.hash(crypto.randomUUID(), 12);
  user = await User.create({
    fullName: decodedToken.name || email.split("@")[0] || "PrepMaster User",
    email,
    password: generatedPassword,
    avatar: decodedToken.picture || "",
    emailVerified: Boolean(decodedToken.email_verified),
    emailVerifiedAt: decodedToken.email_verified ? new Date() : undefined
  });

  return User.findById(user._id).select("-password");
};

const protectWithBackendJwt = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "prepmaster_secret_key_123");
  return User.findById(decoded.id).select("-password");
};

const protectWithFirebaseToken = async (token) => {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) {
    throw new Error("FIREBASE_WEB_API_KEY is not configured");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token })
    }
  );

  if (!response.ok) {
    throw new Error("Firebase token verification failed");
  }

  const { users = [] } = await response.json();
  const firebaseUser = users[0];
  if (!firebaseUser?.localId) {
    throw new Error("Firebase user was not found");
  }

  return findOrCreateFirebaseUser({
    uid: firebaseUser.localId,
    email: firebaseUser.email,
    name: firebaseUser.displayName,
    picture: firebaseUser.photoUrl,
    email_verified: firebaseUser.emailVerified
  });
};

export const protect = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    req.user = await protectWithBackendJwt(token);
  } catch {
    try {
      req.user = await protectWithFirebaseToken(token);
    } catch {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!req.user) {
    return res.status(401).json({ message: "Not authorized, user not found" });
  }

  return next();
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};
