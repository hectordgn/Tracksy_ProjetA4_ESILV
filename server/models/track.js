const mongoose = require("mongoose");

const TrackSchema = new mongoose.Schema({
  spotifyId: { type: String, unique: true, required: true },
  name: String,
  albumId: String,
  artistId: String,
});

module.exports = mongoose.model("Track", TrackSchema);
