//MAIN Script pour le pool

import * as funcs from "./functions.js";
import { auth, db, GoogleAuthProvider } from "./firebase.js";
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { currentSubmission, previousData, playersByTeam, round1Ids,SCORING } from "./constants.js";

let currentUser = null;


// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  currentUser = result.user;
});

// AUTO LOGIN/ LOGOUT



onAuthStateChanged(auth, async (user) => {

  if (user) {
    currentUser = user;


    const eligible = await checkEligibility(db, currentUser, currentSubmission);

    if (!eligible) {

      document.getElementById("appContent").style.display = "block";
      document.getElementById("loginContainer").style.display = "none";

      document.getElementById("userInfo").innerText =
        "Connecté: " + user.displayName;

      
      const btn = document.getElementById("submitBtn");
      if (btn) btn.disabled = true;


      const msg = document.createElement("h2");
      msg.innerText = " Lecture seule - non éligible";
      msg.style.textAlign = "center";

      document.getElementById("appContent").prepend(msg);

      loadUserPicks();
      return;
    }

    const alreadyDone = await alreadySubmitted();

    
    if (alreadyDone) {
    
      document.getElementById("appContent").innerHTML =
        "<h2 style='text-align:center'> Déjà soumis</h2>";
    
      const btn = document.getElementById("submitBtn");
      if (btn) btn.disabled = true;
    
      return;
    }


    // UI normale
    document.getElementById("userInfo").innerText =
      "Connecté: " + user.displayName;

    document.getElementById("appContent").style.display = "block";
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";

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

  // charger contenu dynamique
  if (tabName === "home") renderHome();
  if (tabName === "results") loadPredictionsDetails();
  if (tabName === "leaderboard") renderFullLeaderboard();
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

  const snapshot = await getDocs(collection(db, "predictions"));

  const container = document.getElementById("resultsTab");
  container.innerHTML = "<h2> Résultats détaillés</h2>";

  snapshot.forEach(doc => {

    const data = doc.data();

    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.margin = "10px";
    div.style.padding = "10px";

    let html = `
      <h3>${data.userName} (R${data.round})</h3>
      <ul>
    `;

    Object.entries(data.picks).forEach(([key, value]) => {

      const result = previousData[key];

      let status = "⏳";
      if (result) {
        status = value === result ? "✅" : "❌";
      }

      html += `<li>${key}: ${value} ${status}</li>`;
    });

    html += "</ul>";

    div.innerHTML = html;
    container.appendChild(div);
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




//loadParticipants()
  // Affichage spécial si la soumission est 1
  if (currentSubmission === 1) {
    // Affiche les règlements au chargement
    window.addEventListener('DOMContentLoaded', () => {
      document.getElementById('rulesContainer').style.display = 'block';
    });

    // Lorsqu'on accepte les règles
    document.getElementById('acceptRulesButton').addEventListener('click', () => {
      document.getElementById('rulesContainer').style.display = 'none';
      document.getElementById('engagementContainer').style.display = 'block';
    });

    // Lorsqu'on confirme l'engagement
    
document.getElementById('confirmEngagementButton')
    .addEventListener('click', funcs.confirmEngagement);
}
  // Affichage des rondes selon les soumissions
window.addEventListener("DOMContentLoaded", () => {
  if (currentSubmission >= 2) {
    document.getElementById('predictionForm').style.display = "block";
    document.getElementById('round1').style.display = "none";
    document.getElementById('round2').style.display = "block";
    funcs.showRoundFromData(2, previousData); // Affiche les choix de la ronde 2
  }
  if (currentSubmission >= 3) {
    document.getElementById('round2').style.display = "none";
    document.getElementById('round3').style.display = "block";
    funcs.showRoundFromData(3, previousData); // Affiche les choix de la ronde 3
  }
  if (currentSubmission >= 4) {
    document.getElementById('round3').style.display = "none";
    document.getElementById('round4').style.display = "block";
    funcs.showRoundFromData(4, previousData); // Affiche les choix de la ronde 4
    funcs.updateConnSmytheList(previousData.R3_EST_1_team,previousData.R3_WEST_1_team, playersByTeam);
  }
}); 
    
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#predictionForm select, #predictionForm input").forEach(el => {   
  el.addEventListener("input", () => funcs.checkIfReadyToSubmit(currentSubmission));
  el.addEventListener("change", () => funcs.checkIfReadyToSubmit(currentSubmission));
  });
});

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




/*Décommenter lorsque la première soumission est terminée
window.addEventListener('DOMContentLoaded', () => {
  // Affiche uniquement le message de fin
  document.getElementById('rulesContainer').style.display = 'none';
  document.getElementById('engagementContainer').style.display = 'none';
  document.getElementById('predictionForm').style.display = 'none';

  const lateMessage = document.createElement('div');
  lateMessage.style.padding = '1rem';
  lateMessage.style.fontSize = '1.2rem';
  lateMessage.style.textAlign = 'center';
  lateMessage.style.fontWeight = 'bold';
  lateMessage.innerText = "Il est désormais trop tard pour la première prédiction. Veuillez revenir sur cette page lors de la prochaine soumission avant le début de la  deuxième ronde! :)";

  document.body.appendChild(lateMessage);
});
//Décommenter lorsque la première soumission est terminée*/

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
  
window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("predictionForm");

  if (form) {
    form.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", () =>funcs.checkIfReadyToSubmit(currentSubmission));
      el.addEventListener("change", () =>funcs.checkIfReadyToSubmit(currentSubmission));
    });

    funcs.checkIfReadyToSubmit(currentSubmission) // Appel initial
  }

});


window.addEventListener("DOMContentLoaded", async () => {

  if (currentSubmission === 1) {

    // Vérifier si déjà soumis (donc déjà engagé implicite)
    if (currentUser) {
      const alreadyDone = await alreadySubmitted();
      if (alreadyDone) {
        showTab("home");
        return;
      }
    }

    // afficher les règles
    document.getElementById("rulesContainer").style.display = "block";

  } else {
    showTab("home");
  }

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



window.addEventListener("DOMContentLoaded", async () => {

  const tabs = document.getElementById("tabs");

  if (currentSubmission === 1) {

    const alreadyEngaged = await hasSubmittedRound1();

    if (alreadyEngaged) {
      if (tabs) tabs.style.display = "block";
      showTab("home");
      return;
    }

    //  cacher les tabs
    if (tabs) tabs.style.display = "none";
    // afficher message
    const msg = document.createElement("p");
    msg.innerText = "Veuillez accepter les règlements pour accéder au pool.";
    msg.style.textAlign = "center";
    msg.style.fontWeight = "bold";
    document.body.prepend(msg);

    // afficher règles
    document.getElementById("rulesContainer").style.display = "block";

  } else {

    // rounds 2+ → tabs visibles
    if (tabs) tabs.style.display = "block";
    showTab("home");
  }
});




