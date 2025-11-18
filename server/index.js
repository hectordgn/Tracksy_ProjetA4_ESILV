// Fichier: server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserModel = require('./User'); // On appelle le fichier créé juste avant
const bcrypt = require('bcrypt'); // <--- NOUVEAU

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
        
        // 1. On hache le mot de passe (10 est le "salt rounds", la complexité)
        const hashedPassword = await bcrypt.hash(password, 10); 

        // 2. On sauvegarde le USERNAME et le MOT DE PASSE HACHÉ
        const user = await UserModel.create({ 
            username, 
            password: hashedPassword 
        });

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Erreur (Pseudo déjà pris ?)" });
    }
});

// Route Connexion
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    // 1. On cherche l'utilisateur par son nom
    const user = await UserModel.findOne({ username });

    if (!user) {
        return res.json({ success: false, message: "Utilisateur introuvable" });
    }

    // 2. On compare le mot de passe envoyé (clair) avec celui en BDD (haché)
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        res.json({ success: true, message: "Succès", user: { name: user.username } });
    } else {
        res.json({ success: false, message: "Mot de passe incorrect" });
    }
});

app.listen(5000, () => {
    console.log("🚀 Serveur lancé sur le port 5000");
});