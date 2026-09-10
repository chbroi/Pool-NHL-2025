import * as funcs from "../functions.js";
import { auth, db } from "../firebase.js";
import { appState } from "../app/state.js";
import { showTab } from "../app/tabs.js";
import { loadAppConfig, hasAcceptedRules } from "../services/userService.js";
import { hasSubmitted } from "../services/firestoreService.js";
import { setupRealtimeListeners }from "../services/realtimeService.js";
import { attachRound1Listeners, attachRound2Listeners, attachRound3Listeners, attachConnSmytheListeners} from "../ui/listeners.js";
import { generateRound }from "../ui/render.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


export function initializeAuth() {

  onAuthStateChanged(
    auth,

    async user => {

      const {
        config,
        results
      } = await loadAppConfig();

      if (user) {

        try {

          await handleLoggedInUser(
            user,
            config,
            results
          );

        } catch (err) {

          console.error(err);

          alert(
            "Erreur d'initialisation : " +
            err.message
          );

        }

      } else {

        handleLoggedOutUser();

      }

    }

  );

}

function handleLoggedOutUser() {
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
  
    // ======================
    // Déconnexion
    // ======================
    const profileTab =
    document.getElementById("profileTab");
  
    if (profileTab) {
      profileTab.style.display = "none";
      profileTab.innerHTML = "";
    }

    const adminBtn =
    document.getElementById(
      "adminTabButton"
    );
  
    if (adminBtn) {
      adminBtn.style.display = "none";
    }
  
    appState.user = null;
  
    if (loginBtn) {
      loginBtn.style.display =
        "inline-block";
    }
  
    if (logoutBtn) {
      logoutBtn.style.display =
        "none";
    }
  
    if (userInfo) {
      userInfo.innerText = "";
      userInfo.style.display ="none";
    }
  
    const profileBtn =
      document.getElementById(
        "profileTabButton"
      );
  
    if (profileBtn) {
      profileBtn.style.display =
        "none";
    }
  
    if (profileTab) {
      profileTab.innerHTML = "";
    }
  
    // Retour automatique à la page actuelle
  
    const lastTab =localStorage.getItem( "activeTab") || "home";
    showTab(lastTab);
  
    // Page d'accueil visiteur
  
    const home =
      document.getElementById(
        "homeTab"
      );
  
    if (home) {
  
      home.innerHTML = `
        <div class="card">
  
          <h2>
            🏒 Pool des séries éliminatoires
          </h2>
  
          <p>
            Consultez les résultats
            et le classement gratuitement.
          </p>
  
          <p>
            Connectez-vous pour participer.
          </p>
  
          <button
            onclick="document.getElementById('loginBtn').click()">
  
            Connexion pour participer
  
          </button>
  
        </div>
      `;
    }
  }

async function handleLoggedInUser( user, config, results) {
      const loginBtn = document.getElementById("loginBtn");
      const logoutBtn = document.getElementById("logoutBtn");
      const userInfo = document.getElementById("userInfo");
      appState.user = user;
      appState.acceptedRules = await hasAcceptedRules(user.uid);
      const participantDoc = await getDoc(doc(db, "participants", user.uid));
      appState.isAdmin = participantDoc.exists() && participantDoc.data().isAdmin === true;
      setupRealtimeListeners();
 
      appState.submission = Number(config.currentSubmission);
      appState.results = results;
      appState.deadline = config.deadline;
      appState.submissionOpen = config.submissionOpen;
      appState.hasSubmitted = await hasSubmitted( user.uid, appState.submission);
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
  
      // ======================
      // Accueil
      // ======================
  
      const lastTab = localStorage.getItem("activeTab") || "home";
      showTab(lastTab);
  
}


export function initializeAuth() {

  onAuthStateChanged(
    auth,

    async user => {

      const {
        config,
        results
      } = await loadAppConfig();

      if (user) {

        try {

          await handleLoggedInUser(
            user,
            config,
            results
          );

        } catch (err) {

          console.error(err);

          alert(
            "Erreur d'initialisation : " +
            err.message
          );

        }

      } else {

        handleLoggedOutUser();

      }

    }

  );

}

