import { getAdminLogs } from "../../services/firestoreService.js";
export function renderAdminHistoryCard() {

  return `
    <div class="card">

      <h3>
        📜 Historique admin
      </h3>

      <div id="adminHistoryContainer">

      </div>

      <br>

      <button
        class="actionBtn"
        onclick="clearAdminHistory()"
      >
        Supprimer l'historique
      </button>

    </div>
  `;
}

export async function loadAdminHistory() {

  const logs =
    await getAdminLogs();

  const container =
    document.getElementById(
      "adminHistoryContainer"
    );

  container.innerHTML = "";

  logs
    .sort(
      (a,b) =>
      b.timestamp-a.timestamp
    )
    .forEach(log => {

     container.innerHTML += `
  <div>

    ${new Date(
      log.timestamp
    ).toLocaleString("fr-CA")}

    -

    ${log.admin}

    -

    ${log.action}

  </div>
`;

      
      
    });
}
