//MAIN Script pour le pool

import * as funcs from "./functions.js";
import { auth, db, GoogleAuthProvider } from "./firebase.js";
import {getAllPredictions, hasSubmitted, submitPrediction} from "./services/firestoreService.js";
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, query, where,doc, getDoc, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { playersByTeam, round1Ids,SCORING, POOL_CONFIG} from "./constants.js";
import { appState } from "./app/state.js"
import { loadPredictionsDetails, renderHome, renderFullLeaderboard, renderScoring,generateRound} from "./ui/render.js"
import { checkEligibility, loadAppConfig,hasAcceptedRules, acceptRules} from "./services/userService.js";
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
  try {

    appState.user = user;
    appState.acceptedRules =
      await hasAcceptedRules(user.uid);

    const { config, results } = await loadAppConfig();
    appState.submission = Number(config.currentSubmission);
    appState.results = results;
    appState.hasSubmitted =await alreadySubmitted();

    //  UI connecté
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    if (userInfo) {
      userInfo.innerText = user.displayName;
    }

   

    //  helper message
    const helper = document.getElementById("helperMessage");
    if (helper) {
      helper.innerHTML = config.submissionOpen
        ? config.helperMessage
        : "⏳ Les soumissions sont fermées pour cette ronde.";
    }

    // generate rounds
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

    //  logique app
    showTab("home");


    } catch(err) {
  
      console.error(err);
  
      alert(
        "Erreur d'initialisation : " +
        err.message
      );
    }
  } else {

    appState.user = null;

    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";

    if (userInfo) userInfo.innerText = "";

    const home = document.getElementById("homeTab");
    if (home) {
      home.innerHTML = `
        <div class="card">
        
          <h2>🏒 Pool des séries éliminatoires</h2>
        
          <p>Consultez les résultats et le classement gratuitement.</p>
        
          <p>Connectez-vous pour participer.</p>
        
          <button onclick="document.getElementById('loginBtn').click()">
            Connexion pour participer
          </button>
        
        </div>
        `;
    }
  }
});





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

  checkbox.onchange = () => {
    btn.disabled = !checkbox.checked;
  };

  btn.onclick = async () => {

    await acceptRules(appState.user);

    appState.acceptedRules = true;

    modal.style.display = "none";

    showTab("submit");
  };
};



window.showTab = function(tabName) {
  
  if (!appState.user && tabName === "submit") {

      alert("Connecte-toi pour participer.");
    
      showTab("home");
      return;
  }

  
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
  
  if (["home", "submit", "scoring"].includes(tabName)) {
    helper.style.display = "block";
  } else {
    helper.style.display = "none";
  }


  const tabs = ["home", "submit","scoring", "results", "leaderboard", "rules",];

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
  if (tabName === "submit") {
      console.log(
    "acceptedRules",
    appState.acceptedRules
  );
  
  console.log(
    "predictionForm",
    document.getElementById("predictionForm")
  );
  
  console.log(
    "submitTab",
    document.getElementById("submitTab")
  );
    if (!appState.acceptedRules) {
        showRulesModal();
        return;
      }
  
    const form = document.getElementById("predictionForm");
      console.log(
    "predictionForm",
    document.getElementById("predictionForm")
  );
    const tab = document.getElementById("submitTab");
  
    if (!form || !tab) return;
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
    document.getElementById("rulesTab").style.display = "block";
  }
    
};


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




