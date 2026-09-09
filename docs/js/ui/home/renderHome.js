import { appState } from "../../app/state.js";
import { getAllPredictions, getAllParticipants} from "../../services/firestoreService.js";
import { computeLeaderboard} from "../../logic/scoring.js";
import { POOL_CONFIG } from "../../constants.js";

export async function renderHome() {
  
  const predictions = await getAllPredictions();
  
  const participants = new Set(
    predictions.map(p => p.userId)
    );
  const allParticipants =  await getAllParticipants();  
  const participantCount = participants.size;
  const prizePool = participantCount * POOL_CONFIG.entryFee;
  const paidCount =  allParticipants.filter(p => p.paid).length;
  const actualPrize =  paidCount *POOL_CONFIG.entryFee
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
      💰 Cagnotte actuelle: <strong>${prizePool}$</strong>
      💰 Cagnotte attendu : <strong>${actualPrize}$</strong>
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
      
   const top3 =
    leaderboard.slice(0,3);
  
  container.innerHTML += `
  
    <div class="card">
  
      <h3>
        🏆 Podium actuel
      </h3>
  
      ${top3[0] ? `
        <p>
          🥇 <strong>${top3[0].name}</strong>
          • ${top3[0].score} pts
        </p>
      ` : ""}
  
      ${top3[1] ? `
        <p>
          🥈 <strong>${top3[1].name}</strong>
          • ${top3[1].score} pts
        </p>
      ` : ""}
  
      ${top3[2] ? `
        <p>
          🥉 <strong>${top3[2].name}</strong>
          • ${top3[2].score} pts
        </p>
      ` : ""}
  
      <button
        class="actionBtn secondary"
        onclick="showTab('leaderboard')">
  
        Voir le classement complet
  
      </button>
  
    </div>
  
  `;
    if (appState.user) {
  
    const userIndex =
      leaderboard.findIndex(
        p => p.name ===
        appState.user.displayName
      );
  
    const user =
      leaderboard[userIndex];
  
    if (user) {
  
      container.innerHTML += `
  
        <div class="card">
  
          <h3>
            👤 Votre progression
          </h3>
  
          <p>
  
            Rang actuel :
  
            <strong>
  
              #${userIndex + 1}
  
            </strong>
  
            sur
  
            <strong>
  
              ${leaderboard.length}
  
            </strong>
  
            participants.
  
          </p>
  
          <p>
  
            Points :
  
            <strong>
  
              ${user.score}
  
            </strong>
  
          </p>
  
        </div>
  
      `;
  
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
      
      <div class="homeAction" onclick="showTab('stats')">
        <strong>Stats Pool</strong>
        <span>Consulter les statistiques du pool </span>
      </div>
  
      <div class="homeAction" onclick="showTab('stats')">
        <strong>Stats NHL</strong>
        <span>Consulter les statistiques de la NHL </span>
      </div>
      
    
      <div class="homeAction" onclick="showTab('rules')">
        <strong>Règlements</strong>
        <span>Lire les règles officielles du pool</span>
      </div>
      
      <div class="homeAction" onclick="showTab('profile')">
        <strong>Profil</strong>
        <span>Consulter votre profil de pooler</span>
      </div>
    </div>
  
    </div>
  `
}
