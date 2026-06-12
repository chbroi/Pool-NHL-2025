import { appState } from "../app/state.js";
import { getAllPredictions } from "../services/firestoreService.js";
import { SCORING, MATCH_ORDER } from "../constants.js";
import { computeLeaderboard, getRoundFromKey} from "../logic/scoring.js";
import { isResultAvailable, getParentMatch} from "../utils/helpers.js";
import { getRound1Matchups } from "../services/matchService.js";



export async function loadPredictionsDetails() {

  const round1Matchups = await getRound1Matchups();
  const round1Map = {};
  round1Matchups.forEach(m => {
    round1Map[m.id] = `${m.team1} vs ${m.team2}`;
  });

  const predictions = await getAllPredictions();
  const leaderboard = await computeLeaderboard(predictions, appState.results);
  const container = document.getElementById("resultsTab");
  

  container.innerHTML = `<h2>📊 Résultats</h2>`;

  const submissions = {};

  // Regrouper
  predictions.forEach(data => {
    
    if (!submissions[data.round]) {
      submissions[data.round] = {};
    }

    submissions[data.round][data.userId] = {
      name: data.userName,
      picks: data.picks
    };
  });
  const sortedRounds = Object.keys(submissions)
    .map(Number)
    .sort((a,b)=>a-b);
  
  const lastSubmission = sortedRounds[sortedRounds.length - 1];

  // Tous les users
  
  const orderedUsers = leaderboard.map(u => ({
    id: u.id,
    name: u.name,
    score: u.score
  }));


  Object.values(submissions).forEach(roundUsers => {
    Object.entries(roundUsers).forEach(([id, user]) => {
      orderedUsers[id] = user.name;
    });
  });

  const rounds = {
    1: MATCH_ORDER.filter(k => k.startsWith("R1")),
    2: MATCH_ORDER.filter(k => k.startsWith("R2")),
    3: MATCH_ORDER.filter(k => k.startsWith("R3")),
    4: MATCH_ORDER.filter(k => k.startsWith("R4"))
  };

  const globalScores = {};

  Object.keys(submissions).map(Number).sort((a,b)=>a-b).forEach(round => {

    let html = `<h3>Soumission ${round}</h3>`;
    html += `<div style="overflow-x:auto;">`;
    html += `<table class="resultsTable">`;

    // HEADER
    html += `<tr>
      <th>Match</th>
      <th>Résultat</th>
    `;

    
    orderedUsers.forEach(u => {
    
      const isMe = appState.user && u.id === appState.user.uid;
      html += `<th class="${isMe ? 'myColumnHeader' : ''}">
        ${isMe ? "👤 " : ""}${u.name}
      </th>`;
    });


    html += `</tr>`;

    const submissionScores = {};

    // Rounds
    Object.keys(rounds).forEach(r => {

      if (Number(r) < Number(round)) return;
      html += `<tr class="roundHeader">
        <td colspan="${orderedUsers.length + 2}">Ronde ${r}</td>
      </tr>`;

      rounds[r].forEach(matchKey => {

        const teamKey = matchKey + "_team";
        const gamesKey = matchKey + "_games";

        
        
        let resultTeam = appState.results[teamKey]; // ✅ vrai gagnant

        let resultDisplay = resultTeam;
        
        // fallback uniquement pour affichage
        if (!resultDisplay || resultDisplay === "") {
        
          const p1 = getParentMatch(matchKey, 1);
          const p2 = getParentMatch(matchKey, 2);
        
          const t1 = p1 ? appState.results[p1 + "_team"] : null;
          const t2 = p2 ? appState.results[p2 + "_team"] : null;
        
          if (t1 && t2) {
            resultDisplay = `${t1} vs ${t2}`; // ✅ affichage seulement
          } else {
            resultDisplay = "-";
          }
        }


        const resultGames = appState.results[gamesKey];
        const roundNum = getRoundFromKey(matchKey);

        let displayName = "";

        // ✅ CAS RONDE 1 (source officielle)
        if (round1Map[matchKey]) {
          displayName = round1Map[matchKey];
        } else {
          // ✅ RONDES SUIVANTES → via parents
          const p1 = getParentMatch(matchKey, 1);
          const p2 = getParentMatch(matchKey, 2);
        
          const t1 = p1 ? appState.results[p1 + "_team"] : null;
          const t2 = p2 ? appState.results[p2 + "_team"] : null;
        
          if (t1 && t2) {
            displayName = `${t1} vs ${t2}`;
          } else {
            displayName = "Match à déterminer";
          }
        }
        
       

        html += `<tr><td>${displayName}</td>`;
        
        if (isResultAvailable(gamesKey)) {
          resultDisplay += ` (${resultGames})`;
        }

        html += `<td>${resultDisplay}</td>`;

        orderedUsers.forEach(user => {
          const userData = submissions[round]?.[user.id];
          const pickTeam = userData?.picks?.[teamKey];
          const pickGames = userData?.picks?.[gamesKey];

          let cell = pickTeam ? `${pickTeam} (${pickGames})` : "-";

          let points = 0;
          
          const submission = round;
          
          const submissionConfig = SCORING.submissions[submission];
          const roundConfig = submissionConfig?.rounds[roundNum];
          const isMe = appState.user && user.id === appState.user.uid;
          

          if (pickTeam && isResultAvailable(teamKey)) {

            if (pickTeam === resultTeam) {

              
                if (roundConfig) {
                
                  points += roundConfig.team;
                
                  if (
                    isResultAvailable(gamesKey) &&
                    Number(pickGames) === Number(resultGames)
                  ) {
                    points += roundConfig.games;
                  }
                
                }
                if (
                  isResultAvailable(gamesKey) &&
                  Number(pickGames) === Number(resultGames)
                ) {
                  cell += " ✅✅";
                } else {
                  cell += " ✅";
                }


            } else {
              cell += " ❌";
            }

            if (points > 0) {
              cell += ` (+${points})`;
            }
          }

          submissionScores[user.id] = (submissionScores[user.id] || 0) + points;
          globalScores[user.id] = (globalScores[user.id] || 0) + points;
          

          html += `
          <td class="${isMe ? 'myColumnCell' : ''}">
            ${cell}
          </td>
        `;
        });

        html += `</tr>`;
      });
      
    });
    // ✅ Conn Smythe
    html += `<tr>
      <td>🏆 Conn Smythe</td>
      <td>${appState.results["Conn_Smythe"] || "-"}</td>
    `;

    orderedUsers.forEach(user => {

      const userData = submissions[round]?.[user.id];
      const pick = userData?.picks?.["Conn_Smythe"];

      let cell = pick || "-";
      let points = 0;

      const submission = Number(round);
      const submissionConfig = SCORING.submissions[submission];

      if (pick && appState.results["Conn_Smythe"]) {

        if (pick === appState.results["Conn_Smythe"]) {
          cell += ` ✅✅ (+${SCORING.connSmythe})`;
          points += submissionConfig.connSmythe;
        } else {
          cell += " ❌";
        }
      }

      submissionScores[user.id] = (submissionScores[user.id] || 0) + points;
      globalScores[user.id] = (globalScores[user.id] || 0) + points;

      html += `<td>${cell}</td>`;
    });

    html += `</tr>`;

    // ✅ Total soumission
    html += `<tr class="scoreRow">
      <td colspan="2"><strong>Total Soumission</strong></td>`;

    orderedUsers.forEach(user => {
      html += `<td><strong>${submissionScores[user.id] || 0}</strong></td>`;
    });

    html += `</tr>`;

    // ✅ Total global
    
    if (round === lastSubmission) {
    
      html += `<tr class="totalGlobalRow">
        <td colspan="2"><strong>Total Global</strong></td>`;
    
      orderedUsers.forEach(user => {
        html += `<td><strong>${globalScores[user.id] || 0}</strong></td>`;
      });
    
      html += `</tr>`;
    }

    html += `</table></div><br>`;
    container.innerHTML += html;
    
orderedUsers.sort((a, b) => {
  return (globalScores[b.id] || 0) - (globalScores[a.id] || 0);
});

  });
}


