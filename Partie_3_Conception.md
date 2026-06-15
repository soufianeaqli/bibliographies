## **Partie 3 — Conception** 

Projet PT16 – Gestion des références bibliographiques 

## **1. Diagramme de classe générale** 

Le diagramme de classe générale représente l'ensemble des entités du système, leurs attributs, méthodes et relations. 

## **1.1 Liste des classes** 

|**Classe**|**Type**|**Attributs**|**Méthodes**|
|---|---|---|---|
|**Utilisateur**|Entité|id, nom, email,<br>motDePasse, role, statut,<br>dateCreation|seConnecter(),<br>seDeconnecter(),<br>modifierProfil()|
|**Reference**|Abstraite|id, titre, auteur, annee, type,<br>dateCreation|valider(),<br>afficherDetail(),<br>genererCitation()|
|**Article**|Hérite Reference|revue, volume, numero,<br>pages, doi|—|
|**Livre**|Hérite Reference|editeur, ville, isbn|—|
|**These**|Hérite Reference|universite, typeThese|—|
|**SiteWeb**|Hérite Reference|url, dateConsultation|—|
|**Rapport**|Hérite Reference|organisation|—|
|**Collection**|Entité|id, nom, dateCreation|ajouterReference(),<br>retirerReference()|
|**Tag**|Entité|id, nom|—|
|**Partage**|Association|id, datePartage, permission|—|
|**Export**|Entité|id, format, contenu,<br>dateExport|generer(), telecharger(),<br>copier()|
|**Session**|Entité|id, token, dateCreation,<br>dateExpiration|estValide(), invalider()|



## **1.2 Relations entre les classes** 

|**Relation**|**Cardinalité**|**Description**|
|---|---|---|
|**Utilisateur —**<br>**Reference**|1 → 0..*|Un utilisateur possède zéro ou plusieurs références|
|**Utilisateur —**<br>**Collection**|1 → 0..*|Un utilisateur crée zéro ou plusieurs collections|
|**Utilisateur — Session**|1 → 0..*|Un utilisateur ouvre zéro ou plusieurs sessions|



|**Relation**|**Cardinalité**|**Description**|
|---|---|---|
|**Utilisateur — Export**|1 → 0..*|Un utilisateur génère zéro ou plusieurs exports|
|**Utilisateur — Partage**|1 → 0..*|Un utilisateur envoie zéro ou plusieurs partages|
|**Collection —**<br>**Reference**|0..* → 0..*|Relation N:N via table CollectionReference|
|**Reference — Tag**|0..* → 0..*|Relation N:N via table ReferenceTag|
|**Partage — Collection**|0..* → 1|Un partage concerne une seule collection|
|**Partage — Utilisateur**|0..* → 1|Un partage a un seul destinataire|
|**Reference — Article**<br>**◁**|Héritage|Article hérite de Reference|
|**Reference — Livre**<br>**◁**|Héritage|Livre hérite de Reference|
|**Reference — These**<br>**◁**|Héritage|Thèse hérite de Reference|
|**Reference —**<br>**◁**<br>**SiteWeb**|Héritage|SiteWeb hérite de Reference|
|**Reference —**<br>**◁**<br>**Rapport**|Héritage|Rapport hérite de Reference|



## **1.3 Diagramme de classe** 

## **2. Schéma relationnel de la base de données** 

Le schéma relationnel traduit le diagramme de classe en tables de base de données relationnelle. L'héritage est implémenté par table par sous-classe (Table Per Subclass). 

|**Table**|**Colonnes**|**Clés**|
|---|---|---|
|**utilisateur**|id, nom, email, mot_de_passe, role, statut,<br>date_creation|PK: id / UNIQUE: email|
|**reference**|id, titre, auteur, annee, type, date_creation,<br>utilisateur_id|PK: id / FK: utilisateur_id|
|**article**|id, revue, volume, numero, pages, doi|PK+FK: id → reference|
|**livre**|id, editeur, ville, isbn|PK+FK: id → reference|
|**these**|id, universite, type_these|PK+FK: id → reference|
|**site_web**|id, url, date_consultation|PK+FK: id → reference|
|**rapport**|id, organisation|PK+FK: id → reference|
|**collection**|id, nom, date_creation, utilisateur_id|PK: id / FK: utilisateur_id|
|**tag**|id, nom|PK: id / UNIQUE: nom|
|**collection_referenc**<br>**e**|collection_id, reference_id|PK: (collection_id,<br>reference_id)|
|**reference_tag**|reference_id, tag_id|PK: (reference_id, tag_id)|
|**partage**|id, date_partage, permission, collection_id,<br>expediteur_id, destinataire_id|PK: id / FK: collection_id,<br>expediteur_id,<br>destinataire_id|
|**export**|id, format, contenu, date_export,<br>utilisateur_id, reference_id, collection_id|PK: id / FK: utilisateur_id,<br>reference_id, collection_id|
|**session**|id, token, date_creation, date_expiration,<br>utilisateur_id|PK: id / FK: utilisateur_id|



## **2.1 Règles de gestion appliquées** 

- Chaque référence appartient à un seul utilisateur (FK utilisateur_id) 

- L'héritage Reference → Article/Livre/These/SiteWeb/Rapport est implémenté par jointure (même id) 

- Les relations N:N (Collection-Reference, Reference-Tag) passent par des tables d'association 

- La suppression d'un utilisateur entraîne la suppression de toutes ses données (CASCADE) 

- La suppression d'une collection ne supprime pas les références (dissociation uniquement) 

## **3. Diagramme de déploiement** 

Le diagramme de déploiement montre l'architecture physique du système et la répartition des composants sur les différents noeuds. 

## **3.4 Diagramme** 

**==> picture [479 x 44] intentionally omitted <==**

**----- Start of picture text -----**<br>
«device» «device» «device»<br>Poste Client Serveur Application Serveur Base de Données<br>r- HTTPS f- r- c 5 TePAP S<br>Navigateur Web port tg Frontend (SSR) API REST Pisani [ow | por baz SGBD Relationnel<br>**----- End of picture text -----**<br>


