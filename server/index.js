// Fichier: server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserModel = require('./User'); // On appelle le fichier créé juste avant

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connecté à MongoDB Atlas !"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// Route Inscription
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await UserModel.create({ username, password });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Erreur (Pseudo déjà pris ?)" });
    }
});

// Route Connexion
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });

    if (user && user.password === password) {
        res.json({ success: true, message: "Succès", user: { name: user.username } });
    } else {
        res.json({ success: false, message: "Identifiants incorrects" });
    }
});

app.listen(5000, () => {
    console.log("🚀 Serveur lancé sur le port 5000");
});