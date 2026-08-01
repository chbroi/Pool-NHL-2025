import { appState } from "../app/state.js";
import { getAllPredictions } from "../services/firestoreService.js";
import { SCORING, MATCH_ORDER, POOL_CONFIG } from "../constants.js";
import { computeLeaderboard, getRoundFromKey} from "../logic/scoring.js";
import { isResultAvailable, getParentMatch} from "../utils/helpers.js";
import { getRound1Matchups } from "../services/matchService.js";



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
  const leaderboard = await computeLeaderboard(predictions, appState.results);
  
  
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

        // ✅ RÉSULTAT (gagnant seulement, jamais de "vs")
        let resultTeam = appState.results[teamKey];
        let resultDisplay = resultTeam ? resultTeam : "-";
        
        const resultGames = appState.results[gamesKey];
        
        if (resultTeam && isResultAvailable(gamesKey)) {
          resultDisplay += ` (${resultGames})`;
        }
        
        // ✅ MATCH NAME (affrontement seulement ici)
        let displayName = "";
        
        // ✅ RONDE 1 → matchup réel
        if (matchKey.startsWith("R1")) {
          const m = round1Map[matchKey];
        
          if (m && m !== "") {
            displayName = m;
          } else {
            displayName = matchKey;
          }
        }
        
        // ✅ RONDE 2+
        else {
        
          const p1 = getParentMatch(matchKey, 1);
          const p2 = getParentMatch(matchKey, 2);
        
          const t1 = p1 ? appState.results[p1] : null;
          const t2 = p2 ? appState.results[p2] : null;
        
          if (t1 && t2) {
            displayName = `${t1} vs ${t2}`; // ✅ ICI SEULEMENT
          } else {
            // ✅ fallback selon ta logique
            if (matchKey.startsWith("R2")) {
              displayName = matchKey.includes("EST")
                ? "Gagnant Est X vs Gagnant Est Y"
                : "Gagnant Ouest X vs Gagnant Ouest Y";
            }
            else if (matchKey.startsWith("R3")) {
              displayName = matchKey.includes("EST")
                ? "Finale Est"
                : "Finale Ouest";
            }
            else if (matchKey.startsWith("R4")) {
              displayName = "Finale Coupe Stanley";
            }
            else {
              displayName = "Match à déterminer";
            }
          }
        }

      

        html += `<tr><td>${displayName}</td>`;

        html += `<td>${resultDisplay}</td>`;

        orderedUsers.forEach(user => {
          const userData = submissions[round]?.[user.id];
          const pickTeam = userData?.picks?.[teamKey];
          const pickGames = userData?.picks?.[gamesKey];

          let cell = pickTeam ? `${pickTeam} (${pickGames})` : "-";

          let points = 0;
          
          const submission = round;
          const roundNum = getRoundFromKey(teamKey);
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
          cell += ` ✅✅ (+${submissionConfig.connSmythe})`;
          points += submissionConfig.connSmythe;
        } else {
          cell += " ❌";
        }
      }

      submissionScores[user.id] = (submissionScores[user.id] || 0) + points;
      globalScores[user.id] = (globalScores[user.id] || 0) + points;

      
      const isMe = appState.user && user.id === appState.user.uid;
      
      html += `
        <td class="${isMe ? 'myColumnCell' : ''}">
          ${cell}
        </td>
      `;

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

const participants = new Set(
  predictions.map(p => p.userId)
  );
const participantCount = participants.size;
const prizePool = participantCount * POOL_CONFIG.entryFee;
const firstPlace = (prizePool * POOL_CONFIG.payout.first).toFixed(2);
const secondPlace =  (prizePool * POOL_CONFIG.payout.second).toFixed(2);
const thirdPlace = (prizePool * POOL_CONFIG.payout.third).toFixed(2);

