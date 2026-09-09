
import { getAllPredictions } from "../../services/firestoreService.js";

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
