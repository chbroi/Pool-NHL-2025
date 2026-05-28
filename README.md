
# Pool de séries NHL (Web App)

Application web permettant de gérer un pool de séries éliminatoires avec :

- Prédictions par rondes
- Validation dynamique
- Calcul automatique des scores
- Classement (leaderboard)
- Affichage détaillé des résultats

---

## Features principales

✅ Connexion Google (Firebase Auth)  
✅ Soumissions par ronde  
✅ Génération dynamique des matchs  
✅ Calcul de points multi-rondes  
✅ Affichage des résultats avec validation (✅ / ❌)  
✅ Classement complet  
✅ Conn Smythe inclus  

---

## Logique

- Chaque utilisateur soumet une prédiction par ronde
- Les choix futurs dépendent des prédictions précédentes
- Le scoring est basé sur :
  - équipe correcte
  - nombre de matchs correct
  - multiplicateur par ronde

---

## Structure

- /main.js        → logique principale / UI
- /functions.js   → logique métier
- /constants.js   → constantes (teams, scoring, etc.)
- /firebase.js    → configuration Firebase
---


## Technologies

- JavaScript (Vanilla)
- Firebase Auth
- Firestore
- HTML/CSS

---

## Installation

1. Cloner le repo
2. Configurer Firebase (`firebase.js`)
3. Lancer avec un serveur local :

## Déploiement

Options recommandées :
- Firebase Hosting ✅
- Netlify ✅
- Vercel ✅

---

## Améliorations prévues

Voir `IMPROVEMENTS.md`

---

## Auteur

Charles Brosseau
