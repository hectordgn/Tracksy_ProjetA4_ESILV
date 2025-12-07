# Dossier serveur
SERVER_DIR=server

# Commandes
NPM="C:/Program Files/nodejs/npm.cmd"
NODE="C:/Program Files/nodejs/node.exe"

# ---------- INSTALL ----------
install:
	@echo "📦 Installation des dépendances..."
	cd $(SERVER_DIR) && $(NPM) install
	@echo "✔️ Installation terminée !"

# ---------- RUN ----------
run:
	@echo "🚀 Lancement du serveur..."
	cd $(SERVER_DIR) && $(NODE) server.js

# ---------- DEV (auto-reload) ----------
dev:
	@echo "🚀 Lancement en mode développement (nodemon)"
	cd $(SERVER_DIR) && npx nodemon server.js

# ---------- CLEAN ----------
clean:
	@echo "🧹 Rien à nettoyer pour l'instant."

# ---------- HELP ----------
help:
	@echo ""
	@echo "Commandes disponibles :"
	@echo "  make install    - Installe les dépendances"
	@echo "  make run        - Lance le serveur"
	@echo "  make dev        - Lance le serveur avec nodemon"
	@echo "  make clean      - Nettoie (placeholder)"
	@echo "  make help       - Affiche cette aide"
	@echo ""
