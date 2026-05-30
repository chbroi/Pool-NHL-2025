
import { db } from "../firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// récupérer les matchups ronde 1
export async function getRound1MatchMap() {

  const ref = doc(db, "results", "round1");
  const snap = await getDoc(ref);

  if (!snap.exists()) return {};

  const data = snap.data();

  const map = {};

  [...data.EST, ...data.WEST].forEach(match => {
    map[match.id] = `${match.team1} vs ${match.team2}`;
  });

  return map;
}
