//MAIN Script pour le pool

import * as funcs from "./functions.js";
import { auth, db, GoogleAuthProvider } from "./firebase.js";
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where,doc, getDoc, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { playersByTeam, round1Ids,SCORING } from "./constants.js";

let currentUser = null;
let currentSubmission=0;
let previousData={};
let sourceData={};
let hasSubmittedCurrentRound = false;

const MATCH_ORDER = [
  "R1_EST_1","R1_EST_2","R1_EST_3","R1_EST_4",
  "R1_WEST_1","R1_WEST_2","R1_WEST_3","R1_WEST_4",
  "R2_EST_1","R2_EST_2","R2_WEST_1","R2_WEST_2",
  "R3_EST_1","R3_WEST_1",
  "R4_final",
  "Conn_Smythe"
];


// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  currentUser = result.user;
});

// AUTO LOGIN/ LOGOUT
onAuthStateChanged(auth, async (user) => {

  await loadAppConfig();
  
// sécuriser que previousData est prêt
if (!previousData || Object.keys(previousData).length === 0) {
  console.warn("previousData vide ❌");
} else {

  for (let i = 1; i <= currentSubmission; i++) {
    await generateRound(i);
  }

}

  
  // attacher listeners APRÈS génération
  attachRound1Listeners();
  attachRound2Listeners();
  attachRound3Listeners();
  attachConnSmytheListeners();


  const tabs = document.getElementById("tabs");
  const rulesContainer = document.getElementById("rulesContainer");
  const form = document.getElementById("predictionForm");
  
  if (user) {

    currentUser = user;

    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("appContent").style.display = "block";

    document.getElementById("userInfo").innerText =
      "Connecté : " + user.displayName;

    // reset visuel
    rulesContainer.style.display = "none";

    const eligible = await checkEligibility(db, currentUser, currentSubmission);

    if (!eligible) {

      const msg = document.createElement("h2");
      msg.innerText = "🔒 Lecture seule - non éligible";
    
      if (!document.getElementById("readonlyMsg")) {
      
        const msg = document.createElement("h2");
        msg.id = "readonlyMsg";
        msg.innerText = "🔒 Lecture seule - non éligible";
      
        document.getElementById("homeTab").prepend(msg);
      }
      loadUserPicks();
      return;
    }

    const alreadyDone = await alreadySubmitted();
    hasSubmittedCurrentRound = alreadyDone;

    // FLOW

    if (currentSubmission === 1) {

      if (!alreadyDone) {

        tabs.style.display = "none";
        form.style.display = "none";
        rulesContainer.style.display = "block";

        showTab("rules");

        document.getElementById("acceptRulesButton").style.display = "block";
        return;
      }

      tabs.style.display = "block";
      form.style.display = "none";

      showTab("home");

    } else {

      tabs.style.display = "block";

      if (alreadyDone) {

        loadUserPicks();

        if (!document.getElementById("submittedMsg")) {
          const msg = document.createElement("h3");
          msg.id = "submittedMsg";
          msg.innerText = "Tu as déjà soumis. Voici ta prédiction";
          document.getElementById("submitTab").prepend(msg);
        }

        showTab("submit");

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
  
  // mise en valeur de l'onglet actif
  document.querySelectorAll("#tabs button").forEach(btn => {
    btn.classList.remove("activeTab");
  });
  
for (let i = 1; i <= 4; i++) {
  const roundDiv = document.getElementById(`round${i}`);
  if (!roundDiv) continue;

  if (i === currentSubmission || i === currentSubmission + 1) {
    roundDiv.style.display = "block";
  } else {
    roundDiv.style.display = "none";
  }
}  
  // trouver le bouton cliqué
  const clickedButton = document.querySelector(`#tabs button[onclick="showTab('${tabName}')"]`);
  if (clickedButton) {
    clickedButton.classList.add("activeTab");
  }
  const helper = document.getElementById("helperMessage");
  
  if (["home", "submit", "myPicks"].includes(tabName)) {
    helper.style.display = "block";
  } else {
    helper.style.display = "none";
  }


  const tabs = ["home", "submit", "results", "leaderboard", "rules"];

  tabs.forEach(t => {
    document.getElementById(t + "Tab").style.display = "none";
  });

  // cacher les règles par défaut
  document.getElementById("rulesContainer").style.display = "none";
  document.getElementById("myPicksTab").innerHTML = "";
  document.getElementById(tabName + "Tab").style.display = "block";
  document.getElementById("predictionForm").style.display = "none";

  if (tabName === "rules") {
    document.getElementById("rulesContainer").style.display = "block";
    document.getElementById("acceptRulesButton").style.display = "none";
    document.getElementById("engagementContainer").style.display = "none";

  }

  if (tabName === "home") renderHome();
  if (tabName === "results") loadPredictionsDetails();
  if (tabName === "leaderboard") renderFullLeaderboard(); 
    if (tabName === "myPicks") {
  
    // ne PAS afficher le form
    document.getElementById("predictionForm").style.display = "none";
    // afficher uniquement tes picks
    loadUserPicks();
    return;
  }


  if (tabName === "submit") {

  if (hasSubmittedCurrentRound) {

    document.getElementById("predictionForm").style.display = "none";

    document.getElementById("submitTab").innerHTML = `
      <h3>✅ Déjà soumis</h3>
      <p>Reviens à la prochaine ronde</p>
    `;

  } else {

    document.getElementById("predictionForm").style.display = "block";
  }
}
if (tabName === "rules") {
    document.getElementById("rulesContainer").style.display = "block";
    // cacher boutons
    document.getElementById("acceptRulesButton").style.display = "none";
    document.getElementById("engagementContainer").style.display = "none";
  }
};

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

  const round1Map = await getRound1MatchMap();
  const snapshot = await getDocs(collection(db, "predictions"));
  const container = document.getElementById("resultsTab");

  container.innerHTML = `<h2>📊 Résultats</h2>`;

  const submissions = {};

  // regrouper
  snapshot.forEach(doc => {
    const data = doc.data();

    if (!submissions[data.round]) {
      submissions[data.round] = {};
    }

    submissions[data.round][data.userId] = {
      name: data.userName,
      picks: data.picks
    };
  });

  // parcourir
  Object.keys(submissions).sort((a,b)=>a-b).forEach(round => {

    const users = Object.values(submissions[round]);

    let html = `<h3>Soumission ${round}</h3>`;
    html += `<div style="overflow-x:auto;">`;
    html += `<table style="border-collapse: collapse; min-width:800px;">`;

    // HEADER
    html += `<tr>
      <th>Match</th>
      <th>Résultat</th>
    `;
    users.forEach(u => {
      html += `<th>${u.name}</th>`;
    });
    html += `</tr>`;

    MATCH_ORDER.forEach(matchKey => {

      // Conn Smythe
      if (matchKey === "Conn_Smythe") {

        const result = previousData["Conn_Smythe"];

        html += `<tr><td>🏆 Conn Smythe</td><td>${result || "-"}</td>`;

        users.forEach(user => {

          const pick = user.picks["Conn_Smythe"];
          let cell = pick || "";

          if (isResultAvailable("Conn_Smythe") && pick) {
            cell += (pick === result) ? ` ✅✅ (+${SCORING.connSmythe})` : " ❌";
          }

          html += `<td>${cell}</td>`;
        });

        html += `</tr>`;
        return;
      }

      const teamKey = matchKey + "_team";
      const gamesKey = matchKey + "_games";

      const resultTeam = previousData[teamKey];
      const resultGames = previousData[gamesKey];
      const roundNum = getRoundFromKey(matchKey);

      // Match name (TOR vs OTT)
      
      let displayName = round1Map[matchKey];
      
      if (!displayName) {
      
        const t1 = previousData[getParentMatch(matchKey, 1)];
        const t2 = previousData[getParentMatch(matchKey, 2)];
      
        if (t1 && t2) {
          displayName = `${t1} vs ${t2}`;
        } else {
          displayName = matchKey;
        }
      }


      html += `<tr><td>${displayName}</td>`;

      // Résultat
      let resultDisplay = resultTeam || "-";
      if (isResultAvailable(gamesKey)) {
        resultDisplay += ` (${resultGames})`;
      }

      html += `<td>${resultDisplay}</td>`;

      users.forEach(user => {

        const pickTeam = user.picks[teamKey];
        const pickGames = user.picks[gamesKey];

        let cell = pickTeam ? `${pickTeam} (${pickGames})` : "";

        if (isResultAvailable(teamKey) && pickTeam) {

          let points = 0;
          const mult = SCORING.roundMultiplier[roundNum];

          if (pickTeam === resultTeam) {

            if (isResultAvailable(gamesKey) && Number(pickGames) === Number(resultGames)) {
              cell += " ✅✅";
              points += SCORING.teamCorrect * mult;
              points += SCORING.gamesCorrect * mult;
            } else {
              cell += " ✅";
              points += SCORING.teamCorrect * mult;
            }

          } else {
            cell += " ❌";
          }

          if (points > 0) {
            cell += ` (+${points})`;
          }
        }

        html += `<td style="text-align:center;">${cell}</td>`;
      });

      html += `</tr>`;
    });

    html += `</table></div><br>`;
    container.innerHTML += html;
  });
}


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

  if (!currentUser) return;

  const container = document.getElementById("myPicksTab");
  container.innerHTML = "<h2>Mes prédictions</h2>";

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", currentUser.uid)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  const docs = snapshot.docs.sort((a,b)=>
    a.data().round - b.data().round
  );

  const round1Map = await getRound1MatchMap();

  docs.forEach((doc, index) => {

    const picks = doc.data().picks;

    container.innerHTML += `<h3>🔹 Prédiction ${index+1}</h3>`;

    MATCH_ORDER.forEach(matchKey => {

      if (matchKey === "Conn_Smythe") {
        container.innerHTML += `<div>🏆 Conn Smythe : ${picks[matchKey] || ""}</div>`;
        return;
      }

      const teamKey = matchKey + "_team";
      const gamesKey = matchKey + "_games";

      let team = picks[teamKey];
      let games = picks[gamesKey];

      if (!team) return;

      let display = round1Map[matchKey];

      if (!display) {

        const t1 = picks[getParentMatch(matchKey, 1)];
        const t2 = picks[getParentMatch(matchKey, 2)];

        if (t1 && t2) {
          display = `${t1} vs ${t2}`;
        } else {
          return;
        }
      }

      container.innerHTML += `
        <div><strong>${display}</strong> → ${team} (${games})</div>
      `;
    });

  });
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

    // ignorer si pas de résultat réel encore
    if (!resultValue) return;

    if (key.includes("_team")) {

      const round = getRoundFromKey(key);
      const multiplier = SCORING.roundMultiplier[round];

      if (picks[key] === resultValue) {

        score += SCORING.teamCorrect * multiplier;

        const gamesKey = key.replace("_team", "_games");

        if (isResultAvailable(gamesKey) &&
            Number(picks[gamesKey]) === Number(results[gamesKey])) {

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

  // Ronde 1 → toujours OK
  if (currentSubmission === 1) {
    return true;
  }

  // Vérifier la ronde précédente
  const previousRound = currentSubmission - 1;

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", currentUser.uid),
    where("round", "==", previousRound)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}


function attachRound2Listeners() {

  [
    'R2_EST_1_team', 'R2_EST_2_team',
    'R2_WEST_1_team', 'R2_WEST_2_team'
  ].forEach(id => {

    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('change', () =>
      funcs.createRound3Matchups(currentSubmission)
    );
  });
}

function attachRound3Listeners() {

  [
    'R3_EST_1_team',
    'R3_WEST_1_team'
  ].forEach(id => {

    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('change', () => {
      funcs.createRound4Matchup(currentSubmission, playersByTeam);
    });

  });
}


function attachConnSmytheListeners() {

  const est = document.getElementById('R3_EST_1_team');
  const west = document.getElementById('R3_WEST_1_team');

  if (est) est.addEventListener('change', () => funcs.updateConnSmytheField(playersByTeam));
  if (west) west.addEventListener('change', () => funcs.updateConnSmytheField(playersByTeam));
}


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

    // 1. FIRESTORE (SEULEMENT DATA)
    await addDoc(collection(db, "predictions"), {
      userId: currentUser.uid,
      userName: currentUser.displayName,
      round: currentSubmission,
      picks: data,
      timestamp: Date.now()
    });

    // 2. UI UPDATE (APRÈS)
    alert("Prédictions soumises !");

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


async function loadAppConfig() {

  // config UI
  const configRef = doc(db, "config", "ui");
  const configSnap = await getDoc(configRef);

  if (configSnap.exists()) {
    const config = configSnap.data();
    

    currentSubmission = config.currentSubmission;

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
    previousData = resultsSnap.data();
    console.log("previousData loaded:", previousData);
  }
}


function isResultAvailable(key) {
  return previousData[key] && previousData[key] !== "";
}


async function generateRound(roundNumber) {

  const container = document.getElementById(`round${roundNumber}`);
  if (!container) return;

  const form = document.getElementById("predictionForm");
  const picks = form ? Object.fromEntries(new FormData(form)) : {};

  let matchups = [];

  // ✅ Ronde 1
  if (roundNumber === 1) {

    const ref = doc(db, "matchups", "round1");
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    matchups = [...data.EST, ...data.WEST];
  }

  // SOURCE FIX
  let source = {};

  if (roundNumber <= currentSubmission) {
    source = previousData; 
  } else {
    source = picks;
  }

  // Ronde 2
  if (roundNumber === 2) {
    matchups = [
      { id: "R2_EST_1", team1: source["R1_EST_1_team"], team2: source["R1_EST_2_team"] },
      { id: "R2_EST_2", team1: source["R1_EST_3_team"], team2: source["R1_EST_4_team"] },
      { id: "R2_WEST_1", team1: source["R1_WEST_1_team"], team2: source["R1_WEST_2_team"] },
      { id: "R2_WEST_2", team1: source["R1_WEST_3_team"], team2: source["R1_WEST_4_team"] }
    ];
  }

  // Ronde 3
  if (roundNumber === 3) {
    matchups = [
      { id: "R3_EST_1", team1: source["R2_EST_1_team"], team2: source["R2_EST_2_team"] },
      { id: "R3_WEST_1", team1: source["R2_WEST_1_team"], team2: source["R2_WEST_2_team"] }
    ];
  }

  // Ronde 4
  if (roundNumber === 4) {
    matchups = [
      { id: "R4_final", team1: source["R3_EST_1_team"], team2: source["R3_WEST_1_team"] }
    ];
  }

  let html = `<h2>Ronde ${roundNumber}</h2>`;

  matchups.forEach(match => {

    const team1 = match.team1 || "";
    const team2 = match.team2 || "";

    if (!team1 || !team2) {
      html += `<div class="matchup"><label>Match à venir</label></div>`;
      return;
    }

    html += `
      <div class="matchup">
        <label>${team1} vs ${team2}</label>

        <select name="${match.id}_team" id="${match.id}_team">
          <option value="">Choisir</option>
          <option value="${team1}">${team1}</option>
          <option value="${team2}">${team2}</option>
        </select>

        <label>en</label>

        <select name="${match.id}_games" id="${match.id}_games">
          <option value="">Choisir</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
        </select> matchs
      </div>
    `;
  });

  container.innerHTML = html;
}

function attachRound1Listeners() {

  round1Ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('change', () =>
      funcs.createRound2Matchups(currentSubmission, round1Ids)
    );
  });

}

async function getRound1MatchMap() {

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

function getParentMatch(matchKey, teamNb) {

  const map = {
    R2_EST_1: ["R1_EST_1_team", "R1_EST_2_team"],
    R2_EST_2: ["R1_EST_3_team", "R1_EST_4_team"],
    R2_WEST_1: ["R1_WEST_1_team", "R1_WEST_2_team"],
    R2_WEST_2: ["R1_WEST_3_team", "R1_WEST_4_team"],

    R3_EST_1: ["R2_EST_1_team", "R2_EST_2_team"],
    R3_WEST_1: ["R2_WEST_1_team", "R2_WEST_2_team"],

    R4_final: ["R3_EST_1_team", "R3_WEST_1_team"]
  };

  return map[matchKey] ? map[matchKey][teamNb-1] : null;
}


window.submitPredictions = submitPredictions;




