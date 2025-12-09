const mongoose = require("mongoose");

const albumRatingSchema = new mongoose.Schema(
  {
    user:  { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
    album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", required: true },
    rating:{ type: Number, min: 0, max: 5, required: true },
  },
  { timestamps: true }
);

albumRatingSchema.index({ user: 1, album: 1 }, { unique: true });

module.exports = mongoose.model("AlbumRating", albumRatingSchema);
