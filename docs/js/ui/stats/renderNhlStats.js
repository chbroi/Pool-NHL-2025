import { appState } from "../../app/state.js";

export async function renderStats() {

  const container =
    document.getElementById(
      "statsTab"
    );

  const predictions =
    await getAllPredictions();

  // =====================
  // COMPTEURS
  // =====================

  const stanleyPicks = {};
  const connSmythePicks = {};

  predictions.forEach(p => {

    const cup =
      p.picks?.R4_final_team;

    if (cup) {

      stanleyPicks[cup] =
        (stanleyPicks[cup] || 0) + 1;
    }

    const conn =
      p.picks?.Conn_Smythe;

    if (conn) {

      connSmythePicks[conn] =
        (connSmythePicks[conn] || 0) + 1;
    }
  });

  const totalPredictions =
    predictions.length;

  const favoriteCup =
    Object.entries(stanleyPicks)
      .sort((a,b) => b[1]-a[1])[0];

  const favoriteConn =
    Object.entries(connSmythePicks)
      .sort((a,b) => b[1]-a[1])[0];

  const uniqueConn =
    Object.entries(connSmythePicks)
      .filter(([_,count]) => count === 1)
      .slice(0,5);

  const uniqueTeams =
    Object.entries(stanleyPicks)
      .filter(([_,count]) => count === 1);

  // =====================
  // CONSENSUS
  // =====================

  let consensus = 0;

  if (favoriteCup) {

    consensus =
      (
        favoriteCup[1]
        /
        totalPredictions
      ) * 100;
  }

  let consensusText =
    "Pool très divisé";

  if (consensus >= 75)
    consensusText =
      "Consensus très fort";

  else if (consensus >= 60)
    consensusText =
      "Consensus modéré";

  // =====================
  // HTML
  // =====================

  container.innerHTML = `

    <div class="card">

      <h2>
        📈 Aperçu du pool
      </h2>

      <p>
        👥 Participants :
        <strong>
          ${totalPredictions}
        </strong>
      </p>

      <p>
        🏆 Équipes différentes choisies :
        <strong>
          ${Object.keys(stanleyPicks).length}
        </strong>
      </p>

      <p>
        🏅 Choix Conn Smythe différents :
        <strong>
          ${Object.keys(connSmythePicks).length}
        </strong>
      </p>

    </div>

    <div class="card">

      <h2>
        🏆 Favoris pour la Coupe Stanley
      </h2>

      ${Object.entries(stanleyPicks)

        .sort((a,b) => b[1]-a[1])

        .map(([team,count]) => `

          <p>

            <strong>
              ${team}
            </strong>

            •

            ${(
              count /
              totalPredictions *
              100
            ).toFixed(1)}%

          </p>

        `).join("")}

    </div>

    <div class="card">

      <h2>
        🏅 Favoris Conn Smythe
      </h2>

      ${Object.entries(connSmythePicks)

        .sort((a,b) => b[1]-a[1])

        .slice(0,10)

        .map(([player,count]) => `

          <p>

            <strong>
              ${player}
            </strong>

            •

            ${(
              count /
              totalPredictions *
              100
            ).toFixed(1)}%

          </p>

        `).join("")}

    </div>

    <div class="card">

      <h2>
        🔮 Pronostic officiel du pool
      </h2>

      <p>

        🏆 Coupe Stanley :

        <strong>

          ${
            favoriteCup
              ? favoriteCup[0]
              : "-"
          }

        </strong>

      </p>

      <p>

        🏅 Conn Smythe :

        <strong>

          ${
            favoriteConn
              ? favoriteConn[0]
              : "-"
          }

        </strong>

      </p>

    </div>

    <div class="card">

      <h2>
        ⚡ Choix uniques
      </h2>

      <h4>
        Conn Smythe
      </h4>

      ${
        uniqueConn.length

        ? uniqueConn
            .map(([player]) => `

              <p>
                ${player}
              </p>

            `)
            .join("")

        : "<p>Aucun choix unique.</p>"
      }

      <h4>
        Coupe Stanley
      </h4>

      ${
        uniqueTeams.length

        ? uniqueTeams
            .map(([team]) => `

              <p>
                ${team}
              </p>

            `)
            .join("")

        : "<p>Aucun choix unique.</p>"
      }

    </div>

    <div class="card">

      <h2>
        🤝 Consensus du pool
      </h2>

      <p>

        Consensus :

        <strong>

          ${consensus.toFixed(1)}%

        </strong>

      </p>

      <p>

        ${consensusText}

      </p>

    </div>

  `;
}

