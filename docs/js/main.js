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
import { submitFeedback } from "./services/feedback.js";
import { updateConnSmythePlayers } from "./services/nhlService.js";
import { showTab } from "./app/tabs.js";




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

window.showTab = showTab;


window.submitPredictions =  submitPredictions;

function isResultAvailable(key) {
  return appState.results[key] && appState.results[key] !== "";
}


window.submitFeedback = submitFeedback;

window.toggleSubmissionOpen = toggleSubmissionOpen;

window.updateSubmissionRound = updateSubmissionRound;

window.clearAdminHistory = clearAdminHistory;

window.updateDeadline = updateDeadline;

window.deletePredictionAdmin = deletePredictionAdmin;

window.togglePayment = togglePayment;

window.deleteFeedback = deleteFeedback;

window.updateConnSmythePlayers = updateConnSmythePlayers;
