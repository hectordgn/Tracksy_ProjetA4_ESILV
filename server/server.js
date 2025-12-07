require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const spotifyRoutes = require("./routes/spotify");
const musicRoutes = require("./music");
require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dossier client (index.html, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, "../client")));

// Routes API
app.use("/api/spotify", spotifyRoutes);
app.use("/api/music", musicRoutes);

// Route pour la page d'accueil (index.html dans client/)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.listen(3000, () => console.log("Backend running on port 3000"));
