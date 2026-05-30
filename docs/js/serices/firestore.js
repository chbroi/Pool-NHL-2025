
import { db } from "../firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


/**
 * Obtenir toutes les prédictions
 */
export async function getAllPredictions() {

  const snapshot = await getDocs(collection(db, "predictions"));

  return snapshot.docs.map(doc => doc.data());
}


/**
 * Vérifier si utilisateur a déjà soumis pour un round
 */
export async function hasSubmitted(userId, round) {

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", userId),
    where("round", "==", round)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}


/**
 * Soumettre une prédiction
 */
export async function submitPrediction(data) {

  return await addDoc(collection(db, "predictions"), data);
}
