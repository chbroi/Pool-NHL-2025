import { appState } from "./state.js";
import { TABS } from "../constants.js";
import { showRulesModal } from "./rulesModal.js";
import { renderHome, renderScoring, renderProfile, renderStats, renderAdmin, renderNhlStats, loadPredictionsDetails, renderFullLeaderboard, renderSubmissionStatus} from "../ui/render.js";

const tabRenderers = { 
  home: () => renderHome(),
  results: () => loadPredictionsDetails(),
  leaderboard: () => renderFullLeaderboard(),
  scoring: () => renderScoring(),
  stats: () => renderStats(),
  statsNHL: () => renderNhlStats(),
  profile: () => renderProfile(),
  admin: () => renderAdmin(),
  rules: () => handleRulesTab(),
  submit: () => handleSubmitTab()
};

async function handleSubmitTab() {
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

function handleRulesTab() {

 document
   .getElementById("rulesTab")
   .style.display = "block";

}

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
updateActiveTab(tabName);
toggleHelperMessage(tabName);


 
  TABS.forEach(t => {

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

 await tabRenderers[tabName]?.();
}
