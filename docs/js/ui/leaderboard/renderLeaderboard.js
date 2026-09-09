
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

