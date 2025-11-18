require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // Pour générer le token aléatoire
const nodemailer = require('nodemailer'); // Pour envoyer le mail
const UserModel = require('./User');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.error(err));

// --- CONFIGURATION DU TRANSPORTEUR MAIL ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- ROUTE INSCRIPTION ---
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 1. Vérifier si l'email existe déjà
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: "Email déjà utilisé" });

        // 2. Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Générer un token unique
        const token = crypto.randomBytes(32).toString('hex');

        // 4. Créer l'utilisateur (Non vérifié par défaut)
        const user = await UserModel.create({ 
            username, 
            email, 
            password: hashedPassword,
            verificationToken: token,
            isVerified: false
        });

        // 5. Envoyer le lien par mail
        // Le lien pointera vers votre Frontend avec le token en paramètre
        const link = `http://localhost:5173/?token=${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Validation de votre compte',
            html: `<p>Bonjour ${username},</p>
                   <p>Merci de cliquer sur ce lien pour valider votre compte :</p>
                   <a href="${link}">Valider mon compte</a>`
        });

        res.json({ success: true, message: "Inscription réussie ! Vérifiez vos emails." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Erreur lors de l'inscription" });
    }
});

// --- ROUTE VERIFICATION EMAIL (Nouvelle) ---
app.post('/api/verify', async (req, res) => {
    const { token } = req.body;
    
    const user = await UserModel.findOne({ verificationToken: token });

    if (!user) {
        return res.json({ success: false, message: "Lien invalide ou expiré" });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // On supprime le token, il ne sert plus
    await user.save();

    res.json({ success: true, message: "Compte vérifié avec succès !" });
});

// --- ROUTE LOGIN ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username });

    if (!user) return res.json({ success: false, message: "Utilisateur introuvable" });

    // VERIFICATION IMPORTANTE
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

app.listen(5000, () => { console.log("🚀 Serveur sur 5000"); });