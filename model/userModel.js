const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    profilePicture: { type: String }, // Cloudinary Image URL
    bio: { type: String },
    profession: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
