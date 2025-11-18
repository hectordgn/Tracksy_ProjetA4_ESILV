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
// Trouvez ce bloc dans votre fichier server/index.js, autour de la ligne 60
// C'est la route d'inscription
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // ... (Code existant pour vérification et hachage) ...
        const token = crypto.randomBytes(32).toString('hex');
        
        // ... (Création de l'utilisateur) ...

        // 5. Envoyer le lien par mail
        const link = `http://localhost:5173/?token=${token}`;

        // Assurez-vous d'avoir ce 'const info =' pour capturer l'ID du message
        const info = await transporter.sendMail({ 
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Validation de votre compte',
            html: `<p>Bonjour ${username},</p>
                   <p>Merci de cliquer sur ce lien pour valider votre compte :</p>
                   <a href="${link}">Valider mon compte</a>`
        });

        // 🚨 C'EST LA NOUVELLE LIGNE À AJOUTER 🚨
        console.log("Message envoyé, ID de transaction : %s", info.messageId); 

        res.json({ success: true, message: "Inscription réussie ! Vérifiez vos emails." });

    } catch (err) {
        // ... (Votre gestion des erreurs existante) ...
        // Le log 'err' est aussi important ici !
        console.error("Erreur d'envoi de mail :", err); 
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