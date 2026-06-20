import mongoose from "mongoose";

const aiCacheSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 * 7 // Expiration TTL: 7 Days
  }
});

export default mongoose.model("AICache", aiCacheSchema, "aicaches");