export async function renderAdmin() {
}



function formatDateTimeLocal(timestamp) {
}

export function getPlayerStats(
  players,
  metric,
  seasonType
) {

  let result =
    [...players];

  switch(metric){

    case "points":

      result.sort(
        (a,b) =>
    
          seasonType === "playoffs"
    
            ? b.playoffPoints -
              a.playoffPoints
    
            : b.seasonPoints -
              a.seasonPoints
      );

  break;

    case "goals":

      result.sort(
        (a,b) =>
          seasonType === "playoffs"
    
            ? b.playoffGoals -
              a.playoffGoals
    
            : b.seasonGoals -
              a.seasonGoals
      );

      break;

    case "assists":

      result.sort(
        (a,b) =>
          seasonType === "playoffs"
    
            ? b.playoffAssists -
              a.playoffAssists
    
            : b.seasonAssists -
              a.seasonAssists
      );

      break;

    case "goalies":

      result = result
        .filter(
          p => p.position === "G"
        )
        .sort(
          (a,b) =>
           seasonType === "playoffs"
    
            ? b.playoffGaa -
              a.playoffGaa
    
            : b.seasonGaa -
              a.seasonGaa
        );

      break;
  }

  return result;
}

export function renderNhlStats() {

  const tab =
    document.getElementById(
      "statsNHLTab"
    );

  tab.innerHTML = `

    <div class="section">

      <h2>
        Statistiques NHL
      </h2>

      <select id="nhlSeasonType">

        <option value="season">
          Saison régulière
        </option>

        <option value="playoffs">
          Séries
        </option>

      </select>

      <select id="nhlMetricSelect">

        <option value="points">
          Points
        </option>

        <option value="goals">
          Buts
        </option>

        <option value="assists">
          Passes
        </option>

        <option value="goalies">
          Gardiens
        </option>

      </select>

      <select
        id="nhlGoalieSort"
        style="display:none;">

        <option value="savePct">
          % arrêts
        </option>

        <option value="wins">
          Victoires
        </option>

        <option value="gaa">
          MBA
        </option>

      </select>

      <br><br>

      <div id="nhlStatsContent"></div>

    </div>

  `;

  attachNhlStatsListeners();

  renderNhlStatsTable();

}

export function attachNhlStatsListeners() {

  document
    .getElementById("nhlMetricSelect")
    .addEventListener(
      "change",
      () => {

        const metric =
          document.getElementById(
            "nhlMetricSelect"
          ).value;

        const goalieFilter =
          document.getElementById(
            "nhlGoalieSort"
          );

        goalieFilter.style.display =
          metric === "goalies"
            ? "inline-block"
            : "none";

        renderNhlStatsTable();

      }
    );

  document
    .getElementById("nhlSeasonType")
    .addEventListener(
      "change",
      renderNhlStatsTable
    );

  document
    .getElementById("nhlGoalieSort")
    .addEventListener(
      "change",
      renderNhlStatsTable
    );

}

