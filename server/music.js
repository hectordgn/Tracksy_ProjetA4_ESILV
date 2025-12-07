const express = require("express");
const Artist = require("./models/Artists");
const Album = require("./models/Albums");
const Track = require("./models/Track");
const UserTrack = require("./models/UserTrack");
const auth = require("./middleware/auth"); 
const Rating = require("./models/Rating");


const router = express.Router();

router.post("/add", auth, async (req, res) => {
  const item = req.body;
  const userId = req.user._id;

  try {
    if (item.type === "artist") {
      await Artist.findOneAndUpdate(
        { spotifyId: item.id },
        { spotifyId: item.id, name: item.name, image: item.image },
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
      const track = await Track.findOneAndUpdate(
        { spotifyId: item.id },
        {
          spotifyId: item.id,
          name: item.name,
          albumId: item.extra.album.id,
          artistId: item.extra.artists[0].id,
        },
        { upsert: true, new: true }
      );

      await UserTrack.findOneAndUpdate(
        { user: userId, track: track._id },
        { liked: true },
        { upsert: true, new: true }
      );
    }

    res.json({ status: "ok" });
  } catch (e) {
    console.error("Erreur /api/music/add:", e);
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/my-tracks", auth, async (req, res) => {
  try {
    const userTracks = await UserTrack.find({ user: req.user._id })
      .populate("track");

    const ratings = await Rating.find({ user: req.user._id });
    const ratingsMap = new Map(
      ratings.map((r) => [r.track.toString(), r.rating])
    );

    const payload = userTracks.map((ut) => ({
      trackId: ut.track?._id,
      name: ut.track?.name,
      rating: ratingsMap.get(ut.track?._id?.toString() || "") || 0,
    }));

    res.json(payload);
  } catch (e) {
    console.error("Erreur my-tracks détaillée:", e);
    res.status(500).json({ error: "My tracks error" });
  }
});

module.exports = router;
