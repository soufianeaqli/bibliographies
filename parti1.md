# PT16 -- Gestion des Références Bibliographiques

# Partie 1 --- Étude Générale

Projet PT16 -- Gestion des références bibliographiques

## 1. Problématique / Besoin

**Contexte**

Dans le milieu universitaire, étudiants et chercheurs doivent gérer un
nombre croissant de références bibliographiques (articles, livres,
thèses, sites web...) tout au long de leurs travaux académiques. Cette
gestion, souvent faite manuellement, devient rapidement ingérable.

**Problèmes identifiés**

-   **Désorganisation** --- Les références sont éparpillées entre
    fichiers Word, tableurs et notes papier, sans aucune centralisation
    ni structure.

-   **Erreurs de formatage** --- Appliquer manuellement les normes de
    citation (APA, IEEE, Chicago...) génère des incohérences, des
    doublons et des erreurs typographiques difficiles à corriger sur de
    grandes bibliographies.

-   **Risque de plagiat** --- Une mauvaise gestion des citations expose
    l\'étudiant à des accusations de plagiat involontaire, avec des
    conséquences académiques graves.

-   **Absence de collaboration** --- Aucun outil simple ne permet de
    partager une bibliothèque de références entre membres d\'un même
    projet ou groupe de recherche.

**Besoin**

Il est nécessaire de disposer d\'une **application web centralisée**
permettant de stocker, organiser, rechercher et exporter des références
bibliographiques de manière structurée, fiable et conforme aux normes
académiques en vigueur.

## 2. Définition du projet

**Présentation**

PT16 -- Gestion des références bibliographiques est une application web
permettant aux étudiants et chercheurs de centraliser, organiser et
exporter leurs références bibliographiques depuis une interface unique
et intuitive.

**Objectifs**

-   Offrir un espace personnel de stockage structuré pour toutes les
    références (articles, livres, thèses, sites web, rapports, actes de
    conférence)

-   Permettre la recherche et le filtrage rapide par auteur, titre,
    année, type ou mot-clé

-   Générer automatiquement des citations aux formats académiques
    standards (APA, IEEE, BibTeX)

-   Faciliter la collaboration via le partage de collections entre
    utilisateurs

-   Administrer la plateforme (gestion des comptes, statistiques
    d\'utilisation)

**Acteurs cibles**

-   **Utilisateur (Étudiant / Chercheur)** : gère ses propres références

-   **Administrateur** : supervise la plateforme et les comptes
    utilisateurs

## 3. Cahier des charges

**Acteurs du système**

  -----------------------------------------------------------------------
  **Acteur**        **Rôle**
  ----------------- -----------------------------------------------------
  Utilisateur       Étudiant ou chercheur qui gère sa propre bibliothèque
                    de références

  Administrateur    Supervise la plateforme, gère les comptes et consulte
                    les statistiques
  -----------------------------------------------------------------------

**Fonctionnalités requises**

**Gestion des comptes**

-   Inscription avec email + mot de passe

-   Connexion / Déconnexion

-   Modification du profil (nom, email, mot de passe)

**Gestion des références**

-   Ajouter une référence selon son type : article, livre, thèse, site
    web, rapport, acte de conférence

-   Chaque type possède ses propres champs obligatoires (ex : article →
    auteur, titre, revue, volume, année, DOI)

-   Modifier et supprimer une référence

-   Consulter le détail d\'une référence

**Recherche et filtrage**

-   Recherche par : titre, auteur, année, mot-clé, type de document

-   Filtrage combiné (ex : articles de 2020 avec le tag \"IA\")

**Collections et tags**

-   Créer / supprimer des collections (ex : \"PFE\", \"Mémoire Master\")

-   Affecter des tags libres à chaque référence

-   Associer une référence à une ou plusieurs collections

**Export bibliographique**

-   Exporter une référence ou une collection entière

-   Formats supportés : APA, IEEE, BibTeX

-   Export en format texte copiable ou fichier .bib

**Partage**

-   Partager une collection avec un autre utilisateur (lecture seule)

**Administration**

-   Lister, activer/désactiver, supprimer des comptes utilisateurs

-   Consulter les statistiques : nombre d\'utilisateurs, nombre de
    références, types les plus utilisés

**Contraintes non fonctionnelles**

  -----------------------------------------------------------------------
  **Contrainte**       **Détail**
  -------------------- --------------------------------------------------
  Sécurité             Authentification JWT, mots de passe hashés
                       (bcrypt), accès par rôle

  Performance          Pagination obligatoire dès 20 références, temps de
                       réponse \< 2s

  Disponibilité        Application accessible 24h/24 via navigateur web

  Ergonomie            Interface responsive (desktop + mobile), bilingue
                       FR/AR optionnel

  Intégrité des        Pas de suppression en cascade non confirmée,
  données              sauvegarde régulière
  -----------------------------------------------------------------------

## 4. Faisabilité

**Faisabilité technique**

  -----------------------------------------------------------------------
  **Aspect**                   **Évaluation**
  ---------------------------- ------------------------------------------
  Technologies web disponibles Frameworks front-end et back-end matures
                               et bien documentés

  Base de données              Adaptée au stockage structuré de
  relationnelle                références multi-types

  Export de citations (APA,    Réalisable via des bibliothèques
  IEEE, BibTeX)                open-source existantes

  Authentification JWT         Implémentation standard, bien connue

  Hébergement                  Faisable sur cloud gratuit (Vercel,
                               Railway, Render\...)
  -----------------------------------------------------------------------

**Faisabilité temporelle**

  -----------------------------------------------------------------------
  **Semaine**    **Travaux**
  -------------- --------------------------------------------------------
  Semaine 1      Étude générale + Analyse + Conception

  Semaine 2      Développement Back-end (API, base de données,
                 authentification)

  Semaine 3      Développement Front-end + Tests + Déploiement
  -----------------------------------------------------------------------

**Faisabilité économique**

  -----------------------------------------------------------------------
  **Ressource**                **Coût**
  ---------------------------- ------------------------------------------
  Framework front-end /        Gratuit (open-source)
  back-end                     

  Base de données              Gratuit (PostgreSQL / MySQL)

  Hébergement                  Gratuit (offres cloud gratuites)

  Outils de développement      Gratuit (VS Code, Git, Postman)
  -----------------------------------------------------------------------

**Faisabilité humaine**

  -----------------------------------------------------------------------
  **Compétence requise**          **Disponibilité**
  ------------------------------- ---------------------------------------
  Développement Back-end (REST    Maîtrisée
  API)                            

  Développement Front-end (UI/UX  Maîtrisée
  web)                            

  Modélisation base de données    Maîtrisée

  UML (use cases, séquences,      Maîtrisée
  classes)                        
  -----------------------------------------------------------------------

**Synthèse**

  -----------------------------------------------------------------------
  **Dimension**       **Résultat**
  ------------------- ---------------------------------------------------
  Technique           Faisable

  Temporelle          Faisable

  Économique          Faisable

  Humaine             Faisable
  -----------------------------------------------------------------------

## 5. Diagramme de Business Use Case

![](./image1.png){width="6.268055555555556in"
height="6.553472222222222in"}
