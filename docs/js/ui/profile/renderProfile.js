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
