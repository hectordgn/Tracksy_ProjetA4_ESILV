const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: "Utilisateur introuvable" });

    req.user = user; // dispo dans les routes protégées
    next();
  } catch (e) {
    console.error("Erreur auth:", e.message);
    res.status(401).json({ error: "Token invalide" });
  }
};
