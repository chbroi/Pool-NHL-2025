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
import { showTab } from "./app/tabs.js";
import { initializeTheme } from "./app/theme.js";




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
  
  initializeTheme();
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

initializeAuth();

await loadPlayers()

const snapshot = await getDocs(
    collection(db, "players")
);

                


window.showRulesModal = function() {

  const modal =
  document.getElementById("rulesModal");

if (!modal) {

  console.error(
    "rulesModal introuvable"
  );

  return;
}

modal.style.display = "flex";

  const checkbox =
    document.getElementById(
      "rulesAcceptedCheckbox"
    );

  const btn =
    document.getElementById(
      "acceptModalBtn"
    );
  const closeBtn =
    document.getElementById(
      "closeRulesModal"
    );
  closeBtn.onclick = () => {
    modal.style.display = "none";
    showTab("home");
  };
  const viewRulesBtn =
    document.getElementById(
      "viewRulesBtn"
    );
  
    viewRulesBtn.onclick = () => {
      modal.style.display = "none";
      const backContainer =
        document.getElementById(
          "rulesBackContainer"
        );
    
      if (backContainer) {
        backContainer.style.display =
          "block";
      }
      showTab("rules");
    };

  checkbox.onchange = () => {
    btn.disabled = !checkbox.checked;
  };

  btn.onclick = async () => {

    await acceptRules(appState.user);
    const backContainer =
      document.getElementById(
        "rulesBackContainer"
      );
    
    if (backContainer) {
      backContainer.style.display =
        "none";
    }

    appState.acceptedRules = true;

    modal.style.display = "none";

    showTab("submit");
  };
};

window.showTab = showTab;



async function alreadySubmitted() {
  return await hasSubmitted(appState.user.uid, appState.submission);
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






window.updateConnSmythePlayers =
async function() {

  const response = await fetch(
    "https://api-web.nhle.com/v1/skater-stats-leaders/current"
  );

  const data = await response.json();

  console.log(data);

};
