// Fichier: server/index.js

// Imports nécessaires
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail'); // Librairie SendGrid
const UserModel = require('./User'); // Votre modèle utilisateur

const app = express();

// --- Middlewares Express CRUCIAUX ---
app.use(cors());
app.use(express.json()); // Permet de lire req.body pour les données JSON


// --- CONFIGURATION DE LA BDD ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// --- CONFIGURATION DE SENDGRID ---
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// --- ROUTE INSCRIPTION (/api/register) ---
app.post('/api/register', async (req, res) => {
    // VÉRIFICATION DE SÉCURITÉ
    if (!req.body) return res.status(400).json({ success: false, message: "Requête mal formée (données manquantes)." });
    
    try {
        const { username, email, password } = req.body;
        
        // 1. Vérification de l'existence
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "Email déjà utilisé" });

        // 2. Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Générer le jeton
        const token = crypto.randomBytes(32).toString('hex');

        // 4. Créer l'utilisateur (Non vérifié)
        const user = await UserModel.create({ 
            username, 
            email, 
            password: hashedPassword,
            verificationToken: token,
            isVerified: false
        });

        // 5. Envoyer le lien par mail
        const link = `http://localhost:5173/?token=${token}`; 

        const msg = {
            to: email, 
            // CORRECTION DÉFINITIVE : Format objet avec EMAIL et NAME
            from: { 
                email: process.env.SENDER_EMAIL,
                name: 'Validation Compte' 
            }, 
            subject: 'Validation de votre compte',
            html: `<p>Bonjour ${username},</p>
                   <p>Merci de cliquer sur ce lien pour valider votre compte :</p>
                   <a href="${link}">Valider mon compte</a>`,
        };

        try {
            await sgMail.send(msg);
            console.log("Message envoyé via SendGrid avec succès !");
        } catch (error) {
            console.error("❌ Erreur SendGrid détaillée :", error.response ? error.response.body : error); 
        }

        res.json({ success: true, message: "Inscription réussie ! Veuillez vérifier votre email." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Erreur lors de l'inscription" });
    }
});

// --- ROUTE VERIFICATION EMAIL (/api/verify) ---
app.post('/api/verify', async (req, res) => {
    // VÉRIFICATION DE SÉCURITÉ
    if (!req.body) return res.status(400).json({ success: false, message: "Requête mal formée (Token manquant)." });
    
    const { token } = req.body;
    
    const user = await UserModel.findOne({ verificationToken: token });

    if (!user) {
        return res.json({ success: false, message: "Lien invalide ou expiré" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ success: true, message: "Compte vérifié avec succès !" });
});

// --- ROUTE LOGIN (/api/login) ---
app.post('/api/login', async (req, res) => {
    // VÉRIFICATION DE SÉCURITÉ
    if (!req.body) return res.status(400).json({ success: false, message: "Requête mal formée (Données de connexion manquantes)." });
    
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });

    if (!user) return res.json({ success: false, message: "Utilisateur introuvable" });

    if (!user.isVerified) {
        return res.json({ success: false, message: "Veuillez valider votre email avant de vous connecter." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        res.json({ success: true, message: "Succès", user: { name: user.username } });
    } else {
        res.json({ success: false, message: "Mot de passe incorrect" });
    }
});

// Écoute du serveur
app.listen(5000, () => { console.log("🚀 Serveur lancé sur 5000"); });