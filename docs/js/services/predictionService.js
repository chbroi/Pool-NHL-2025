import { appState } from "../app/state.js";
import { showTab } from "../app/tabs.js";
import { hasSubmitted,submitPrediction} from "./firestoreService.js";

export async function submitPredictions() {

  if (!appState.user) {
    alert("Tu dois être connecté.");
    return;
  }

  const alreadyDone = await hasSubmitted ( appState.user.uid, appState.submission);

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