const leaderboard = await computeLeaderboard(predictions,
  appState.results);


  const container = document.getElementById("homeTab");
  container.innerHTML = "";
  container.innerHTML += `
<div class="card">

  <h3>📈 Statistiques du pool</h3>

  <p>
    👥 Participants : <strong>${participantCount}</strong>
  </p>

  <p>
    💰 Cagnotte : <strong>${prizePool}$</strong>
    <p>🥇 1re place : <strong>${firstPlace}$</strong></p>
    <p>🥈 2e place : <strong>${secondPlace}$</strong></p>
    <p>🥉 3e place : <strong>${thirdPlace}$</strong></p>
  </p>

</div>
`;

  
  if (appState.user) {

  if (!appState.acceptedRules) {

  container.innerHTML += `

    <div class="card">

      <h3>
        ⚠️ Participation non confirmée
      </h3>

      <p>
        Pour participer au pool, vous devez accepter
        les conditions de participation.
      </p>

      <button
        class="actionBtn"
        onclick="showRulesModal()">

        🏒 Participer au pool

      </button>

      <button
        class="actionBtn secondary"
        onclick="showTab('rules')">

        📖 Consulter les règlements

      </button>

    </div>

  `;
}
else {

  container.innerHTML += `

    <div class="card">

      <h3>
        ✅ Participation confirmée
      </h3>

      <p>
        Bienvenue
        ${appState.user.displayName}.
      </p>

      <p>
        Votre engagement de participation
        a été enregistré.
      </p>

      <p>

        <strong>
          💰 Paiement :
        </strong>

        ${
          appState.paid
            ? "✅ Reçu"
            : "❌ Non reçu"
        }

      </p>

      ${
        !appState.paid
        ? `
          <div class="warningBox">

            <strong>
              ⚠️ Paiement requis
            </strong>

            <br><br>

            Votre virement Interac de
            ${POOL_CONFIG.entryFee}$ n'a pas encore été reçu.

            <br><br>

            À envoyer à :

            <br>

            charles.brosseau@hotmail.com

          </div>
        `
        : ""
      }

    </div>

  `;
}
}   
    
 container.innerHTML += '<h2>🏆 Top 10</h2>';
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

  if (predictions.length === 0) {
  
    container.innerHTML = `
      <div class="card">
        <h3>🏆 Classement</h3>
        <p>Aucun participant pour le moment.</p>
      </div>
    `;
  
    return;
  }
    
  const data = await computeLeaderboard(predictions, appState.results);
  container.innerHTML = `
  <div class="card">
    <h2>🏆 Classement complet</h2>
    <table class="resultsTable leaderboardTable">
      <tr>
        <th>Position</th>
        <th>Participant</th>
        <th>Points</th>
      </tr>
      ${data.map((p, i) => `
        <tr>
          <td>
            ${
              i === 0 ? "🥇" :
              i === 1 ? "🥈" :
              i === 2 ? "🥉" :
              "#" + (i + 1)
            }
          </td>
          <td>${p.name}</td>
          <td>
            <strong>${p.score}</strong>
          </td>
        </tr>
      `).join("")}
    </table>
  </div>
`;
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
 
    if (round1Matchups.EST) {
      round1Matchups.EST.forEach(m => {
        round1Map[m.id] = `${m.team1} vs ${m.team2}`;
      });
    }
    
    if (round1Matchups.WEST) {
      round1Matchups.WEST.forEach(m => {
        round1Map[m.id] = `${m.team1} vs ${m.team2}`;
      });
    }

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
  container.style.display = "block";
}

export function renderScoring() {

  const container = document.getElementById("scoringTab");

  container.innerHTML = `<h2>📊 Système de pointage</h2>`;

  Object.entries(SCORING.submissions).forEach(([sub, config]) => {

    let html = `<div class="card"> <h3>Soumission ${sub}</h3>`;
    html += `<ul>`;

    Object.entries(config.rounds).forEach(([round, pts]) => {
      html += `<li>Ronde ${round} : ${pts.team} pts (équipe) + ${pts.games} pts (# matchs)</li>`;
    });

    html += `<li>Conn Smythe : ${config.connSmythe} pts</li>`;
    html += `</ul> </div>`;

    container.innerHTML += html;

  });
}

