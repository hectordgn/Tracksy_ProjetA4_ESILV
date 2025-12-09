const mongoose = require("mongoose");

const AlbumSchema = new mongoose.Schema({
  spotifyId: String,
  name: String,
  image: String,
  artistId: String,
  artistName: String, 
});

module.exports = mongoose.model("Album", AlbumSchema);
