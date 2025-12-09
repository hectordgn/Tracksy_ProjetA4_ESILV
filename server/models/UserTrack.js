const mongoose = require("mongoose");

const UserTrackSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  track:  { type: mongoose.Schema.Types.ObjectId, ref: "Track", required: true },
  liked:  { type: Boolean, default: true }, 
});

// un user ne peut avoir qu'une entrée par track
UserTrackSchema.index({ user: 1, track: 1 }, { unique: true });

module.exports = mongoose.model("UserTrack", UserTrackSchema);
