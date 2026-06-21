# Prompt — Fix : Accueil & Bibliothèque avec données RÉELLES depuis l'API

## 🎯 Objectif

Remplacer **toutes les données mockées/codées en dur** dans les pages `Accueil` (`/bibliotheque`)
et `Bibliothèque` (`/bibliotheque/livres` → `UserLibrary`) par de vraies données dynamiques
provenant du backend Laravel.

Voici ce qui est actuellement mocké et doit devenir réel :

---

## 📂 Fichiers à modifier

| Fichier | Problème actuel |
|---|---|
| `frontend/src/pages/LibrarySubPages.jsx` | `Accueil` : livre en cours, recommandations IA, stats — tout est codé en dur |
| `frontend/src/components/UserLibrary.jsx` | Livres tendances et recommandations sont réels (depuis API), mais le reste est mocké |
| `frontend/src/pages/LibraryDashboard.jsx` | `recommendations` array est un mock Unsplash codé en dur passé à `UserLibrary` |

---

## 🔌 API disponible

### Client Axios
- **Fichier** : `frontend/src/api/client.js`
- **Base URL** : `http://localhost:8000/api`
- **Token** : injecté automatiquement depuis `localStorage['pt16_token']` via intercepteur

### Endpoint livres (SEUL endpoint réel disponible actuellement)
```
GET /api/books      → retourne un tableau de livres (References de type 'livre')
```

**Structure d'un livre retourné** :
```json
{
  "id": 1,
  "titre": "Dune",
  "auteur": "Frank Herbert",
  "description": "Dans un futur lointain...",
  "type": "livre",
  "cover_image": "https://books.google.com/thumbnail?...",
  "pdf_path": null,
  "epub_path": null,
  "audio_path": null,
  "video_url": "https://www.youtube.com/watch?v=xxx",
  "is_featured": true,
  "is_archived": false,
  "rating": 4.5,
  "total_pages": 412,
  "utilisateur_id": 1,
  "annee": null,
  "date_creation": null
}
```

### Endpoint utilisateur connecté
```
GET /api/user       → retourne l'utilisateur authentifié
```

**Structure d'un utilisateur** :
```json
{
  "id": 1,
  "nom": "Ahmed Lecteur",
  "email": "ahmed@exemple.com",
  "role": "utilisateur",
  "statut": "actif",
  "date_creation": "2026-06-15T10:00:00"
}
```

### Fonctions API déjà disponibles
```js
// frontend/src/api/libraryClient.js
export const fetchBooks = async () => {
    const { data } = await client.get('/books');
    return data; // tableau de livres
};
```

```js
// frontend/src/context/AuthContext.jsx
const { utilisateur } = useAuth(); // donne accès à l'utilisateur connecté
```

---

## 🛠️ Ce que tu dois faire — Détail par section

---

### 1. Page `Accueil` (`LibrarySubPages.jsx` → export `Accueil`)

#### 1.1 — Changer en composant fonctionnel avec state (actuellement c'est une arrow function statique)

Transformer ceci :
```jsx
export const Accueil = () => (...)
```
En :
```jsx
export const Accueil = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { utilisateur } = useAuth();

  useEffect(() => {
    fetchBooks()
      .then(setBooks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (...);
};
```

Ajouter les imports nécessaires en haut du fichier :
```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchBooks } from '../api/libraryClient';
```

#### 1.2 — Section "Reprendre la lecture" (actuellement : "Sapiens" page 145 codé en dur)

