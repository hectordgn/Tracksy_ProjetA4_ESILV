const express = require("express");
const auth = require("../middleware/auth");
const Rating = require("../models/Rating");

const router = express.Router();

router.post("/rate-track", auth, async (req, res) => {
  try {
    const { trackId, rating } = req.body;
    if (!trackId || rating == null) {
      return res.status(400).json({ error: "trackId et rating sont requis" });
    }

    const r = await Rating.findOneAndUpdate(
      { user: req.user._id, track: trackId },
      { rating },
      { new: true, upsert: true }
    );

    res.json(r);
  } catch (e) {
    console.error("Erreur rate-track:", e);
    res.status(500).json({ error: "Rate error" });
  }
});

// NOUVELLE ROUTE
router.get("/my-tracks", auth, async (req, res) => {
  try {
    const ratings = await Rating.find({ user: req.user._id }).populate("track");
    res.json(ratings);
  } catch (e) {
    console.error("Erreur my-tracks:", e);
    res.status(500).json({ error: "My tracks error" });
  }
});


module.exports = router;
