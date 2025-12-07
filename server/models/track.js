const mongoose = require("mongoose");

const TrackSchema = new mongoose.Schema({
  spotifyId: String,
  name: String,
  albumId: String,
  artistId: String,
});

module.exports = mongoose.model("Track", TrackSchema);
