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



await loadPlayers()

const snapshot = await getDocs(
    collection(db, "players")
);

onAuthStateChanged(auth, async (user) => {

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInfo = document.getElementById("userInfo");
  const profileTab = document.getElementById("profileTab");
  const { config, results } = await loadAppConfig();
  if (user) {

  try {

      appState.user = user;
  
      appState.acceptedRules = await hasAcceptedRules(user.uid);
      const participantDoc = await getDoc(doc(db, "participants", user.uid));
      appState.isAdmin = participantDoc.exists() && participantDoc.data().isAdmin === true;
      setupRealtimeListeners();
  
      
  
      appState.submission = Number(config.currentSubmission);
      appState.results = results;
      appState.deadline = config.deadline;
      appState.submissionOpen = config.submissionOpen;
      appState.hasSubmitted = await alreadySubmitted();
      appState.round1Deadline = config.round1Deadline;
      appState.round2Deadline = config.round2Deadline;
      appState.round3Deadline = config.round3Deadline;
      appState.round4Deadline = config.round4Deadline;
      appState.paid = participantDoc.data()?.paid ?? false;
      funcs.refreshHelperMessage();
    
      // ======================
      // UI connecté
      // ======================
  
      if (loginBtn) {
        loginBtn.style.display = "none";
      }
  
      if (logoutBtn) {
        logoutBtn.style.display = "inline-block";
      }
  
      if (userInfo) {
        userInfo.innerText =user.displayName;
        userInfo.style.display = "inline-block";
        userInfo.onclick = () => { showTab("profile");}
      }    
      const profileBtn =
        document.getElementById(
          "profileTabButton"
        );
  
      if (profileBtn) {
        profileBtn.style.display =
          "inline-block";
      }
    const adminBtn =
      document.getElementById(
        "adminTabButton"
      );
    
    if (adminBtn) {
    
      adminBtn.style.display =
        appState.isAdmin
          ? "inline-block"
          : "none";
    
    }
  
      // ======================
      // Message utilisateur
      // ======================
  
  
      // ======================
      // Génération des rondes
      // ======================
  
      if (
        appState.results &&
        Object.keys(appState.results)
          .length > 0
      ) {
  
        for (
          let i = 1;
          i <= appState.submission;
          i++
        ) {
  
          await generateRound(i);
  
        }
  
      }
  
      // ======================
      // Listeners
      // ======================
  
      attachRound1Listeners();
      attachRound2Listeners();
      attachRound3Listeners();
      attachConnSmytheListeners();
  
      const form =
        document.getElementById(
          "predictionForm"
        );
  
      if (form && !form.hasListener) {
  
        form.addEventListener(
          "change",
          () => {
  
            funcs.checkIfReadyToSubmit(
              appState.submission
            );
  
          }
        );
  
        form.hasListener = true;
      }

                  





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

window.toggleSubmissionOpen = async function(status) {
  
  await updateDoc(
    doc(db, "config", "ui"),
    {
      submissionOpen: status
    }
  );
  await addDoc(
  collection(db, "adminLogs"),
  {
    action: status
      ? "Ouverture des soumissions"
      : "Fermeture des soumissions",

    admin:
      appState.user.displayName,

    timestamp:
      Date.now()
  }
);

  appState.submissionOpen = status;
  renderAdmin();
if (document.getElementById("submitTab").style.display === "block") {
showTab("submit");
}
  const helper =
  document.getElementById(
    "helperMessage"
  );

if (helper) {

  if (status) {
    const currentDeadline = appState[
    `round${appState.submission}Deadline`];

    helper.innerHTML =
      `⏳ Vous avez jusqu'au ${
        new Date(
          currentDeadline
        ).toLocaleString()
      } pour soumettre vos prédictions.`;

  } else {

    helper.innerHTML =
      "🔒 Prédictions terminées. Revenez plus tard.";

  }
}
  
  alert(
    status
    ? "Soumissions ouvertes"
    : "Soumissions fermées"
  );
funcs.refreshHelperMessage();
};


window.updateSubmissionRound =
async function() {

  const round = Number(
    document.getElementById(
      "adminSubmission"
    ).value
  );

  await updateDoc(
    doc(db, "config", "ui"),
    {
      currentSubmission: round
    }
  );
  await addDoc(
  collection(db, "adminLogs"),
  {
    action:
      `Soumission active -> ${round}`,

    admin:
      appState.user.displayName,

    timestamp:
      Date.now()
  }
);

  appState.submission = round;
  renderAdmin();
  funcs.refreshHelperMessage();

  alert(
    `Soumission ${round} activée`
  );
  
};

window.clearAdminHistory =
async function() {

  if (
    !confirm(
      "Supprimer tout l'historique ?"
    )
  ) {
    return;
  }

  const snapshot =
    await getDocs(
      collection(
        db,
        "adminLogs"
      )
    );

  await Promise.all(

    snapshot.docs.map(
      d =>
        deleteDoc(d.ref)
    )

  );

  renderAdmin();

};


window.updateDeadline =
async function() {

  await addDoc(
  collection(db, "adminLogs"),
  {
    action:
      "Modification des dates limites",

    admin:
      appState.user.displayName,

    timestamp:
      Date.now()
  }
);


  await updateDoc(
    doc(db, "config", "ui"),
    {

      round1Deadline:
        new Date(
          document.getElementById(
            "round1Deadline"
          ).value
        ).getTime(),

      round2Deadline:
        new Date(
          document.getElementById(
            "round2Deadline"
          ).value
        ).getTime(),

      round3Deadline:
        new Date(
          document.getElementById(
            "round3Deadline"
          ).value
        ).getTime(),

      round4Deadline:
        new Date(
          document.getElementById(
            "round4Deadline"
          ).value
        ).getTime()

    }
  );

  alert(
    "Dates mises à jour"
  );
funcs.refreshHelperMessage();
};


window.deletePredictionAdmin =
async function() {

  const id =
    document.getElementById(
      "deletePredictionSelect"
    ).value;

  if (
    !confirm(
      "Supprimer cette soumission ?"
    )
  ) {
    return;
  }

  await deleteDoc(
    doc(
      db,
      "predictions",
      id
    )
  );

  renderAdmin();

  alert(
    "Soumission supprimée."
  );

};

window.togglePayment =
async function(
  uid,
  paid
) {

  await updateDoc(
    doc(
      db,
      "participants",
      uid
    ),
    {
      paid
    }
  );

};

window.deleteFeedback =
async function(id) {

  if (
    !confirm(
      "Supprimer ce commentaire ?"
    )
  ) {
    return;
  }

  await deleteDoc(
    doc(
      db,
      "feedback",
      id
    )
  );

  renderAdmin();

};

window.updateConnSmythePlayers =
async function() {

  const response = await fetch(
    "https://api-web.nhle.com/v1/skater-stats-leaders/current"
  );

  const data = await response.json();

  console.log(data);

};
