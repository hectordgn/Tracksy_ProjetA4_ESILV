const express = require("express");
const Artist = require("./models/Artists");
const Album = require("./models/Albums");
const Track = require("./models/Track");

const router = express.Router();

router.post("/add", async (req, res) => {
  const item = req.body;

  try {
    if (item.type === "artist") {
      await Artist.findOneAndUpdate(
        { spotifyId: item.id },
        {
          spotifyId: item.id,
          name: item.name,
          image: item.image,
        },
        { upsert: true, new: true }
      );
    }

    if (item.type === "album") {
      await Album.findOneAndUpdate(
        { spotifyId: item.id },
        {
          spotifyId: item.id,
          name: item.name,
          image: item.image,
          artistId: item.extra.artists[0].id,
        },
        { upsert: true, new: true }
      );
    }

    if (item.type === "track") {
      await Track.findOneAndUpdate(
        { spotifyId: item.id },
        {
          spotifyId: item.id,
          name: item.name,
          albumId: item.extra.album.id,
          artistId: item.extra.artists[0].id,
        },
        { upsert: true, new: true }
      );
    }

    res.json({ status: "ok" });
  } catch (e) {
    console.error("Erreur /api/music/add:", e);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
