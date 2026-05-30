import { appState } from "../app/state.js";
import { getAllPredictions } from "../services/firestoreService.js";
import { appState } from "../app/state.js";
import { SCORING } from "../constants.js";
import { computeLeaderboard } from "../main.js"; // temporaire
import { isResultAvailable } from "../main.js"; // temporaire


export async function loadPredictionsDetails() {

  const round1Map = await getRound1MatchMap();
  const predictions = await getAllPredictions();
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

  // Tous les users
  const allUsersMap = {};

  Object.values(submissions).forEach(roundUsers => {
    Object.entries(roundUsers).forEach(([id, user]) => {
      allUsersMap[id] = user.name;
    });
  });

  const allUsers = Object.entries(allUsersMap).map(([id, name]) => ({
    id,
    name
  }));

  const rounds = {
    1: MATCH_ORDER.filter(k => k.startsWith("R1")),
    2: MATCH_ORDER.filter(k => k.startsWith("R2")),
    3: MATCH_ORDER.filter(k => k.startsWith("R3")),
    4: MATCH_ORDER.filter(k => k.startsWith("R4"))
  };

  const globalScores = {};

  Object.keys(submissions).sort((a,b)=>a-b).forEach(round => {

    let html = `<h3>Soumission ${round}</h3>`;
    html += `<div style="overflow-x:auto;">`;
    html += `<table class="resultsTable">`;

    // HEADER
    html += `<tr>
      <th>Match</th>
      <th>Résultat</th>
    `;

    allUsers.forEach(u => {
      html += `<th>${u.name}</th>`;
    });

    html += `</tr>`;

    const submissionScores = {};

    // Rounds
    Object.keys(rounds).forEach(r => {

      if (Number(r) < Number(round)) return;
      html += `<tr class="roundHeader">
        <td colspan="${allUsers.length + 2}">Ronde ${r}</td>
      </tr>`;

      rounds[r].forEach(matchKey => {

        const teamKey = matchKey + "_team";
        const gamesKey = matchKey + "_games";

        const resultTeam = appState.results[teamKey];
        const resultGames = appState.results[gamesKey];
        const roundNum = getRoundFromKey(matchKey);

        let displayName = round1Map[matchKey];

        if (!displayName) {
          const t1 = appState.results[getParentMatch(matchKey, 1)];
          const t2 = appState.results[getParentMatch(matchKey, 2)];
          displayName = (t1 && t2) ? `${t1} vs ${t2}` : matchKey;
        }

        html += `<tr><td>${displayName}</td>`;

        let resultDisplay = resultTeam || "-";
        if (isResultAvailable(gamesKey)) {
          resultDisplay += ` (${resultGames})`;
        }

        html += `<td>${resultDisplay}</td>`;

        allUsers.forEach(user => {

          const userData = submissions[round]?.[user.id];
          const pickTeam = userData?.picks?.[teamKey];
          const pickGames = userData?.picks?.[gamesKey];

          let cell = pickTeam ? `${pickTeam} (${pickGames})` : "-";

          let points = 0;
          const mult = SCORING.roundMultiplier[roundNum];

          if (pickTeam && isResultAvailable(teamKey)) {

            if (pickTeam === resultTeam) {

              points += SCORING.teamCorrect * mult;

              if (
                isResultAvailable(gamesKey) &&
                Number(pickGames) === Number(resultGames)
              ) {
                points += SCORING.gamesCorrect * mult;
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

          html += `<td>${cell}</td>`;
        });

        html += `</tr>`;
      });
    });

    // ✅ Conn Smythe
    html += `<tr>
      <td>🏆 Conn Smythe</td>
      <td>${appState.results["Conn_Smythe"] || "-"}</td>
    `;

    allUsers.forEach(user => {

      const userData = submissions[round]?.[user.id];
      const pick = userData?.picks?.["Conn_Smythe"];

      let cell = pick || "-";
      let points = 0;

      if (pick && appState.results["Conn_Smythe"]) {

        if (pick === appState.results["Conn_Smythe"]) {
          cell += ` ✅✅ (+${SCORING.connSmythe})`;
          points += SCORING.connSmythe;
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

    allUsers.forEach(user => {
      html += `<td><strong>${submissionScores[user.id] || 0}</strong></td>`;
    });

    html += `</tr>`;

    // ✅ Total global
    html += `<tr class="totalGlobalRow">
      <td colspan="2"><strong>Total Global</strong></td>`;

    allUsers.forEach(user => {
      html += `<td><strong>${globalScores[user.id] || 0}</strong></td>`;
    });

    html += `</tr>`;

    html += `</table></div><br>`;
    container.innerHTML += html;
  });
}


export async function renderHome() {

  const leaderboard = await computeLeaderboard();

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
}

async function renderFullLeaderboard() {

  const data = await computeLeaderboard();

  const container = document.getElementById("leaderboardTab");
  container.innerHTML = "<h2>Classement complet</h2>";

  data.forEach((p, i) => {
    const row = document.createElement("div");
    row.innerHTML = `#${i+1} - ${p.name} (${p.score} pts)`;
    container.appendChild(row);
  });
}