export async function renderSubmissionStatus() {

  const container =
    document.getElementById(
      "submissionStatusCard"
    );
  

  if (!container || !appState.user) return;

  const predictions =
    await getAllPredictions();

  const mySubmissions =
    predictions.filter(
      p => p.userId === appState.user.uid
    );

  let html = `

    <h3>
      🏒 Soumission active :
      ${appState.submission} / 4
    </h3>

    <div style="
      display:flex;
      gap:10px;
      margin:15px 0;
      flex-wrap:wrap;
    ">
  `;
  

  for (let i = 1; i <= 4; i++) {

    let icon = "🔒";
    let text = `Soumission ${i}`;

    if (
      mySubmissions.some(
        p => p.round === i
      )
    ) {

      icon = "✅";

    }
    else if (
      i === appState.submission
    ) {

      icon = "⏳";

    }

    html += `
      <div class="submissionBadge">
        ${icon} ${text}
      </div>
    `;
  }

  html += `

    </div>

    <p style="opacity:.8">

      ✅ = soumise<br>
      ⏳ = à compléter<br>
      🔒 = non disponible

    </p>

    <h4>
      Historique des soumissions
    </h4>

  `;
  const deadline = new Date(config.deadline);

  const now = Date.now();
  
  const diff = config.deadline - now;
  if (diff > 0) {
  
    const days =
      Math.floor(diff / 86400000);
  
    const hours =
      Math.floor(
        (diff % 86400000) / 3600000
      );
  
    const minutes =
      Math.floor(
        (diff % 3600000) / 60000
      );
  
    html += `
      <div class="card">
  
        <h4>
          ⏱ Date limite
        </h4>
  
        <p>
        <strong>Date limite soumission 1 :</strong>
        ${appState.round1Deadline
          ? new Date(appState.round1Deadline).toLocaleString()
          : "Non configurée"}
        </p>
        
        <p>
        <strong>Date limite soumission 2 :</strong>
        ${appState.round2Deadline
          ? new Date(appState.round2Deadline).toLocaleString()
          : "Non configurée"}
        </p>
        
        <p>
        <strong>Date limite soumission 3 :</strong>
        ${appState.round3Deadline
          ? new Date(appState.round3Deadline).toLocaleString()
          : "Non configurée"}
        </p>
        
        <p>
        <strong>Date limite soumission 4 :</strong>
        ${appState.round4Deadline
          ? new Date(appState.round4Deadline).toLocaleString()
          : "Non configurée"}
        </p>
  
        <strong>
  
          ${days} jours
          ${hours} h
          ${minutes} min
  
        </strong>
  
      </div>
    `;
  }
  for (let i = 1; i <= 4; i++) {

    const submission =
      mySubmissions.find(
        p => p.round === i
      );

    html += submission
      ? `<div>✅ Soumission ${i} complétée</div>`
      : `<div>⏳ Soumission ${i} non complétée</div>`;
  }

  container.innerHTML = html;
}

export async function renderProfile() {

  const container =
    document.getElementById(
      "profileTab"
    );

  if (
    !container ||
    !appState.user
  ) return;

  const predictions =
    await getAllPredictions();

  const myPredictions =
    predictions.filter(
      p => p.userId === appState.user.uid
    );
  
  const leaderboard =
    await computeLeaderboard(
      predictions,
      appState.results
    );
  const myRank =
  leaderboard.findIndex(
    p => p.userId === appState.user.uid
  ) + 1;
  const myEntry =
    leaderboard.find(
      p => p.userId === appState.user.uid
    );
  const myScore =
    myEntry?.score ?? 0;
  
  container.innerHTML = `

    <div class="card">

      <h2>
        👤 Mon profil
      </h2>

      <p>
        <strong>Nom :</strong>
        ${appState.user.displayName}
      </p>

      <p>
        <strong>Courriel :</strong>
        ${appState.user.email}
      </p>

      <p>
        <strong>Participation :</strong>
        ${
          appState.acceptedRules
            ? "✅ Confirmée"
            : "❌ Non confirmée"
        }
      </p>
      <p>
        <strong>
          💰 Paiement :
        </strong>
      
        ${
          appState.paid
            ? "✅ Reçu"
            : "❌ Non reçu"
        }
      </p>

      <p>
        <strong>Progression :</strong>
        ${myPredictions.length} / 4 soumissions
      </p>
      <p>
        <strong>🏆 Rang actuel :</strong>
        ${
          myRank > 0
            ? `${myRank}${myRank === 1 ? "er" : "e"}`
            : "-"
        }
      </p>
      
      <p>
        <strong>📈 Points :</strong>
        ${myScore}
      </p>

      <h3>
        📋 État des soumissions
      </h3>

      <ul>

        ${[1, 2, 3, 4]
          .map(i => {

            const done =
              myPredictions.some(
                p => p.round === i
              );

            return `
              <li>
                ${
                  done
                    ? "✅"
                    : "⏳"
                }
                Soumission ${i}
              </li>
            `;

          })
          .join("")}

      </ul>

    </div>

    <div class="card">

      <h3>
        💬 Suggestions et signalement de bogues
      </h3>

      <p>
        Une idée d'amélioration ?
        Un problème rencontré ?
        Envoyez-moi un commentaire.
      </p>

      <textarea
        id="profileComment"
        rows="5"
        style="width:100%;"
        placeholder="Décrivez votre problème ou votre idée d'amélioration..."></textarea>

      <br><br>

      <button
        class="actionBtn"
        onclick="submitFeedback()">

        Envoyer

      </button>

    </div>

  `;
}

