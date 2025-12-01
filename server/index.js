// File: server/index.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const UserModel = require('./User');

const app = express();

app.use(cors());
app.use(express.json());

// --- DATABASE CONFIG ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// --- REGISTER ROUTE (/api/register) ---
app.post('/api/register', async (req, res) => {
    if (!req.body) return res.status(400).json({ success: false, message: "Données manquantes." });
    
    try {
        const { username, password } = req.body;
        
        // 1. Check if user exists (username only)
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) return res.status(400).json({ success: false, message: "Ce pseudo est déjà pris." });

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create user
        await UserModel.create({ 
            username, 
            password: hashedPassword
        });

        res.json({ success: true, message: "Inscription réussie ! Vous pouvez vous connecter." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Erreur lors de l'inscription" });
    }
});

// --- LOGIN ROUTE (/api/login) ---
app.post('/api/login', async (req, res) => {
    if (!req.body) return res.status(400).json({ success: false, message: "Données manquantes." });
    
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });

    if (!user) return res.json({ success: false, message: "Utilisateur introuvable" });

    // Removed verification check (if !user.isVerified ...)

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        res.json({ success: true, message: "Succès", user: { name: user.username } });
    } else {
        res.json({ success: false, message: "Mot de passe incorrect" });
    }
});

app.listen(5000, () => { console.log("🚀 Serveur lancé sur 5000"); });