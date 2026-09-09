import { appState } from "../../app/state.js";
import { getAllPredictions} from "../../services/firestoreService.js";
import { computeLeaderboard, getRoundFromKey } from "../../logic/scoring.js";
import { getParentMatch, isResultAvailable } from "../../utils/helpers.js";
import { getRound1Matchups } from "../../services/matchService.js";
import { SCORING, MATCH_ORDER } from "../../constants.js";


export async function loadPredictionsDetails() {

  const round1Matchups = await getRound1Matchups();
  const round1Map = {};
  round1Matchups.forEach(m => {
    round1Map[m.id] = `${m.team1} vs ${m.team2}`;
  });
  const container = document.getElementById("resultsTab");
  const predictions = await getAllPredictions();
  if (predictions.length === 0) {

  container.innerHTML = `
    <div class="card">
      <h3>📊 Résultats</h3>

      <p>
        Aucune soumission pour le moment.
      </p>
    </div>
  `;

  return;
  }
}
