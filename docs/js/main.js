//MAIN Script pour le pool

import * as funcs from "./functions.js";
import { auth, db, GoogleAuthProvider } from "./firebase.js";
import {hasSubmitted, submitPrediction,loadPlayers} from "./services/firestoreService.js";
import { signInWithPopup, onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where,doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { round1Ids,SCORING, POOL_CONFIG} from "./constants.js";
import { appState } from "./app/state.js"
import { checkEligibility, loadAppConfig,hasAcceptedRules, acceptRules} from "./services/userService.js";
import { attachRound1Listeners, attachRound2Listeners, attachRound3Listeners, attachConnSmytheListeners} from "./ui/listeners.js";
import { loadPredictionsDetails, renderHome, renderFullLeaderboard, renderScoring, generateRound, renderSubmissionStatus, renderProfile, renderStats, renderAdmin, renderNhlStats, reloadFeedbackSection } from "./ui/render.js";
import { setupRealtimeListeners} from "./services/realtimeService.js";
import { toggleSubmissionOpen, updateSubmissionRound, clearAdminHistory, updateDeadline, deletePredictionAdmin, togglePayment, deleteFeedback} from "./admin/adminActions.js";
import { showRulesModal } from "./app/rulesModal.js";
import { submitPredictions } from "./services/predictionService.js";
import { initializeTheme} from "./app/theme.js";
import { initializeAuth} from "./auth/authHandlers.js";




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
  

  const currentDeadline = appState[`round${appState.submission}Deadline`];
  if (currentDeadline && Date.now() > currentDeadline) {
    appState.submissionOpen =false;
  }
  
    document.querySelectorAll(".rulesEntryFee")
    .forEach(el => {
      el.textContent = POOL_CONFIG.entryFee;
    });
    const entryFeeAmount =
    document.getElementById("entryFeeAmount");
  
  if (entryFeeAmount) {
    entryFeeAmount.textContent =
      POOL_CONFIG.entryFee;
  }
    const backBtn =
    document.getElementById(
      "backToModalBtn"
    );
  
  if (backBtn) {
  
    backBtn.addEventListener(
      "click",
      () => {
  
        document.getElementById(
          "rulesBackContainer"
        ).style.display = "none";
  
        showRulesModal();
  
      }
    );
  
  }

initializeTheme();

});

await loadPlayers();

const snapshot = await getDocs(
    collection(db, "players")
);

initializeAuth();
                  

window.showRulesModal = showRulesModal;

window.showTab = async function(tabName) {
  
  localStorage.setItem("activeTab",tabName);
  if (!appState.user && (tabName === "submit"|| tabName === "profile" )) {

      alert("Connecte-toi pour participer.");
    
      showTab("home");
      return;
  }
  if ( tabName === "admin" && !appState.isAdmin) {  
    showTab("home");
    return;
  }
  
  // mise en valeur de l'onglet actif
  document.querySelectorAll("#tabs button").forEach(btn => {
    btn.classList.remove("activeTab");
  });
  

  // trouver le bouton cliqué
  const clickedButton = document.querySelector(`#tabs button[onclick="showTab('${tabName}')"]`);
  if (clickedButton) {
    clickedButton.classList.add("activeTab");
  }
  const helper = document.getElementById("helperMessage");
  
  if (["home", "submit","scoring", "results", "leaderboard","stats","statsNHL", "rules","profile"].includes(tabName)) {
    helper.style.display = "block";
  } else {
    helper.style.display = "none";
  }


  const tabs = ["home", "submit","scoring", "results", "leaderboard","stats","statsNHL", "rules","admin","profile"];

  tabs.forEach(t => {

  const tab =
    document.getElementById(t + "Tab");

  if (tab) {
    tab.style.display = "none";
  }

});

  // cacher les règles par défaut
  
const rules = document.getElementById("rulesTab");
if (rules) rules.style.display = "none";
  document.getElementById("scoringTab").innerHTML = "";
  document.getElementById(tabName + "Tab").style.display = "block";
  document.getElementById("predictionForm").style.display = "none";

  if (tabName === "rules") {
    document.getElementById("rulesTab").style.display = "block";

  }

  if (tabName === "home") renderHome();
  if (tabName === "results") loadPredictionsDetails();
  if (tabName === "leaderboard") renderFullLeaderboard(); 
  if (tabName === "scoring") renderScoring();
  if (tabName === "stats") renderStats();
  if (tabName === "statsNHL") renderNhlStats();
  if (tabName === "profile") renderProfile();
  if (tabName === "admin") renderAdmin();
  if (tabName === "submit") {
      console.log(
    "acceptedRules",
    appState.acceptedRules
  );
    if (!appState.acceptedRules) {
        showRulesModal();
        return;
      }
  
    const form = document.getElementById("predictionForm");
    const tab = document.getElementById("submitTab");
  
    if (!form || !tab) return;
const currentDeadline = appState[`round${appState.submission}Deadline`];
const deadlinePassed = currentDeadline && Date.now() > currentDeadline;
if ( !appState.submissionOpen ||  deadlinePassed) {
  tab.innerHTML = `
    <div class="card">

      <h3>
        🔒 Soumissions fermées
      </h3>

      <p>
        Les prédictions pour cette ronde sont terminées.
      </p>

    </div>
  `;

  return;
}
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
      for (let i = 1; i <= 4; i++) {
        const roundDiv =
          document.getElementById(`round${i}`);
        if (!roundDiv) continue;
        if (i < appState.submission) {
          roundDiv.style.display = "none";
        } else {
          roundDiv.style.display = "block";
        }
      }
      await renderSubmissionStatus();
      form.style.display = "block";
    }
  }

if (tabName === "rules") {
    document.getElementById("rulesTab").style.display = "block";
  }
    
};


async function alreadySubmitted() {
  return await hasSubmitted(appState.user.uid, appState.submission);
}


window.submitPredictions =  submitPredictions;

function isResultAvailable(key) {
  return appState.results[key] && appState.results[key] !== "";
}


window.submitFeedback = async function () {

  const message =
    document
      .getElementById(
        "profileComment"
      )
      ?.value
      ?.trim();

  if (!message) {

    alert(
      "Veuillez entrer un commentaire."
    );

    return;
  }

  try {

    await addDoc(
      collection(db, "feedback"),
      {
        userId: appState.user.uid,
        userName: appState.user.displayName,
        email: appState.user.email,
        message,
        timestamp: Date.now()
      }
    );

    alert(
      "Merci pour votre commentaire !"
    );

    document.getElementById(
      "profileComment"
    ).value = "";

  } catch (err) {

    console.error(err);

    alert(
      "Erreur lors de l'envoi du commentaire."
    );

  }

};


window.toggleSubmissionOpen = toggleSubmissionOpen;

window.updateSubmissionRound = updateSubmissionRound;

window.clearAdminHistory = clearAdminHistory;

window.updateDeadline = updateDeadline;

window.deletePredictionAdmin = deletePredictionAdmin;

window.togglePayment = togglePayment;

window.deleteFeedback = deleteFeedback;

window.updateConnSmythePlayers =
async function() {

  const response = await fetch(
    "https://api-web.nhle.com/v1/skater-stats-leaders/current"
  );

  const data = await response.json();

  console.log(data);

};