export async function renderHome() {

  
const predictions = await getAllPredictions();

const leaderboard = await computeLeaderboard(predictions,
  appState.results);


  const container = document.getElementById("homeTab");
  container.innerHTML = "<h2>🏆 Top 10</h2>";

  leaderboard.slice(0,10).forEach((p, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>#${i+1}</strong> ${p.name} — ${p.score} pts
    `;
    container.appendChild(div);
  });

  // ton score perso
  if (appState.user) {
    const user = leaderboard.find(p => p.name === appState.user.displayName);
    if (user) {
      const me = document.createElement("h3");
      me.innerText = `Ton score : ${user.score}`;
      container.appendChild(me);
    }
  }
  
container.innerHTML += `
  <div class="card">
    <h3>ℹ️ Comment utiliser le pool</h3>
  <div class="homeActions">
    <div class="homeAction" onclick="showTab('submit')">
      <strong>Soumettre</strong>
      <span>Entrer tes prédictions</span>
    </div>
  
    <div class="homeAction" onclick="showTab('scoring')">
      <strong>Système de pointage</strong>
      <span>Comprendre comment les points sont calculés</span>
    </div>
  
    <div class="homeAction" onclick="showTab('results')">
      <strong>Résultats</strong>
      <span>Voir les points obtenus par chaque joueur</span>
    </div>
  
    <div class="homeAction" onclick="showTab('leaderboard')">
      <strong>Classement</strong>
      <span>Consulter le classement global</span>
    </div>
  
    <div class="homeAction" onclick="showTab('rules')">
      <strong>Règlements</strong>
      <span>Lire les règles officielles du pool</span>
    </div>
  </div>

  </div>
`
}



export async function renderFullLeaderboard() {
  const container = document.getElementById("leaderboardTab");

  const predictions = await getAllPredictions();
  const data = await computeLeaderboard(predictions, appState.results);

  container.innerHTML = `<h2>🏆 Classement complet</h2>`;

  data.forEach((p, i) => {
    const row = document.createElement("div");
    row.innerHTML = `
      <strong>#${i + 1}</strong> ${p.name} — ${p.score} pts
    `;
    container.appendChild(row);
  });
}


export async function loadUserPicks() {

  if (!appState.user) return;

  const container = document.getElementById("myPicksTab");
  container.innerHTML = "<h2>Mes prédictions</h2>";

  
  const allPredictions = await getAllPredictions();
  
  const docs = allPredictions
    .filter(p => p.userId === appState.user.uid)
    .sort((a,b) => a.round - b.round);
  
  if (docs.length === 0) return;


  
  const round1Matchups = await getRound1Matchups();
  
  const round1Map = {};
  round1Matchups.forEach(m => {
    round1Map[m.id] = `${m.team1} vs ${m.team2}`;
  });


  docs.forEach((doc, index) => {

    const picks = doc.picks;

    container.innerHTML += `<h3>🔹 Prédiction ${index+1}</h3>`;

    MATCH_ORDER.forEach(matchKey => {

      if (matchKey === "Conn_Smythe") {
        container.innerHTML += `<div>🏆 Conn Smythe : ${picks[matchKey] || ""}</div>`;
        return;
      }

      const teamKey = matchKey + "_team";
      const gamesKey = matchKey + "_games";

      let team = picks[teamKey];
      let games = picks[gamesKey];

      if (!team) return;

      let display = round1Map[matchKey];

      if (!display) {

        const t1 = picks[getParentMatch(matchKey, 1)];
        const t2 = picks[getParentMatch(matchKey, 2)];

        if (t1 && t2) {
          display = `${t1} vs ${t2}`;
        } else {
          return;
        }
      }

      container.innerHTML += `
        <div><strong>${display}</strong> → ${team} (${games})</div>
      `;
    });

  });
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
}

export function renderScoring() {

  const container = document.getElementById("scoringTab");

  container.innerHTML = `<h2>📊 Système de pointage</h2>`;

  Object.entries(SCORING.submissions).forEach(([sub, config]) => {

    let html = `<h3>Soumission ${sub}</h3>`;
    html += `<ul>`;

    Object.entries(config.rounds).forEach(([round, pts]) => {
      html += `<li>Ronde ${round} : ${pts.team} pts (équipe) + ${pts.games} pts (# matchs)</li>`;
    });

    html += `<li>Conn Smythe : ${config.connSmythe} pts</li>`;
    html += `</ul>`;

    container.innerHTML += html;

  });
}