export async function renderStats() {

  const container =
    document.getElementById(
      "statsTab"
    );

  const predictions =
    await getAllPredictions();

  const picks = {};

  predictions.forEach(p => {
    const team =
      p.picks?.R4_final_team;

    if (!team) return;

    picks[team] =
      (picks[team] || 0) + 1;

  });

  const total =
    Object.values(picks)
      .reduce(
        (a,b) => a + b,
        0
      );

  container.innerHTML = `
    <div class="card">

      <h2>
        📊 Choix populaires
      </h2>

      ${
        Object.entries(picks)

        .sort(
          (a,b) => b[1] - a[1]
        )

        .map(([team,count]) => `

          <p>

            <strong>
              ${team}
            </strong>

            :

            ${(
              count / total * 100
            ).toFixed(1)}%

          </p>

        `).join("")
      }

    </div>
  `;
}

export async function renderAdmin() {

const container =
    document.getElementById(
      "adminTab"
    );
  container.innerHTML = `

    <div class="card">

<h3>📋 État actuel</h3>

<p>
<strong>Ronde active :</strong>
${appState.submission}
</p>

<p>
<strong>Statut :</strong>
${
  appState.submissionOpen
    ? "✅ Ouvertes"
    : "🔒 Fermées"
}
</p>

<p>
<strong>Ronde 1 :</strong>
${
  appState.round1Deadline
  ? new Date(
      appState.round1Deadline
    ).toLocaleString()
  : "Non configurée"
}
</p>

<p>
<strong>Ronde 2 :</strong>
${
  appState.round2Deadline
  ? new Date(
      appState.round2Deadline
    ).toLocaleString()
  : "Non configurée"
}
</p>

<p>
<strong>Ronde 3 :</strong>
${
  appState.round3Deadline
  ? new Date(
      appState.round3Deadline
    ).toLocaleString()
  : "Non configurée"
}
</p>

<p>
<strong>Ronde 4 :</strong>
${
  appState.round4Deadline
  ? new Date(
      appState.round4Deadline
    ).toLocaleString()
  : "Non configurée"
}
</p>

</div>
<div class="card">

<h3>
🏒 Modifier la ronde active
</h3>

<select id="adminSubmission">

  <option value="1">Ronde 1</option>
  <option value="2">Ronde 2</option>
  <option value="3">Ronde 3</option>
  <option value="4">Ronde 4</option>

</select>

<button
class="actionBtn"
onclick="updateSubmissionRound()">

Mettre à jour

</button>

</div>
<div class="card">

<h3>
⏱  Modifier les dates limites
</h3>
<label>
Soumission 1
</label>
<input
type="datetime-local"
id="round1Deadline">

<label>
Soumission 2
</label>
<input
type="datetime-local"
id="round2Deadline">

<label>
Soumission 3
</label>
<input
type="datetime-local"
id="round3Deadline">

<label>
Soumission 4
</label>
<input
type="datetime-local"
id="round4Deadline">

<button
class="actionBtn"
onclick="updateDeadline()">

Mettre à jour

</button>

</div>
<div class="card">

<h3>
🔒 Gestion des Soumissions
</h3>

<button
class="actionBtn"
onclick="toggleSubmissionOpen(true)">

Ouvrir

</button>

<button
class="actionBtn"
onclick="toggleSubmissionOpen(false)">

Fermer

</button>

 <select id="deletePredictionSelect">
    <option>
      Chargement...
    </option>
  </select>

  <br><br>

  <button
    class="actionBtn"
    onclick="deletePredictionAdmin()">

    Supprimer

  </button>

</div>

</div>
`
const predictions = await getAllPredictions();
const ddl = document.getElementById( "deletePredictionSelect");

ddl.innerHTML = "";

predictions.forEach(p => {

  ddl.innerHTML += `

    <option
      value="${p.id}">

      ${p.userName}
      - Ronde ${p.round}

    </option>

  `;

});
  
setTimeout(() => {

  if (appState.round1Deadline) {

    document.getElementById(
      "round1Deadline"
    ).value =
      new Date(
        appState.round1Deadline
      )
      .toISOString()
      .slice(0,16);

  }

  if (appState.round2Deadline) {

    document.getElementById(
      "round2Deadline"
    ).value =
      new Date(
        appState.round2Deadline
      )
      .toISOString()
      .slice(0,16);

  }

  if (appState.round3Deadline) {

    document.getElementById(
      "round3Deadline"
    ).value =
      new Date(
        appState.round3Deadline
      )
      .toISOString()
      .slice(0,16);

  }

  if (appState.round4Deadline) {

    document.getElementById(
      "round4Deadline"
    ).value =
      new Date(
        appState.round4Deadline
      )
      .toISOString()
      .slice(0,16);

  }

}, 0);
  
}

