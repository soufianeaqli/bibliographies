#!/usr/bin/env bash
set -euo pipefail

echo "============================================"
echo "   PFE - Gestion Bibliographique"
echo "   Installation automatique"
echo "============================================"
echo ""

# Vérifier PHP
if ! command -v php &>/dev/null; then
    echo "[ERREUR] PHP introuvable. Installez PHP >= 8.2"
    exit 1
fi
echo "[OK] PHP trouvé"

# Vérifier Composer
if ! command -v composer &>/dev/null; then
    echo "[ERREUR] Composer introuvable."
    exit 1
fi
echo "[OK] Composer trouvé"

# Vérifier Node.js
if ! command -v node &>/dev/null; then
    echo "[ERREUR] Node.js introuvable."
    exit 1
fi
echo "[OK] Node.js trouvé"

# Vérifier npm
if ! command -v npm &>/dev/null; then
    echo "[ERREUR] npm introuvable."
    exit 1
fi
echo "[OK] npm trouvé"
echo ""

# --- BACKEND ---
echo "[1/5] Installation des dépendances backend..."
cd backend
composer install --no-interaction --prefer-dist

# Créer .env si absent
if [ ! -f .env ]; then
    cp .env.example .env
    echo "[INFO] .env créé depuis .env.example"
    echo "[ATTENTION] Modifiez les identifiants de base de données dans backend/.env"
else
    echo "[OK] .env existe déjà"
fi

# Générer la clé
echo "[2/5] Génération de la clé d'application..."
php artisan key:generate --force

# Migrations
echo "[3/5] Migration de la base de données..."
php artisan migrate --force

# Seeders
echo "[4/5] Insertion des données de test..."
php artisan db:seed --force

# Lien symbolique storage
php artisan storage:link 2>/dev/null || true

cd ..
echo ""
echo "[OK] Backend prêt"

# --- FRONTEND ---
echo "[5/5] Installation des dépendances frontend..."
cd frontend
npm install
cd ..
echo "[OK] Dépendances frontend installées"
echo ""

echo "============================================"
echo "   Installation terminée avec succès !"
echo "============================================"
echo ""
echo "Pour lancer le projet :"
echo ""
echo "  Terminal 1 - Backend :"
echo "    cd backend && php artisan serve"
echo ""
echo "  Terminal 2 - Frontend :"
echo "    cd frontend && npm run dev"
echo ""
echo "  Puis ouvrir http://localhost:5173"
echo ""
echo "[IMPORTANT] Assurez-vous que MySQL est lancé"
echo "et que les identifiants dans backend/.env"
echo "sont corrects (DB_HOST, DB_PORT, DB_DATABASE,"
echo "DB_USERNAME, DB_PASSWORD)."
echo ""
