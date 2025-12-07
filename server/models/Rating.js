const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    track: { type: mongoose.Schema.Types.ObjectId, ref: "Track", required: true },
    rating: { type: Number, min: 0, max: 5, required: true },
  },
  { timestamps: true }
);

ratingSchema.index({ user: 1, track: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