Remplacer par le **premier livre** du tableau `books` (s'il existe) :
- **Titre** → `books[0]?.titre`
- **Couverture** → `books[0]?.cover_image` (si null : placeholder sombre `#1C1812`)
- **Progression** → si le livre a `total_pages`, afficher "Page X / {total_pages}" — sinon laisser 45% par défaut en attendant un vrai historique
- Le bouton "Continuer Mode 3D" garde le lien `/reader`

Si `books` est vide et `loading` est `true` : afficher un skeleton doré (div animé `animate-pulse bg-[#2C261A] rounded...`)
Si `books` est vide et `loading` est `false` : afficher "Aucun livre disponible pour le moment."

#### 1.3 — Stats "Objectif Mensuel" et "Temps de Lecture"

Ces stats n'ont pas d'endpoint backend dédié → les rendre **dynamiques par rapport aux livres** :
- **Objectif Mensuel** → afficher le nombre réel de livres disponibles : `{books.length} Livres disponibles`
- **Temps de Lecture** → calculer estimée sur base de `total_pages` : `~{Math.round(books.reduce((acc, b) => acc + (b.total_pages || 300), 0) / 250)}h de lecture`

#### 1.4 — Section "Recommandé par l'IA" (actuellement : 3 livres Unsplash codés en dur)

Remplacer par les **3 premiers livres avec `is_featured === true`** depuis l'API.
Si moins de 3 featured : compléter avec les premiers livres de la liste.
- **Image couverture** → `bk.cover_image` (si null : fond sombre avec initiales)
- **Titre** → `bk.titre`
- **Auteur** → `bk.auteur`
- Chaque carte cliquable → lien `/reader`

---

### 2. Page `Bibliothèque` → `LibraryDashboard.jsx` + `UserLibrary.jsx`

#### 2.1 — Supprimer les `recommendations` mock dans `LibraryDashboard.jsx`

Actuellement :
```jsx
const recommendations = [
  { id: 1, title: 'Sapiens', author: 'Yuval Noah Harari', cover: 'https://unsplash...' },
  // ... 4 autres livres Unsplash
];
// passé comme prop à :
<UserLibrary recommendations={recommendations} />
```

À faire :
- **Supprimer** le tableau `recommendations` codé en dur
- **Supprimer** la prop `recommendations` sur `<UserLibrary />`
- `UserLibrary` doit gérer ses propres données en fetching directement avec `fetchBooks()`

#### 2.2 — `UserLibrary.jsx` : les livres sont déjà réels depuis l'API

**Bon** : `UserLibrary` appelle déjà `fetchBooks()` dans un `useEffect` et stocke dans `books`.

**Mais à corriger** :

**2.2.a — Filtre "All, Nouveautés, Science-Fiction, Histoire, Audiobooks"** (actuellement inactif)

Appliquer le filtre `activeFilter` sur `books` pour afficher les bons livres :
```jsx
const filteredBooks = books.filter(book => {
  if (activeFilter === 'All') return true;
  if (activeFilter === 'Audiobooks') return book.audio_path !== null;
  if (activeFilter === 'Nouveautés') {
    // Livres des 30 derniers jours si date_creation disponible, sinon les 10 derniers par id
    return true; // fallback : afficher tout
  }
  return true; // Pour Science-Fiction, Histoire : pas de colonne category en BD, afficher tout
});
```
Utiliser `filteredBooks` à la place de `books` dans les sections Tendances et Recommandations.

**2.2.b — Section "Tendances" (actuellement 4 premiers livres de l'API)** ✅ Déjà réel, GARDER tel quel.

**2.2.c — Section "Recommandé Pour Vous" (actuellement livres 4-9 de l'API)** ✅ Déjà réel, GARDER tel quel.

**2.2.d — Progression de lecture dans le panneau droit (actuellement hardcodé à 45%, "Sapiens")**

Remplacer par les infos du **premier livre** :
```jsx
// Remplacer "Sapiens" par books[0]?.titre
// Garder 45% pour la progression (pas d'historique en backend encore)
<p className="...">Livre en cours : <span>{books[0]?.titre || 'Aucun livre'}</span></p>
```

**2.2.e — État de chargement manquant**

Actuellement `UserLibrary` n'affiche rien pendant le chargement. Ajouter :
```jsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchBooks()
    .then(setBooks)
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);
```
Si `loading === true` → afficher 4 cards skeleton (div `animate-pulse bg-[#2C261A] rounded-lg w-48 aspect-[2/3]`) dans la section Tendances.
Si `books.length === 0 && !loading` → afficher un message vide stylé : "Aucun livre dans la bibliothèque. Demandez à l'administrateur d'importer des livres."

**2.2.f — Barre de recherche** (actuellement décorrative, non fonctionnelle)

Connecter la barre de recherche existante au filtre `books` :
```jsx
const [searchQuery, setSearchQuery] = useState('');

const filteredBooks = books.filter(book =>
  book.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
  book.auteur.toLowerCase().includes(searchQuery.toLowerCase())
);
```
Mettre à jour le `<input>` :
```jsx
<input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Recherchez par Titre, Auteur..."
  ...
/>
```

---

### 3. Page `Profil` (`LibrarySubPages.jsx` → export `Profil`)

Actuellement le nom "Ahmed Lecteur" et l'email "ahmed@exemple.com" sont **codés en dur**.

Remplacer par les vraies données de l'utilisateur connecté via `useAuth()` :

```jsx
export const Profil = () => {
  const { utilisateur, updateProfile } = useAuth();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (utilisateur) {
      setNom(utilisateur.nom || '');
      setEmail(utilisateur.email || '');
    }
  }, [utilisateur]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        nom,
        email,
        motDePasse: motDePasse || undefined,
        motDePasseConfirmation: motDePasse || undefined,
      });
      setMessage('Profil mis à jour avec succès !');
      setMotDePasse('');
    } catch {
      setMessage("Erreur lors de la mise à jour.");
    }
  };

  return (...);
};
```

- **Avatar** → `https://ui-avatars.com/api/?name=${encodeURIComponent(utilisateur?.nom || 'User')}&background=1C1812&color=D4AF37&size=256`
- **Nom affiché** → `utilisateur?.nom`
- **Email affiché** → `utilisateur?.email`
- Les inputs `nom` et `email` doivent être **éditables** (retirer `disabled`)
- Ajouter un champ optionnel "Nouveau mot de passe"
- Le bouton "Mettre à jour le profil" appelle `updateProfile()` de `AuthContext`
- Afficher un message de succès/erreur stylé (fond `#D4AF37/10`, bordure `#D4AF37`)

---

## 🎨 Règles de style — À respecter

Le projet utilise un design **"Black & Gold 3D"** :

| Élément | Valeur |
|---|---|
| Fond principal | `#0E0C0A` |
| Fond cartes | `#14120E` / `#1A1713` |
| Bordures | `#2C261A` |
| Or (accent) | `#D4AF37` |
| Texte secondaire | `text-gray-400` |
| Skeleton loading | `animate-pulse bg-[#2C261A] rounded-xl` |
| Message vide | texte `text-gray-500`, centré, avec icône `BookOpen` dorée |

### Skeleton de carte livre (à utiliser pendant le chargement) :
```jsx
{loading && Array.from({ length: 4 }).map((_, i) => (
  <div key={i} className="w-48 shrink-0 animate-pulse">
    <div className="aspect-[2/3] bg-[#2C261A] rounded-lg mb-4"></div>
    <div className="h-4 bg-[#2C261A] rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-[#2C261A] rounded w-1/2"></div>
  </div>
))}
```

---

## ✅ Résumé des changes attendus

| Page | Change | Avant | Après |
|---|---|---|---|
| Accueil | Livre en cours | "Sapiens" hardcodé | `books[0]` depuis API |
| Accueil | Couverture | Image Unsplash URL | `books[0].cover_image` |
| Accueil | Stats | "3/5 livres" hardcodé | `books.length` réel |
| Accueil | Recommandations IA | Dune, 1984, Fahrenheit hardcodés | Livres `is_featured === true` depuis API |
| Bibliothèque | Livres tendances | ✅ Déjà réels | Garder, ajouter skeleton + search |
| Bibliothèque | Livres recommandés | ✅ Déjà réels | Garder |
| Bibliothèque | Filtre (All, etc.) | Inactif | Filtrer `books` selon `activeFilter` |
| Bibliothèque | Barre de recherche | Décorative | Filtre sur `titre` et `auteur` |
| Bibliothèque | Livre en cours (panneau droit) | "Sapiens" hardcodé | `books[0]?.titre` |
| Bibliothèque | Loading state | Rien affiché | Skeleton cards |
| Profil | Nom & Email | "Ahmed Lecteur" hardcodé | `utilisateur.nom` / `utilisateur.email` |
| Profil | Formulaire | Champs disabled, bouton inactif | Formulaire éditable qui appelle `updateProfile()` |

---

## ⚠️ Points importants

1. **`fetchBooks()`** est importée depuis `'../api/libraryClient'` (dans LibrarySubPages : `'../api/libraryClient'`)
2. **`useAuth()`** est importé depuis `'../context/AuthContext'`
3. **La couverture** peut être `null` si le livre n'a pas d'image → toujours prévoir un fallback sombre avec le titre en texte
4. **`annee`** peut être `null` dans les données importées depuis Google Books
5. **Ne pas modifier** `libraryClient.js`, `client.js`, `AuthContext.jsx` — utiliser uniquement les fonctions déjà disponibles
6. **Le backend tourne sur `http://localhost:8000`**, le frontend sur `http://localhost:5173`
7. **Ne pas casser** le design Black & Gold existant — seulement remplacer les données
