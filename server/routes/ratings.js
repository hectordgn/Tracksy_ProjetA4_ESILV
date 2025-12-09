const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");      // attention au 's' si besoin
const Rating = require("../models/Rating");
const UserTrack = require("../models/UserTrack");
const UserArtist = require("../models/UserArtist");
const UserAlbum = require("../models/UserAlbum");
const ArtistRating = require("../models/ArtistRating");
const AlbumRating = require("../models/AlbumRating");
// Noter un track
router.post("/rate-track", auth, async (req, res) => {
  const { trackId, rating } = req.body;
  if (!trackId || rating == null) {
    return res.status(400).json({ error: "trackId et rating requis" });
  }

  try {
    const r = await Rating.findOneAndUpdate(
      { user: req.user._id, track: trackId },
      { rating },
      { upsert: true, new: true }
    );
    res.json(r);
  } catch (e) {
    console.error("Erreur rate-track:", e);
    res.status(500).json({ error: "Rate error" });
  }
});

// Retirer un like sur un track
router.delete("/unlike-track/:trackId", auth, async (req, res) => {
  const { trackId } = req.params;
  try {
    await UserTrack.deleteOne({ user: req.user._id, track: trackId });
    res.json({ status: "ok" });
  } catch (e) {
    console.error("Erreur unlike-track:", e);
    res.status(500).json({ error: "Unlike error" });
  }
});

// (optionnel) récupérer les ratings de tracks
router.get("/my-tracks", auth, async (req, res) => {
  try {
    const ratings = await Rating.find({ user: req.user._id }).populate("track");
    res.json(ratings);
  } catch (e) {
    console.error("Erreur my-tracks:", e);
    res.status(500).json({ error: "My tracks error" });
  }
});

// Retirer un like sur un artiste
router.delete("/unlike-artist/:artistId", auth, async (req, res) => {
  try {
    await UserArtist.deleteOne({
      user: req.user._id,
      artist: req.params.artistId,
    });
    res.json({ status: "ok" });
  } catch (e) {
    console.error("Erreur unlike-artist:", e);
    res.status(500).json({ error: "DB error" });
  }
});


router.delete("/unlike-album/:albumId", auth, async (req, res) => {
  try {
    await UserAlbum.deleteOne({
      user: req.user._id,
      album: req.params.albumId,
    });
    res.json({ status: "ok" });
  } catch (e) {
    console.error("Erreur unlike-album:", e);
    res.status(500).json({ error: "DB error" });
  }
});

// noter un artiste
router.post("/rate-artist", auth, async (req, res) => {
  const { artistId, rating } = req.body;
  if (!artistId || rating == null) {
    return res.status(400).json({ error: "artistId et rating requis" });
  }

  try {
    const r = await ArtistRating.findOneAndUpdate(
      { user: req.user._id, artist: artistId },
      { rating },
      { upsert: true, new: true }
    );
    res.json(r);
  } catch (e) {
    console.error("Erreur rate-artist:", e);
    res.status(500).json({ error: "Rate artist error" });
  }
});


// noter un album
router.post("/rate-album", auth, async (req, res) => {
  const { albumId, rating } = req.body;
  if (!albumId || rating == null) {
    return res.status(400).json({ error: "albumId et rating requis" });
  }

  try {
    const r = await AlbumRating.findOneAndUpdate(
      { user: req.user._id, album: albumId },
      { rating },
      { upsert: true, new: true }
    );
    res.json(r);
  } catch (e) {
    console.error("Erreur rate-album:", e);
    res.status(500).json({ error: "Rate album error" });
  }
});


module.exports = router;
