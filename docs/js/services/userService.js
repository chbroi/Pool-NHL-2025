import { db } from "../firebase.js";
import { collection, query, where, doc,getDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function checkEligibility(userId, submission) {

  if (submission === 1) return true;

  const previousRound = submission - 1;

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", userId),
    where("round", "==", previousRound)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}



export async function loadAppConfig() {

  const configRef = doc(db, "config", "ui");
  const configSnap = await getDoc(configRef);

  const resultsRef = doc(db, "results", "Current");
  const resultsSnap = await getDoc(resultsRef);

  return {
    config: configSnap.exists() ? configSnap.data() : null,
    results: resultsSnap.exists() ? resultsSnap.data() : {}
  };
}

