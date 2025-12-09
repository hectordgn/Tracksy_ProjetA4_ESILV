const mongoose = require("mongoose");

const UserAlbumSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  album: { type: mongoose.Schema.Types.ObjectId, ref: "Album", required: true },
  liked: { type: Boolean, default: true },
});

UserAlbumSchema.index({ user: 1, album: 1 }, { unique: true });

module.exports = mongoose.model("UserAlbum", UserAlbumSchema);
