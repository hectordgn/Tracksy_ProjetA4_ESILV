const express = require("express");
const axios = require("axios");
const router = express.Router();

async function getAccessToken() {
  try {
    console.log("CLIENT_ID =", process.env.CLIENT_ID);
    console.log("CLIENT_SECRET défini ?", !!process.env.CLIENT_SECRET);

    const res = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("Token reçu OK");
    return res.data.access_token;
  } catch (e) {
    console.error(
      "Erreur getAccessToken Spotify :",
      e.response?.status,
      e.response?.data || e.message
    );
    throw e;
  }
}

router.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) {
      return res.status(400).json({ error: "Missing query parameter q" });
    }

    const token = await getAccessToken();

    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        q
      )}&type=artist,album,track&limit=10`,
      { headers: { Authorization: "Bearer " + token } }
    );

    const results = [];

    ["artists", "albums", "tracks"].forEach((type) => {
      if (!response.data[type]) return;
      response.data[type].items.forEach((item) => {
        results.push({
          id: item.id,
          name: item.name,
          type: type.slice(0, -1),
          image: item.images?.[0]?.url || "",
          extra: item,
        });
      });
    });

    res.json(results);
  } catch (e) {
  console.error("Erreur Spotify brute:", e.response?.status, e.response?.data || e.message);
  return res.status(500).json({
    error: "Spotify error",
    status: e.response?.status,
    details: e.response?.data || e.message,
  });
  }
});

module.exports = router;
