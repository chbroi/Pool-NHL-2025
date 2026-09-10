import { appState } from "./state.js";
import { renderHome, renderScoring, renderProfile, renderStats, renderAdmin, renderNhlStats, loadPredictionsDetails, renderFullLeaderboard, renderSubmissionStatus} from "../ui/render.js";


function updateActiveTab(tabName) {

  document
    .querySelectorAll("#tabs button")
    .forEach(btn => {
      btn.classList.remove("activeTab");
    });

  const clickedButton =
    document.querySelector(
      `#tabs button[onclick="showTab('${tabName}')"]`
    );

  if (clickedButton) {
    clickedButton.classList.add(
      "activeTab"
    );
  }
}

function toggleHelperMessage(tabName) {

  const helper =
    document.getElementById(
      "helperMessage"
    );

  helper.style.display =
    ["home","submit","results"]
      .includes(tabName)
      ? "block"
      : "none";

}
export async function showTab(tabName) {
  
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
