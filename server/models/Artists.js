const mongoose = require("mongoose");

const ArtistSchema = new mongoose.Schema({
  spotifyId: String,
  name: String,
  image: String
});

module.exports = mongoose.model("Artist", ArtistSchema);
