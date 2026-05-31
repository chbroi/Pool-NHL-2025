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




// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  appState.user = result.user;
});
// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});



document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("themeToggle");

  // restore thème
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    document.body.setAttribute("data-theme", savedTheme);

    // mettre le bon icône au chargement
    if (btn) {
      btn.innerText = savedTheme === "dark" ? "☀️" : "🌙";
    }
  }

  if (btn) {
    btn.addEventListener("click", () => {

      const current = document.body.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";

      document.body.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);

      btn.innerText = next === "dark" ? "☀️" : "🌙";

    });
  }

});

onAuthStateChanged(auth, async (user) => {

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInfo = document.getElementById("userInfo");
  const appContent = document.getElementById("appContent");
 


  if (user) {

    appState.user = user;
    const alreadyDone = await alreadySubmitted();
    appState.hasSubmitted = alreadyDone;
    console.log("SYNC OK:", alreadyDone);
    // UI connecté
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    if (userInfo) {
      userInfo.innerText = user.displayName;
    }

    if (appContent) appContent.style.display = "block";

    // CONFIG
    const { config, results } = await loadAppConfig();

    appState.submission = config.currentSubmission;
    appState.results = results;

    const helper = document.getElementById("helperMessage");
    if (helper) {
      helper.innerHTML = config.submissionOpen
        ? config.helperMessage
        : "⏳ Les soumissions sont fermées pour cette ronde.";
    }

    // GENERATE ROUNDS
    if (appState.results && Object.keys(appState.results).length > 0) {
      for (let i = 1; i <= appState.submission; i++) {
        await generateRound(i);
      }
    }

    // listeners
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

    // logique app
    showTab("home");

  } else {

    appState.user = null;

    // UI déconnecté
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";

    if (userInfo) {
      userInfo.innerText = "";
    }

    if (appContent) appContent.style.display = "none";

    // message
    const home = document.getElementById("homeTab");
    if (home) {
      home.innerHTML = `
        <div class="card">
          <h2>Bienvenue 👋</h2>
          <p>Veuillez vous connecter pour accéder au pool.</p>
        </div>
      `;
    }
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
  
const rules = document.getElementById("rulesContainer");
if (rules) rules.style.display = "none";
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
  
    const form = document.getElementById("predictionForm");
    const tab = document.getElementById("submitTab");
  
    if (!form || !tab) return;
    console.log("hasSubmitted:", appState.hasSubmitted);
    if (appState.hasSubmitted) {
  
      form.style.display = "none";
  
      tab.innerHTML = `
        <div class="card">
          <h3>✅ Déjà soumis</h3>
          <p>Reviens à la prochaine ronde</p>
        </div>
      `;
  
    } else {
  
      // IMPORTANT → remettre le form si effacé
      if (!tab.querySelector("#predictionForm")) {
        tab.appendChild(form);
      }
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
   const acceptBtn = document.getElementById("acceptRulesButton");
    
    if (acceptBtn) {
      acceptBtn.addEventListener("click", () => {
        document.getElementById("rulesContainer").style.display = "none";
        document.getElementById("engagementContainer").style.display = "block";
      });
    }


    // Lorsqu'on confirme l'engagement  
    const confirmBtn = document.getElementById("confirmEngagementButton");
    
    if (confirmBtn) {
      confirmBtn.addEventListener("click", funcs.confirmEngagement);
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




