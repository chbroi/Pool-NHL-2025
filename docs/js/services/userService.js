import { db } from "../firebase.js";
import { collection, query, where, doc,getDoc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

export async function hasAcceptedRules(userId) {

  const snap = await getDoc(
    doc(db, "participants", userId)
  );

  if (!snap.exists()) return false;

  return snap.data().acceptedRules === true;
}

export async function acceptRules(user) {

  await setDoc(
    doc(db, "participants", user.uid),
    {
      acceptedRules: true,
      acceptedDate: Date.now(),
      displayName: user.displayName,
      email: user.email
    },
    { merge: true }
  );
}