export function renderNhlStatsTable() {

  const seasonType =
    document.getElementById(
      "nhlSeasonType"
    ).value;

  const metric =
    document.getElementById(
      "nhlMetricSelect"
    ).value;

  const goalieSort =
    document.getElementById(
      "nhlGoalieSort"
    ).value;

  const isPlayoffs =
    seasonType === "playoffs";

  let players =
    [...appState.players];

  // =====================
  // TRI JOUEURS
  // =====================

  if (metric === "points") {

    players.sort(
      (a,b) =>
        (isPlayoffs
          ? b.playoffPoints
          : b.seasonPoints)
        -
        (isPlayoffs
          ? a.playoffPoints
          : a.seasonPoints)
    );

  }

  else if (metric === "goals") {

    players.sort(
      (a,b) =>
        (isPlayoffs
          ? b.playoffGoals
          : b.seasonGoals)
        -
        (isPlayoffs
          ? a.playoffGoals
          : a.seasonGoals)
    );

  }

  else if (metric === "assists") {

    players.sort(
      (a,b) =>
        (isPlayoffs
          ? b.playoffAssists
          : b.seasonAssists)
        -
        (isPlayoffs
          ? a.playoffAssists
          : a.seasonAssists)
    );

  }

  // =====================
  // TRI GARDIENS
  // =====================

  else if (metric === "goalies") {

    players =
      players.filter(
        p => p.position === "G"
      );

    switch(goalieSort) {

      case "wins":

        players.sort(
          (a,b) =>
            (isPlayoffs
              ? b.playoffWins
              : b.wins)
            -
            (isPlayoffs
              ? a.playoffWins
              : a.wins)
        );

        break;

      case "gaa":

        players.sort(
          (a,b) =>
            (isPlayoffs
              ? a.playoffGaa
              : a.gaa)
            -
            (isPlayoffs
              ? b.playoffGaa
              : b.gaa)
        );

        break;

      default: // savePct

        players.sort(
          (a,b) =>
            (isPlayoffs
              ? b.playoffSavePct
              : b.savePct)
            -
            (isPlayoffs
              ? a.playoffSavePct
              : a.savePct)
        );

    }

  }

  players =
    players.slice(0,50);

  const container =
    document.getElementById(
      "nhlStatsContent"
    );

  let rows = "";

  // =====================
  // GARDIENS
  // =====================

  if (metric === "goalies") {

    players.forEach(
      (player,index) => {

        rows += `
          <tr>

            <td>${index + 1}</td>

            <td>${player.name}</td>

            <td>${player.team}</td>

            <td>
              ${
                isPlayoffs
                  ? (player.playoffGames ?? 0)
                  : (player.seasonGames ?? 0)
              }
            </td>

            <td>
              ${
                isPlayoffs
                  ? (player.playoffWins ?? 0)
                  : (player.wins ?? 0)
              }
            </td>

            <td>
              ${
                isPlayoffs
                  ? (player.playoffLosses ?? 0)
                  : (player.losses ?? 0)
              }
            </td>

            <td>
              ${
                (
                  isPlayoffs
                    ? (player.playoffGaa ?? 0)
                    : (player.gaa ?? 0)
                ).toFixed(2)
              }
            </td>

            <td>
              ${
                (
                  isPlayoffs
                    ? (player.playoffSavePct ?? 0)
                    : (player.savePct ?? 0)
                ).toFixed(3)
              }
            </td>

          </tr>
        `;
      }
    );

    container.innerHTML = `

      <table class="resultsTable">

        <thead>

          <tr>

            <th>#</th>

            <th>Gardien</th>

            <th>Équipe</th>

            <th>PJ</th>

            <th>V</th>

            <th>D</th>

            <th>MBA</th>

            <th>%</th>

          </tr>

        </thead>

        <tbody>

          ${rows}

        </tbody>

      </table>

    `;

    return;
  }

  // =====================
  // JOUEURS
  // =====================

  players.forEach(
    (player,index) => {

      rows += `
        <tr>

          <td>${index + 1}</td>

          <td>${player.name}</td>

          <td>${player.position}</td>

          <td>${player.team}</td>

          <td>
            ${
              isPlayoffs
                ? (player.playoffGames ?? 0)
                : (player.seasonGames ?? 0)
            }
          </td>

          <td>
            ${
              isPlayoffs
                ? (player.playoffGoals ?? 0)
                : (player.seasonGoals ?? 0)
            }
          </td>

          <td>
            ${
              isPlayoffs
                ? (player.playoffAssists ?? 0)
                : (player.seasonAssists ?? 0)
            }
          </td>

          <td>
            ${
              isPlayoffs
                ? (player.playoffPoints ?? 0)
                : (player.seasonPoints ?? 0)
            }
          </td>

        </tr>
      `;
    }
  );

  container.innerHTML = `

    <table class="resultsTable">

      <thead>

        <tr>

          <th>#</th>

          <th>Joueur</th>

          <th>Pos</th>

          <th>Équipe</th>
          
          <th>PJ</th>

          <th>B</th>

          <th>A</th>

          <th>PTS</th>

        </tr>

      </thead>

      <tbody>

        ${rows}

      </tbody>

    </table>

  `;
}
