require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
require("./db");

const spotifyRoutes = require("./routes/spotify");
const musicRoutes = require("./music");
const authRoutes = require("./routes/auth");
const ratingRoutes = require("./routes/ratings");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../client")));

app.use("/api/spotify", spotifyRoutes);
app.use("/api/music", musicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ratings", ratingRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.listen(3000, () => console.log("Backend running on port 3000"));
