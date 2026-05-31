export function attachRound1Listeners() {

  round1Ids.forEach(id => {

    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('change', () => {
      funcs.createRound2Matchups(appState.submission, round1Ids);
      funcs.checkIfReadyToSubmit(appState.submission);
    });
  });
}

export function attachRound2Listeners() {

  [
    'R2_EST_1_team', 'R2_EST_2_team',
    'R2_WEST_1_team', 'R2_WEST_2_team'
  ].forEach(id => {

    const el = document.getElementById(id);
    if (!el) return;

    
    el.addEventListener('change', async () => {
    
      const data = Object.fromEntries(
        new FormData(document.getElementById('predictionForm'))
      );
      await generateRound(3);
      funcs.showRoundFromData(3, data);
      attachRound3Listeners()
      funcs.checkIfReadyToSubmit(appState.submission);
    });


  });
}

export function attachRound3Listeners() {

  [
    'R3_EST_1_team',
    'R3_WEST_1_team'
  ].forEach(id => {

    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('change', async () => {

      await generateRound(4);

      // forcer affichage
      document.getElementById('round4').style.display = 'block';

      funcs.updateConnSmytheField(playersByTeam);
      funcs.checkIfReadyToSubmit(appState.submission);

    });

  });
}


export function attachConnSmytheListeners() {

  const est = document.getElementById('R3_EST_1_team');
  const west = document.getElementById('R3_WEST_1_team');

  if (est) est.addEventListener('change', () => {
    funcs.updateConnSmytheField(playersByTeam);
    funcs.checkIfReadyToSubmit(appState.submission); 
  });

  if (west) west.addEventListener('change', () => {
    funcs.updateConnSmytheField(playersByTeam);
    funcs.checkIfReadyToSubmit(appState.submission); 
  });

  //  AJOUT CRITIQUE
  const conn = document.getElementById("Conn_Smythe");

  if (conn) {
    conn.addEventListener('change', () => {
      funcs.checkIfReadyToSubmit(appState.submission); 
    });
  }
}
