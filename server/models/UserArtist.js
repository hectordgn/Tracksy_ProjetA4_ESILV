const mongoose = require("mongoose");

const UserArtistSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "Artist", required: true },
  liked:  { type: Boolean, default: true },
});

UserArtistSchema.index({ user: 1, artist: 1 }, { unique: true });

module.exports = mongoose.model("UserArtist", UserArtistSchema);
