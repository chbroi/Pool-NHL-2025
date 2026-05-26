//MAIN Script pour le pool

import * as funcs from "./functions.js";
import { auth, db, GoogleAuthProvider } from "./firebase.js";
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { currentSubmission, previousData, playersByTeam, round1Ids,SCORING } from "./constants.js";

let currentUser = null;
let hasSubmittedCurrentRound = false;


// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  currentUser = result.user;
});

// AUTO LOGIN/ LOGOUT
onAuthStateChanged(auth, async (user) => {
  const tabs = document.getElementById("tabs");
  const rulesContainer = document.getElementById("rulesContainer");
  const form = document.getElementById("predictionForm");

  if (user) {

    currentUser = user;

    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("appContent").style.display = "block";

    document.getElementById("userInfo").innerText =
      "Connecté : " + user.displayName;

    const eligible = await checkEligibility(db, currentUser, currentSubmission);

    if (!eligible) {

      const msg = document.createElement("h2");
      msg.innerText = "🔒 Lecture seule - non éligible";

      document.getElementById("appContent").prepend(msg);

      loadUserPicks();

      return;
    }

    const alreadyDone = await alreadySubmitted();
    hasSubmittedCurrentRound = alreadyDone;

    // ✅ ===== FLOW =====

    if (currentSubmission === 1) {

      if (!alreadyDone) {
        // 👉 NOUVEAU USER
        tabs.style.display = "none";
        form.style.display = "none"
        rulesContainer.style.display = "block";
        return;
      }

      // 👉 DÉJÀ SOUMIS
      tabs.style.display = "block";
      form.style.display = "block";

      showTab("home");

    } else {

      // 👉 ROUNDS 2+
      tabs.style.display = "block";

      if (alreadyDone) {
        showTab("home");
      } else {
        showTab("submit");
      }
    }

  } else {

    currentUser = null;

    document.getElementById("appContent").style.display = "none";
    document.getElementById("loginContainer").style.display = "block";
  }
});




window.showTab = function(tabName) {

  const tabs = ["home", "submit", "results", "leaderboard", "rules"];

  tabs.forEach(t => {
    document.getElementById(t + "Tab").style.display = "none";
  });

  document.getElementById(tabName + "Tab").style.display = "block";

  // 🔥 chargement dynamique
  if (tabName === "home") renderHome();
  if (tabName === "results") loadPredictionsDetails();
  if (tabName === "leaderboard") renderFullLeaderboard();
  if (tabName === "submit") {
    if (hasSubmittedCurrentRound) {
      loadUserPicks();
      document.querySelectorAll("#predictionForm select, #predictionForm input")
      .forEach(el => el.disabled = true);
    } 
    else {
    document.querySelectorAll("#predictionForm select, #predictionForm input")
      .forEach(el => el.disabled = false);
  }
}
};
``



async function renderHome() {

  const leaderboard = await computeLeaderboard();

  const container = document.getElementById("homeTab");
  container.innerHTML = "<h2>🏆 Top 10</h2>";

  leaderboard.slice(0,10).forEach((p, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>#${i+1}</strong> ${p.name} — ${p.score} pts
    `;
    container.appendChild(div);
  });

  // ton score perso
  if (currentUser) {
    const user = leaderboard.find(p => p.name === currentUser.displayName);
    if (user) {
      const me = document.createElement("h3");
      me.innerText = `Ton score : ${user.score}`;
      container.appendChild(me);
    }
  }
}



async function loadPredictionsDetails() {

  const snapshot = await getDocs(collection(db, "predictions"));
  const container = document.getElementById("resultsTab");

  container.innerHTML = "<h2>📊 Détail des prédictions</h2>";

  // regrouper par match
  const matches = {};

  snapshot.forEach(doc => {
    const data = doc.data();

    Object.entries(data.picks).forEach(([key, value]) => {

      if (!matches[key]) matches[key] = {};

      matches[key][data.userName] = value;
    });
  });

  Object.keys(matches).forEach(matchKey => {

    const row = document.createElement("div");
    row.style.borderBottom = "1px solid #ccc";
    row.style.padding = "8px";

    let html = `<strong>${matchKey}</strong> | Résultat: ${previousData[matchKey] || "-"}`;

    Object.entries(matches[matchKey]).forEach(([user, pick]) => {

      const result = previousData[matchKey];
      let color = "black";
      let symbol = "⏳";

      if (result) {
        if (pick === result) {
          color = "green";
          symbol = "✅";
        } else {
          color = "red";
          symbol = "❌";
        }
      }

      html += `
        <span style="margin-left:10px; color:${color}">
          ${user}: ${pick} ${symbol}
        </span>
      `;
    });

    row.innerHTML = html;
    container.appendChild(row);
  });
}
``


async function renderFullLeaderboard() {

  const data = await computeLeaderboard();

  const container = document.getElementById("leaderboardTab");
  container.innerHTML = "<h2>Classement complet</h2>";

  data.forEach((p, i) => {
    const row = document.createElement("div");
    row.innerHTML = `#${i+1} - ${p.name} (${p.score} pts)`;
    container.appendChild(row);
  });
}





async function loadUserPicks() {

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", currentUser.uid),
    where("round", "==", currentSubmission)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const data = snapshot.docs[0].data().picks;

  // remplir le formulaire
  Object.keys(data).forEach(key => {
    const el = document.getElementById(key);
    if (el) el.value = data[key];
  });

  // désactiver les champs (lecture seule)
  document.querySelectorAll("#predictionForm select, #predictionForm input")
    .forEach(el => el.disabled = true);
  
  const btn = document.getElementById("submitBtn");
  if (btn) btn.disabled = true;

}

