# PT16 -- Gestion des Références Bibliographiques

# Partie 2 --- Analyse

1.  *Analyse --- Liste des fonctionnalités détaillées*

**Module 1 --- Authentification**

  ----------------------------------------------------------------------------
  **ID**    **Fonctionnalité**   **Description**
  --------- -------------------- ---------------------------------------------
  **F01**   Inscription          L\'utilisateur crée un compte avec nom, email
                                 et mot de passe

  **F02**   Connexion            Authentification par email/mot de passe,
                                 génération d\'un token JWT

  **F03**   Déconnexion          Invalidation du token et fermeture de session

  **F04**   Modification du      Mise à jour du nom, email ou mot de passe
            profil               
  ----------------------------------------------------------------------------

**Module 2 --- Gestion des références**

  ----------------------------------------------------------------------------
  **ID**    **Fonctionnalité**   **Description**
  --------- -------------------- ---------------------------------------------
  **F05**   Ajouter une          Saisie d\'une référence selon son type avec
            référence            champs spécifiques

  **F06**   Modifier une         Mise à jour des informations d\'une référence
            référence            existante

  **F07**   Supprimer une        Suppression définitive avec confirmation
            référence            obligatoire

  **F08**   Consulter une        Affichage du détail complet d\'une référence
            référence            

  **F09**   Lister les           Affichage paginé de toutes les références de
            références           l\'utilisateur
  ----------------------------------------------------------------------------

***Types de références supportés et leurs champs obligatoires :***

  -------------------------------------------------------------------------
  **Type de      **Champs obligatoires**
  document**     
  -------------- ----------------------------------------------------------
  **Article**    Auteur(s), Titre, Revue, Volume, Numéro, Année, Pages, DOI

  **Livre**      Auteur(s), Titre, Éditeur, Ville, Année, ISBN

  **Thèse**      Auteur, Titre, Université, Type (Master / Doctorat), Année

  **Site web**   Auteur, Titre, URL, Date de consultation

  **Rapport**    Auteur(s), Titre, Organisation, Année

  **Acte de      Auteur(s), Titre, Nom conférence, Lieu, Année, Pages
  conférence**   
  -------------------------------------------------------------------------

**Module 3 --- Recherche et filtrage**

  ----------------------------------------------------------------------------
  **ID**    **Fonctionnalité**   **Description**
  --------- -------------------- ---------------------------------------------
  **F10**   Recherche par        Recherche plein texte sur titre, auteur,
            mot-clé              revue

  **F11**   Filtrage par type    Filtrer les références par type de document

  **F12**   Filtrage par année   Filtrer par année ou intervalle d\'années

  **F13**   Filtrage par tag     Afficher toutes les références associées à un
                                 tag donné

  **F14**   Filtrage combiné     Combiner plusieurs critères de filtrage
                                 simultanément
  ----------------------------------------------------------------------------

**Module 4 --- Collections et tags**

  ----------------------------------------------------------------------------
  **ID**    **Fonctionnalité**   **Description**
  --------- -------------------- ---------------------------------------------
  **F15**   Créer une collection Créer un groupe nommé de références (ex : PFE
                                 2025)

  **F16**   Supprimer une        Suppression de la collection sans supprimer
            collection           les références

  **F17**   Ajouter une          Associer une ou plusieurs références à une
            référence à une      collection
            collection           

  **F18**   Retirer une          Dissocier une référence sans la supprimer
            référence d\'une     
            collection           

  **F19**   Ajouter un tag à une Étiqueter librement une référence (ex : IA,
            référence            réseau)

  **F20**   Supprimer un tag     Retirer un tag d\'une référence
  ----------------------------------------------------------------------------

**Module 5 --- Export bibliographique**

  ----------------------------------------------------------------------------
  **ID**    **Fonctionnalité**   **Description**
  --------- -------------------- ---------------------------------------------
  **F21**   Exporter une         Générer la citation d\'une seule référence
            référence            dans le format choisi

  **F22**   Exporter une         Générer toutes les citations d\'une
            collection           collection en un seul bloc

  **F23**   Format APA           Citation conforme à la norme APA 7e édition

  **F24**   Format IEEE          Citation conforme à la norme IEEE

  **F25**   Format BibTeX        Export en fichier .bib utilisable avec LaTeX
  ----------------------------------------------------------------------------

**Module 6 --- Partage**

  ----------------------------------------------------------------------------
  **ID**    **Fonctionnalité**   **Description**
  --------- -------------------- ---------------------------------------------
  **F26**   Partager une         Partager une collection avec un autre
            collection           utilisateur via son email

  **F27**   Consulter une        Accéder en lecture seule aux références
            collection partagée  d\'une collection reçue

  **F28**   Révoquer un partage  Retirer l\'accès d\'un utilisateur à une
                                 collection partagée
  ----------------------------------------------------------------------------

**Module 7 --- Administration**

  ----------------------------------------------------------------------------
  **ID**    **Fonctionnalité**   **Description**
  --------- -------------------- ---------------------------------------------
  **F29**   Lister les           Afficher tous les comptes avec leurs
            utilisateurs         informations

  **F30**   Activer / Désactiver Bloquer ou réactiver l\'accès d\'un
            un compte            utilisateur à la plateforme

  **F31**   Supprimer un compte  Suppression définitive d\'un compte et de
                                 toutes ses données

  **F32**   Consulter les        Nombre d\'utilisateurs, références totales,
            statistiques         types les plus utilisés, exports effectués
  ----------------------------------------------------------------------------

2.  *Diagrammes de cas d\'utilisation détaillés (par acteur ou par
    module)*

![](./image1.png){width="7.360400262467191in"
height="3.513888888888889in"}

![](./image2.png){width="7.101816491688539in"
height="3.8554910323709537in"}

3.  *Diagrammes de séquence boîte noire (un par use case principal)*

    a.  *UC1 --- S\'authentifier*

        i.  ![](./image3.png){width="5.623707349081365in"
            height="3.8849660979877516in"}

    b.  *UC2 --- Ajouter une reference*

        i.  ![](./image4.png){width="5.433525809273841in"
            height="4.802083333333333in"}

    c.  *UC3 --- Rechercher et filtrer*

        i.  ![](./image5.png){width="5.184970472440945in"
            height="4.489583333333333in"}

    d.  *UC4 --- Exporter les citations*

        i.  ![](./image6.png){width="4.781917104111986in"
            height="4.8027537182852145in"}

    e.  *UC5 --- Gérer les utilisateurs (Admin)*

        i.  ![](./image7.png){width="5.5260115923009625in"
            height="5.708334426946632in"}
