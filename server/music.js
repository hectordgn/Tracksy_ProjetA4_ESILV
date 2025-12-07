const express = require("express");
const Artist = require("./models/Artists");
const Album = require("./models/Albums");
const Track = require("./models/Track");

const router = express.Router();

router.post("/add", async (req, res) => {
  const item = req.body;

  if (item.type === "artist") {
    await Artist.create({
      spotifyId: item.id,
      name: item.name,
      image: item.image
    });
  }

  if (item.type === "album") {
    await Album.create({
      spotifyId: item.id,
      name: item.name,
      image: item.image,
      artistId: item.extra.artists[0].id
    });
  }

  if (item.type === "track") {
    await Track.create({
      spotifyId: item.id,
      name: item.name,
      albumId: item.extra.album.id,
      artistId: item.extra.artists[0].id
    });
  }

  res.json({ status: "ok" });
});

module.exports = router;