async function alreadySubmitted() {

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", currentUser.uid),
    where("round", "==", currentSubmission)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}

function getRoundFromKey(key) {
  if (key.startsWith("R1")) return 1;
  if (key.startsWith("R2")) return 2;
  if (key.startsWith("R3")) return 3;
  if (key.startsWith("R4")) return 4;
  return 0;
}

function calculateSubmissionScore(picks, results) {

  let score = 0;

  Object.keys(picks).forEach(key => {

    const resultValue = results[key];

    // 🚫 ignorer si pas de résultat réel encore
    if (!resultValue) return;

    if (key.includes("_team")) {

      const round = getRoundFromKey(key);
      const multiplier = SCORING.roundMultiplier[round];

      if (picks[key] === resultValue) {

        score += SCORING.teamCorrect * multiplier;

        const gamesKey = key.replace("_team", "_games");

        if (results[gamesKey] &&
            picks[gamesKey] === results[gamesKey]) {

          score += SCORING.gamesCorrect * multiplier;
        }
      }
    }

    if (key === "Conn_Smythe") {

      if (results[key] && picks[key] === results[key]) {
        score += SCORING.connSmythe;
      }
    }

  });

  return score;
}


function calculateTotalScore(predictions, results) {

  let total = 0;

  predictions.forEach(pred => {

    const submissionNumber = pred.round;
    const picks = pred.picks;

    const filtered = {};

    Object.keys(picks).forEach(key => {

      const round = getRoundFromKey(key);

      if (round >= submissionNumber || key === "Conn_Smythe") {
        filtered[key] = picks[key];
      }
    });

    total += calculateSubmissionScore(filtered, results);
  });

  return total;
}


async function computeLeaderboard() {

  const snapshot = await getDocs(collection(db, "predictions"));

  const users = {};

  snapshot.forEach(doc => {
    const data = doc.data();

    if (!users[data.userId]) {
      users[data.userId] = {
        name: data.userName,
        predictions: []
      };
    }

    users[data.userId].predictions.push(data);
  });

  const leaderboard = [];

  Object.values(users).forEach(user => {

    const score = calculateTotalScore(user.predictions, previousData);

    leaderboard.push({
      name: user.name,
      score: score
    });
  });

  leaderboard.sort((a, b) => b.score - a.score);

  console.log(leaderboard);

  return leaderboard;
}

    // Lorsqu'on accepte les règles
    document.getElementById('acceptRulesButton').addEventListener('click', () => {
      document.getElementById('rulesContainer').style.display = 'none';
      document.getElementById('engagementContainer').style.display = 'block';
    });

    // Lorsqu'on confirme l'engagement  
document.getElementById('confirmEngagementButton')
    .addEventListener('click', funcs.confirmEngagement);
    


async function checkEligibility(db, currentUser, currentSubmission) {

  if (!currentUser) return false;

  // ✅ Ronde 1 → toujours OK
  if (currentSubmission === 1) {
    return true;
  }

  // ✅ Vérifier la ronde précédente
  const previousRound = currentSubmission - 1;

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", currentUser.uid),
    where("round", "==", previousRound)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}



document.getElementById('R3_EST_1_team').addEventListener('change', () =>funcs.updateConnSmytheField(playersByTeam));
document.getElementById('R3_WEST_1_team').addEventListener('change', () =>funcs.updateConnSmytheField(playersByTeam));
round1Ids.forEach(id => {
  document.getElementById(id).addEventListener('change',  () =>funcs.createRound2Matchups(currentSubmission, round1Ids));
});

[
  'R2_EST_1_team', 'R2_EST_2_team', 'R2_WEST_1_team', 'R2_WEST_2_team'
].forEach(id => {
  document.getElementById(id).addEventListener('change',  () =>funcs.createRound3Matchups(currentSubmission));
});

[
  'R3_EST_1_team', 'R3_WEST_1_team'
].forEach(id => {
  document.getElementById(id).addEventListener('change', () =>funcs.createRound4Matchup(currentSubmission, playersByTeam));
});
  
async function hasSubmittedRound1() {

  if (!currentUser) return false;

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", currentUser.uid),
    where("round", "==", 1)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}

  async function submitPredictions() {

  if (!currentUser) {
    alert("Tu dois être connecté.");
    return;
  }

  const alreadyDone = await alreadySubmitted();

  if (alreadyDone) {
    alert("Tu as déjà soumis pour cette ronde.");
    return;
  }

  if (!confirm("Confirmer la soumission?")) return;

  const form = document.getElementById("predictionForm");
  const formData = new FormData(form);

  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  try {

    // ✅ 1. FIRESTORE (SEULEMENT DATA)
    await addDoc(collection(db, "predictions"), {
      userId: currentUser.uid,
      userName: currentUser.displayName,
      round: currentSubmission,
      picks: data,
      timestamp: Date.now()
    });

    // ✅ 2. UI UPDATE (APRÈS)
    alert("✅ Prédictions soumises !");

    hasSubmittedCurrentRound = true;

    document.getElementById("submitBtn").disabled = true;

    document.querySelectorAll("#predictionForm select, #predictionForm input")
      .forEach(el => el.disabled = true);

    const tabs = document.getElementById("tabs");
    if (tabs) tabs.style.display = "block";

    showTab("home");

  } catch (err) {
    console.error(err);
    alert("Erreur: " + err.message);
  }
};

window.submitPredictions = submitPredictions;




