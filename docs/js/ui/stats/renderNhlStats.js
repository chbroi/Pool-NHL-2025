import { appState } from "../../app/state.js";


export function getPlayerStats( players, metric, seasonType) {

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
