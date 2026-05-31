//MAIN Script pour le pool

import * as funcs from "./functions.js";
import { auth, db, GoogleAuthProvider } from "./firebase.js";
import {getAllPredictions, hasSubmitted, submitPrediction} from "./services/firestoreService.js";
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where,doc, getDoc, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { playersByTeam, round1Ids,SCORING} from "./constants.js";
import { appState } from "./app/state.js"
import { loadPredictionsDetails, renderHome, renderFullLeaderboard, loadUserPicks,generateRound} from "./ui/render.js"
import { checkEligibility, loadAppConfig} from "./services/userService.js";
import { attachRound1Listeners, attachRound2Listeners, attachRound3Listeners, attachConnSmytheListeners} from "./ui/listeners.js";


const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  document.body.setAttribute("data-theme", savedTheme);
}


const btn = document.getElementById("themeToggle");

btn.addEventListener("click", () => {
  const current = document.body.getAttribute("data-theme");

  const next = current === "dark" ? "light" : "dark";

  document.body.setAttribute("data-theme", next);

  localStorage.setItem("theme", next);
});


// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  appState.user = result.user;
});

// AUTO LOGIN/ LOGOUT
onAuthStateChanged(auth, async (user) => {

  const {config, results}=await loadAppConfig();
  appState.submission = config.currentSubmission;
  appState.results = results;
  const helper = document.getElementById("helperMessage");
  if (config.submissionOpen) {
    helper.innerHTML = config.helperMessage;
  } else {
    helper.innerHTML = "⏳ Les soumissions sont fermées pour cette ronde.";
  }

  
  
// sécuriser que previousData est prêt
  if (!appState.results || Object.keys(appState.results).length === 0) {
    console.warn("appState.results vide ❌");
  } else {
  
    for (let i = 1; i <= appState.submission; i++) {
      await generateRound(i);
    }
  
  }

  
  // attacher listeners APRÈS génération
  attachRound1Listeners();
  attachRound2Listeners();
  attachRound3Listeners();
  attachConnSmytheListeners();
  const form = document.getElementById("predictionForm");
  
  if (form && !form.hasListener) {
    form.addEventListener("change", () => {
      funcs.checkIfReadyToSubmit(appState.submission);
    });
  
    form.hasListener = true;
  }

  const tabs = document.getElementById("tabs");
  const rulesContainer = document.getElementById("rulesContainer");
  
  if (user) {

    appState.user = user;

    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("appContent").style.display = "block";

    document.getElementById("userInfo").innerText =
      "Connecté : " + user.displayName;

    // reset visuel
    rulesContainer.style.display = "none";

    const eligible = await checkEligibility(appState.user.uid, appState.submission);

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
    appState.hasSubmitted = alreadyDone;

    // FLOW

    if (appState.submission=== 1) {

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

    appState.user = null;

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

  if (i === appState.submission|| i === appState.submission+ 1) {
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

  if (appState.hasSubmitted) {

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










async function alreadySubmitted() {
  return await hasSubmitted(appState.user.uid, appState.submission);
}

   // Lorsqu'on accepte les règles
    document.getElementById('acceptRulesButton').addEventListener('click', () => {
      document.getElementById('rulesContainer').style.display = 'none';
      document.getElementById('engagementContainer').style.display = 'block';
    });

    // Lorsqu'on confirme l'engagement  
document.getElementById('confirmEngagementButton')
    .addEventListener('click', funcs.confirmEngagement);
    







async function hasSubmittedRound1() {

  if (!appState.user) return false;

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", appState.user.uid),
    where("round", "==", 1)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}

  async function submitPredictions() {

  if (!appState.user) {
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
    await submitPrediction( {
      userId: appState.user.uid,
      userName: appState.user.displayName,
      round: appState.submission,
      picks: data,
      timestamp: Date.now()
    });

    // 2. UI UPDATE (APRÈS)
    alert("Prédictions soumises !");

    appState.hasSubmitted = true;

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





function isResultAvailable(key) {
  return appState.results[key] && appState.results[key] !== "";
}
window.submitPredictions = submitPredictions;




