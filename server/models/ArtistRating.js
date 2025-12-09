const mongoose = require("mongoose");

const artistRatingSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
    rating: { type: Number, min: 0, max: 5, required: true },
  },
  { timestamps: true }
);

artistRatingSchema.index({ user: 1, artist: 1 }, { unique: true });

module.exports = mongoose.model("ArtistRating", artistRatingSchema);
