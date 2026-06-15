# PT16 — Gestion des Références Bibliographiques

Application web de gestion de références bibliographiques (PFE).

## Stack

- **Backend** : Laravel 11 (PHP 8.3) + Sanctum, API REST
- **Frontend** : React 19 + Vite + Tailwind CSS v4
- **Base de données** : MySQL 8.0

## Installation

### Base de données

```bash
mysql -u root -p
CREATE DATABASE pt16_biblio;
CREATE USER 'sail'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON pt16_biblio.* TO 'sail'@'localhost';
```

### Backend

```bash
cd backend
composer install
cp .env.example .env   # puis configurer DB_* (voir .env)
php artisan key:generate
php artisan migrate
```

### Frontend

```bash
cd frontend
npm install
```

## Lancer le projet

Dans deux terminaux séparés :

```bash
# Terminal 1 - Backend (http://localhost:8000)
cd backend
php artisan serve

# Terminal 2 - Frontend (http://localhost:5173)
cd frontend
npm run dev
```

Ouvrir http://localhost:5173 dans le navigateur.

## Fonctionnalités implémentées

- **F01** : Inscription
- **F02** : Connexion
- **F03** : Déconnexion
- **F04** : Modification du profil (nom, email, mot de passe)

## Documentation

- `parti1.md` — Cahier des charges
- `partie2.md` — Spécifications fonctionnelles
- `Partie_3_Conception.md` — Conception
