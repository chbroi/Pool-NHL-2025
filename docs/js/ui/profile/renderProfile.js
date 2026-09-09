import { appState } from "../../app/state.js";
import { getAllPredictions } from "../../services/firestoreService.js";
import { computeLeaderboard } from "../../logic/scoring.js";


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
