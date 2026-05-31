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

  // config UI
  const configRef = doc(db, "config", "ui");
  const configSnap = await getDoc(configRef);

  if (configSnap.exists()) {
    const config = configSnap.data();
    

    appState.submission = config.currentSubmission;

    const helper = document.getElementById("helperMessage");

    if (config.submissionOpen) {
      helper.innerHTML = config.helperMessage;
    } else {
      helper.innerHTML = "⏳ Les soumissions sont fermées pour cette ronde.";
    }
  }

  // résultats
  const resultsRef = doc(db, "results", "Current");
  const resultsSnap = await getDoc(resultsRef);

  if (resultsSnap.exists()) {
    appState.results = resultsSnap.data();
  }
}
