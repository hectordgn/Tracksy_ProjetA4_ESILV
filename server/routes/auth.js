const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const auth = require("../middleware/auth");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email et password sont requis" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      id: user._id,
      email: user.email,
      pseudo: user.pseudo,
      token, // ← IMPORTANT
    });
  } catch (e) {
    console.error("Erreur login:", e);
    res.status(500).json({ error: "Login error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { email, password, pseudo } = req.body;

    if (!email || !password || !pseudo) {
      return res.status(400).json({ error: "email, password et pseudo sont requis" });
    }

    // Vérifier si l'email existe déjà
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email déjà utilisé" });
    }

    // Hash du mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ email, passwordHash, pseudo });

    res.status(201).json({
      id: user._id,
      email: user.email,
      pseudo: user.pseudo,
    });
  } catch (e) {
    console.error("Erreur signup:", e);
    res.status(500).json({ error: "Signup error" });
  }
});

router.get("/me", auth, async (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    pseudo: req.user.pseudo,
  });
});

module.exports = router;
