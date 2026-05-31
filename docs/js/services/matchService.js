
import { db } from "../firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// récupérer les matchups ronde 1

export async function getRound1Matchups() {

  const ref = doc(db, "matchups", "round1");
  const snap = await getDoc(ref);

  if (!snap.exists()) return [];

  const data = snap.data();

  return [...data.EST, ...data.WEST];
}

