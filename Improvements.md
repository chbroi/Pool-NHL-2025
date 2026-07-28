# Pool NHL - Roadmap

## ✅ Complété

### Architecture
- Migration vers une architecture modulaire ES6
- Séparation des responsabilités :
  - `main.js`
  - `services`
  - `ui`
  - `logic`
  - `utils`
  - `constants`
- Centralisation de l'état dans `appState`

### Authentification
- Connexion Google Firebase
- Déconnexion
- Gestion du statut utilisateur
- Règles Firestore sécurisées
- Sauvegarde de l'acceptation des règlements dans Firestore

### Interface
- Mode sombre / clair
- Navigation dynamique
- Affichage responsive de base
- Mise en évidence de la colonne de l'utilisateur connecté

### Pool
- Soumissions enregistrées dans Firestore
- Génération dynamique des rondes
- Classement automatique
- Calcul automatique des scores
- Affichage dynamique des résultats

### Participation
- Comptage automatique des participants
- Calcul automatique de la cagnotte

---

# 🔥 Priorité Haute

## Soumissions

- Corriger les problèmes actuels de l'onglet **Soumettre**
- Vérifier le cycle complet :
  - Connexion
  - Acceptation des règlements
  - Génération des rondes
  - Validation des choix
  - Soumission Firestore
- Éviter les écrans vides
- Ajouter des messages d'erreur explicites
- Ajouter une validation visuelle avant soumission
- Ajouter un écran de confirmation après soumission
- Empêcher les doubles clics sur **Soumettre**
- Ajouter un indicateur de chargement lors des opérations Firestore
- Ajouter une validation complète avant envoi
- Vérifier que toutes les rondes affichées sont cohérentes avec les choix précédents

## Participation

- Modal professionnel d'acceptation des règlements
- Afficher le modal uniquement lors de la première participation
- Sauvegarder l'acceptation dans Firestore
- Créer la collection `participants`
- Associer chaque document au `uid` Firebase
- Vérifier automatiquement si un utilisateur a accepté les conditions

### Carte de participation sur l'accueil

Afficher :

```text
✅ Participation confirmée

Bienvenue Charles Brosseau.

Votre engagement de participation a déjà été enregistré.
```

ou

```text
⚠️ Participation non confirmée

Pour participer au pool, vous devrez accepter les conditions lors de votre première soumission.
```

### Cagnotte

- Afficher le nombre de participants
- Afficher la cagnotte actuelle
- Afficher automatiquement les montants projetés :

```text
🥇 1re place
🥈 2e place
🥉 3e place
```

---

# 🟡 Priorité Moyenne

## Expérience utilisateur

- Permettre l'accès sans connexion à :
  - Accueil
  - Règlements
  - Système de pointage
  - Résultats
  - Classement

- Conserver uniquement l'onglet **Soumettre** protégé
- Masquer l'onglet **Soumettre** lorsqu'aucun utilisateur n'est connecté
- Ajouter une carte "Comment participer"
- Ajouter de légères animations entre les onglets
- Ajouter un bouton "Retour en haut"
- Ajouter un meilleur feedback visuel pendant les chargements

## Mes prédictions

- Ajouter un onglet **Mes prédictions**
- Afficher l'historique complet des soumissions
- Afficher les résultats ronde par ronde
- Afficher les points obtenus pour chaque choix
- Afficher les choix gagnants/perdants visuellement
- Comparer les choix de l'utilisateur avec les résultats réels

## Résultats

- Corriger définitivement l'affichage des matchups ronde 1
- Corriger les doublons d'affichage des matchs joués
- Corriger les affichages du nombre de matchs
- Ajouter les logos des équipes
- Mettre les équipes gagnantes en évidence
- Ajouter un résumé de la ronde actuelle
- Afficher le pourcentage de participants ayant choisi chaque équipe
- Afficher les statistiques de popularité des choix

---

# 🟢 Priorité Basse

## Administration

Créer un mode administrateur basé sur Firebase.

Collection :

```text
admins
 └── uid
```

Fonctionnalités :

- Modifier les résultats
- Ouvrir/Fermer les soumissions
- Modifier le message d'accueil
- Modifier la ronde active
- Modifier les dates limites
- Modifier les matchups
- Modifier les informations publiques du pool

## Historique

Préparer la gestion multi-saisons.

Exemples :

```text
2025
2026
2027
```

Fonctionnalités :

- Archives des saisons
- Archives des gagnants
- Archives des classements
- Historique des participations
- Navigation entre les saisons

---

# 🚀 Améliorations "Wow"

## Statistiques des participants

Afficher :

```text
🔥 Choix les plus populaires

TOR : 78 %
FLA : 65 %
DAL : 54 %
EDM : 82 %
```

## Choix audacieux

Afficher :

```text
💀 Choix les plus risqués

Jean Tremblay
Choisit OTT contre TOR
```

## Informations dynamiques

Afficher sur l'accueil :

```text
🏒 37 participants

💰 Cagnotte : 185 $

🥇 1re place : 106 $
🥈 2e place : 53 $
🥉 3e place : 26 $
```

## Engagement du public

- Compteur de participants en temps réel
- Activité récente
- Derniers participants inscrits
- Progression des rondes
- Statistiques globales du pool

---

# 🎯 Prochaines étapes recommandées

1. Finaliser la gestion de l'acceptation des règlements via Firestore
2. Corriger complètement l'onglet **Soumettre**
3. Rendre les pages publiques accessibles sans connexion
4. Ajouter la carte de statut de participation sur l'accueil
5. Créer l'onglet **Mes prédictions**
6. Corriger l'affichage des résultats de ronde 1
7. Ajouter le calcul automatique de la cagnotte et des gains
8. Développer éventuellement un panneau d'administration
