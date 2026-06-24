# PT16 — Gestion des Références Bibliographiques

Application web de gestion de références bibliographiques (PFE).

## Stack

- **Backend** : Laravel 11 (PHP 8.2+) + Sanctum + Socialite
- **Frontend** : React 19 + Vite + Tailwind CSS v4
- **Base de données** : MySQL 8.0+

---

## Prérequis

| Outil       | Version minimale |
|-------------|------------------|
| PHP         | 8.2              |
| Composer    | 2.x              |
| Node.js     | 18               |
| npm         | 9                |
| MySQL       | 8.0              |

---

## Installation rapide

### Option A — Script automatisé (Windows)

```bash
setup.bat
```

### Option B — Script automatisé (Linux/Mac)

```bash
chmod +x setup.sh
./setup.sh
```

### Option C — Pas à pas

#### 1. Créer la base de données MySQL

```bash
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS pfe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2. Backend

```bash
cd backend
copy .env.example .env          # Windows
# cp .env.example .env          # Linux/Mac

# Modifier les identifiants MySQL dans .env si nécessaire
#   DB_DATABASE=pfe
#   DB_USERNAME=root
#   DB_PASSWORD=

composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
```

#### 3. Frontend

```bash
cd frontend
npm install
```

---

## Lancer le projet

Deux terminaux séparés :

```bash
# Terminal 1 — Backend (http://localhost:8000)
cd backend
php artisan serve

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Ouvrir **http://localhost:5173** dans le navigateur.

### Identifiant de test

Après `php artisan db:seed`, un admin est créé :
- **Email** : admin@example.com
- **Mot de passe** : password

---

## Fonctionnalités

- **F01-F04** : Gestion de compte (inscription, connexion, déconnexion, profil)
- **F05** : Catalogue de références (livres, articles, thèses…)
- **F07** : Réservation de documents
- **F08** : Favoris / bookmarks
- **F10** : Chatbot assistant bibliographique
- **F12** : Notifications

---

## Variables d'environnement

| Variable               | Description                              | Défaut              |
|------------------------|------------------------------------------|---------------------|
| `DB_DATABASE`          | Nom de la BDD                           | `pfe`               |
| `DB_USERNAME`          | Utilisateur MySQL                       | `root`              |
| `DB_PASSWORD`          | Mot de passe MySQL                      | *(vide)*            |
| `GOOGLE_BOOKS_API_KEY` | Clé API Google Books (optionnelle)       | *(vide)*            |
| `GOOGLE_CLIENT_ID`     | Client ID Google OAuth (optionnel)       | *(vide)*            |
| `GOOGLE_CLIENT_SECRET` | Secret Google OAuth (optionnel)          | *(vide)*            |
| `FRONTEND_URL`         | URL du frontend CORS                    | `http://localhost:5173` |

---

## Dépannage

| Problème                           | Solution                                               |
|------------------------------------|--------------------------------------------------------|
| `SQLSTATE[HY000] [1049]`           | La BDD `pfe` n'existe pas : `CREATE DATABASE pfe;`    |
| `SQLSTATE[HY000] [1045]`           | Mauvais user/password dans `.env`                      |
| `Class "..." not found`            | `composer dump-autoload`                               |
| `Vite manifest not found`          | Lancer `npm run build` dans `frontend/`                |
| `The only supported ciphers are...`| `php artisan key:generate`                             |
| CORS / réseau                      | Vérifier `FRONTEND_URL` dans `.env`                    |

---

## Structure du projet

```
pfe/
├── backend/          # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Http/Requests/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   └── api.php
│   └── .env.example
├── frontend/         # SPA React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── setup.bat         # Installation Windows
├── setup.sh          # Installation Linux/Mac
└── README.md
```

---

## Documentation

- `parti1.md` — Cahier des charges
- `partie2.md` — Spécifications fonctionnelles
- `Partie_3_Conception.md` — Conception
