
# Improvements / Roadmap

## Auth & UX
- Ajouter bouton de déconnexion (Google Auth)
- Gérer expiration session / reconnect
- Meilleur affichage du statut utilisateur

## Page d’accueil
- Ajouter écran de loading (loader / spinner)
- Rediriger vers Home par défaut après refresh
- Gérer cas utilisateur non connecté

## Résultats
- Vérifier cohérence des soumissions 1 à 4
- Ajouter tri par utilisateur
- Highlight automatique du meilleur score
- Ajouter filtre pour afficher seulement un utilisateur

## Logique métier
- Ne plus afficher anciennes rondes dans les soumissions
- Optimiser calcul des scores (réduire duplication)
- Centraliser les règles de scoring

## Organisation du code
- Séparer clairement :
  - main.js → orchestration UI
  - functions.js → logique métier
  - constants.js → données statiques
  - firebase.js → config DB/Auth

- Ajouter dossiers :
  - `/services` → Firebase logic
  - `/ui` → rendering functions
  - `/utils` → helpers génériques

##  UI / Design
- Moderniser le design (cards, spacing, couleurs)
- Ajouter palette cohérente
- Ajouter hover + transitions
- Rendre responsive (mobile)

## Règlements
- Déplacer les règlements dans Firestore
- Charger dynamiquement (éviter HTML statique)

## Messages / Feedback
- Centraliser alert() → message handler
- Ajouter notifications UI (toast)
- Gérer erreurs propres

## Qualité code
- Supprimer code dupliqué
- Factoriser répétitions
- Ajouter commentaires

## Déploiement
- Explorer alternative à GitHub Hosting :
  - Firebase Hosting ✅
  - Netlify ✅
  - Vercel ✅
  - hébergement web simple (HTML/CSS/JS)

## Features futures
- Export CSV / Excel
- Sauvegarde automatique des prédictions
- Comparaison entre joueurs
- Historique des saisons
