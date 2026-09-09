import { appState } from "../../app/state.js";
export function renderAdminSubmissionCard() {

  return `

    <div class="card">

      <h3>📋 État actuel</h3>

      <p>
        <strong>Soumission active :</strong>
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
        <strong>Date limite soumission 1 :</strong>

        ${
          appState.round1Deadline
            ? new Date(
                appState.round1Deadline
              ).toLocaleString()
            : "Non configurée"
        }
      </p>

    </div>

    <div class="card">

      <h3>
        ⏱ Gestion des dates limites
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
           <br><br>
          
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
          
          <br><br>
          
          <button
          class="actionBtn"
          onclick="updateDeadline()">
          
          Mettre à jour
          
          </button>
          
          </div>
    </div>

    <div class="card">

      <h3>
        🔒 Gestion des soumissions
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
        <br><br>
        
        <label>
        Modifier la soumission actuelle
        </label>
        
        
        
        <select id="adminSubmission">
        
          <option value="1">Soumission 1</option>
          <option value="2">Soumission 2</option>
          <option value="3">Soumission 3</option>
          <option value="4">Souimssion 4</option>
        
        </select>
        
         <br><br>
         
        <button
        class="actionBtn"
        onclick="updateSubmissionRound()">
        
        Mettre à jour
        
        </button>
        
        <br><br>
        <label>
        Soumission à supprimer
        </label>
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
  `;
}


export function formatDateTimeLocal(timestamp) {

  const d = new Date(timestamp);

  const pad = n => String(n).padStart(2,"0");

  return `${d.getFullYear()}-${
    pad(d.getMonth()+1)
  }-${
    pad(d.getDate())
  }T${
    pad(d.getHours())
  }:${
    pad(d.getMinutes())
  }`;

}
