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

                




window.showTab = showTab;



async function alreadySubmitted() {
  return await hasSubmitted(appState.user.uid, appState.submission);
}



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
