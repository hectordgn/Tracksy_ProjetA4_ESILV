const express = require("express");
const Artist = require("./models/Artists");
const Album = require("./models/Albums");
const Track = require("./models/Track");
const UserTrack = require("./models/UserTrack");
const auth = require("./middleware/auth"); 
const Rating = require("./models/Rating");


const router = express.Router();
const { getSpotifyAccessToken } = require("./spotifyAuth");



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
  const firstArtist = item.extra?.artists?.[0];
  const album = item.extra?.album;
  const imageUrl = album?.images?.[0]?.url || "";

  const track = await Track.findOneAndUpdate(
    { spotifyId: item.id },
    {
      spotifyId: item.id,
      name: item.name,
      albumId: album?.id,
      artistId: firstArtist?.id,
      image: imageUrl,
      artistName: firstArtist?.name,
      albumName: album?.name,
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

// music.js
router.get("/my-tracks", auth, async (req, res) => {
  try {
    const userTracks = await UserTrack.find({ user: req.user._id })
      .populate("track");
    if (userTracks.length === 0) return res.json([]);

    const ratings = await Rating.find({ user: req.user._id });
    const ratingsMap = new Map(
      ratings.map((r) => [r.track.toString(), r.rating])
    );

    const accessToken = await getSpotifyAccessToken();

    const results = [];
    for (const ut of userTracks) {
      const t = ut.track;
      if (!t || !t.spotifyId) continue;

      const spotifyRes = await fetch(
        `https://api.spotify.com/v1/tracks/${t.spotifyId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!spotifyRes.ok) {
        console.error("Erreur Spotify pour", t.spotifyId, spotifyRes.status);
        continue;
      }

      const s = await spotifyRes.json();
      const rating = ratingsMap.get(t._id.toString()) || 0;

      results.push({
        trackId: t._id,
        type: "track",
        name: s.name,
        image: s.album?.images?.[0]?.url || "",
        artistName: s.artists?.[0]?.name || "",
        albumName: s.album?.name || "",
        rating,
      });
    }

    res.json(results);
  } catch (e) {
    console.error("Erreur my-tracks détaillée:", e);
    res.status(500).json({ error: "My tracks error" });
  }
});

module.exports = router;
