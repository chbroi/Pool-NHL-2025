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

export async function generateRound(roundNumber) {

  const container = document.getElementById(`round${roundNumber}`);
  if (!container) return;

  const form = document.getElementById("predictionForm");
  const picks = form ? Object.fromEntries(new FormData(form)) : {};

  let matchups = [];

  // ✅ source (résultats ou picks)
  const source =
    roundNumber <= appState.submission
      ? appState.results
      : picks;

  // ✅ R1 depuis Firestore
  if (roundNumber === 1) {
    matchups = await getRound1Matchups();
  }

  // ✅ R2
  if (roundNumber === 2) {
    matchups = [
      { id: "R2_EST_1", team1: source["R1_EST_1_team"], team2: source["R1_EST_2_team"] },
      { id: "R2_EST_2", team1: source["R1_EST_3_team"], team2: source["R1_EST_4_team"] },
      { id: "R2_WEST_1", team1: source["R1_WEST_1_team"], team2: source["R1_WEST_2_team"] },
      { id: "R2_WEST_2", team1: source["R1_WEST_3_team"], team2: source["R1_WEST_4_team"] }
    ];
  }

  // ✅ R3
  if (roundNumber === 3) {
    matchups = [
      { id: "R3_EST_1", team1: source["R2_EST_1_team"], team2: source["R2_EST_2_team"] },
      { id: "R3_WEST_1", team1: source["R2_WEST_1_team"], team2: source["R2_WEST_2_team"] }
    ];
  }

  // ✅ R4
  if (roundNumber === 4) {
    container.style.display = "block";

    matchups = [
      { id: "R4_final", team1: source["R3_EST_1_team"], team2: source["R3_WEST_1_team"] }
    ];
  }

  // ✅ RENDER HTML
  let html = `<h2>Ronde ${roundNumber}</h2>`;

  matchups.forEach(match => {

    const team1 = match.team1 || "";
    const team2 = match.team2 || "";

    if (!team1 || !team2) {
      html += `<div class="matchup"><label>Match à venir</label></div>`;
      return;
    }

    html += `
      <div class="matchup">
        <label>${team1} vs ${team2}</label>

        <select name="${match.id}_team" id="${match.id}_team">
          <option value="">Choisir</option>
          <option value="${team1}">${team1}</option>
          <option value="${team2}">${team2}</option>
        </select>

        <label>en</label>

        <select name="${match.id}_games" id="${match.id}_games">
          <option value="">Choisir</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
        </select> matchs
      </div>
    `;
  });

  container.innerHTML = html;
  container.style.display = "block";
}
