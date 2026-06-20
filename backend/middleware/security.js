// Custom secure middlewares equivalent to Helmet, express-mongo-sanitize, rate-limit, and xss
const ipRequests = new Map();

export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
};

export const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const limit = 150; // max 150 requests per minute
  const windowTime = 60000; // 1 minute

  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, []);
  }

  const timestamps = ipRequests.get(ip).filter(t => now - t < windowTime);
  timestamps.push(now);
  ipRequests.set(ip, timestamps);

  if (timestamps.length > limit) {
    return res.status(429).json({ message: "Too many requests from this IP. Please try again later." });
  }
  next();
};

export const sanitizeInput = (req, res, next) => {
  // 1. Mongo NoSQL injection strip
  const cleanMongo = (obj) => {
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        } else {
          cleanMongo(obj[key]);
        }
      }
    }
  };

  // 2. Simple XSS tag strip
  const cleanXSS = (val) => {
    if (typeof val === "string") {
      return val.replace(/<script[^>]*>([\S\s]*?)<\/script>/gi, "").replace(/<\/?[^>]+(>|$)/g, "");
    }
    if (val && typeof val === "object") {
      for (const key in val) {
        val[key] = cleanXSS(val[key]);
      }
    }
    return val;
  };

  cleanMongo(req.body);
  cleanMongo(req.query);
  cleanMongo(req.params);

  req.body = cleanXSS(req.body);
  req.query = cleanXSS(req.query);
  req.params = cleanXSS(req.params);

  next();
};
