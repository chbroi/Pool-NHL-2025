//Ensemble des fonctions utiliser pour le pool.

function confirmEngagement() {
      alert("Merci de vous être engagé. Vous pouvez maintenant soumettre vos prédictions.");
      document.getElementById('engagementContainer').style.display = 'none';
      document.getElementById('predictionForm').style.display = 'block';
      document.getElementById('round1').style.display = "block";
}

// Fonction pour obtenir les matchs à afficher en fonction de la ronde
// Fonction générique pour afficher les matchs selon les données précédentes
function showRoundFromData(roundNumber, data) {
  const matchups = getMatchupsForRound(roundNumber);
  matchups.forEach(([selectId, labelId, teamId1, teamId2]) => {
    const team1 = data[teamId1];
    const team2 = data[teamId2];
    const select = document.getElementById(selectId);
    const label = document.getElementById(labelId);

    if (team1 && team2) {
      label.textContent = `${team1} vs ${team2}`;
      select.innerHTML = `<option value="">Choisir</option>
                          <option value="${team1}">${team1}</option>
                          <option value="${team2}">${team2}</option>`;
    }
  });
}
// Fonction pour obtenir les matchups en fonction de la ronde
function getMatchupsForRound(roundNumber) {
  switch (roundNumber) {
    case 2:
      return [
        ['R2_EST_1_team', 'R2_EST_1_label', 'R1_EST_1_team', 'R1_EST_2_team'],
        ['R2_EST_2_team', 'R2_EST_2_label', 'R1_EST_3_team', 'R1_EST_4_team'],
        ['R2_WEST_1_team', 'R2_WEST_1_label', 'R1_WEST_1_team', 'R1_WEST_2_team'],
        ['R2_WEST_2_team', 'R2_WEST_2_label', 'R1_WEST_3_team', 'R1_WEST_4_team']
      ];
    case 3:
      return [
        ['R3_EST_1_team', 'R3_EST_1_label', 'R2_EST_1_team', 'R2_EST_2_team'],
        ['R3_WEST_1_team', 'R3_WEST_1_label', 'R2_WEST_1_team', 'R2_WEST_2_team']
      ];
    case 4:
      // Ici, on met à jour les équipes de la finale (ronde 4) avec les gagnants de la ronde 3
      return [
        ['R4_final_team', 'R4_final_label', 'R3_EST_1_team', 'R3_WEST_1_team']
      ];
    default:
      return [];
  }
}

// Met à jour dynamiquement la liste des joueurs disponibles pour le Conn Smythe
function updateConnSmytheList(team1, team2) {
  const list = [...(playersByTeam[team1] || []), ...(playersByTeam[team2] || [])];
  const connSmytheSelect = document.getElementById('Conn_Smythe');

  // Réinitialise les options
  connSmytheSelect.innerHTML = "";
  
  // Option par défaut
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "-- Choisissez un joueur --";
  defaultOption.value = "";
  connSmytheSelect.appendChild(defaultOption);

  // Remplit avec les joueurs autorisés
  list.forEach(player => {
    const option = document.createElement("option");
    option.value = player;
    option.textContent = player;
    connSmytheSelect.appendChild(option);
  });

// Active le champ
connSmytheSelect.disabled = list.length === 0;
}

// Sur changement d'une des deux équipes finalistes
function updateConnSmytheField() {
    const team1 = document.getElementById('R3_EST_1_team').value;
    const team2 = document.getElementById('R3_WEST_1_team').value;
    if (team1 && team2) {
        updateConnSmytheList(team1, team2);
    }
}

    
function createRound2Matchups() {
  if (currentSubmission > 1) return;
  const r2Matchups = [
    ['R1_EST_1_team', 'R1_EST_2_team', 'R2_EST_1_team', 'R2_EST_1_label'],
    ['R1_EST_3_team', 'R1_EST_4_team', 'R2_EST_2_team', 'R2_EST_2_label'],
    ['R1_WEST_1_team', 'R1_WEST_2_team', 'R2_WEST_1_team', 'R2_WEST_1_label'],
    ['R1_WEST_3_team', 'R1_WEST_4_team', 'R2_WEST_2_team', 'R2_WEST_2_label']
  ];

  let allFilled = true;
  round1Ids.forEach(id => {
    const value = document.getElementById(id).value;
    if (!value) allFilled = false;
  });

  if (!allFilled) return;

  r2Matchups.forEach(([id1, id2, selectId, labelId]) => {
    const team1 = document.getElementById(id1).value;
    const team2 = document.getElementById(id2).value;
    const select = document.getElementById(selectId);
    const label = document.getElementById(labelId);

    label.textContent = `${team1} vs ${team2}`;
    select.innerHTML = `<option value="">Choisir</option>
                        <option value="${team1}">${team1}</option>
                        <option value="${team2}">${team2}</option>`;
  });

  document.getElementById('round2').style.display = 'block';
}

function createRound3Matchups() {
  if (currentSubmission > 2) return;
  const r3Matchups = [
    ['R2_EST_1_team', 'R2_EST_2_team', 'R3_EST_1_team', 'R3_EST_1_label'],
    ['R2_WEST_1_team', 'R2_WEST_2_team', 'R3_WEST_1_team', 'R3_WEST_1_label']
  ];

  let allFilled = true;
  for (const [id1, id2] of r3Matchups) {
    if (!document.getElementById(id1).value || !document.getElementById(id2).value) {
      allFilled = false;
    }
  }

  if (!allFilled) return;

  r3Matchups.forEach(([id1, id2, selectId, labelId]) => {
    const team1 = document.getElementById(id1).value;
    const team2 = document.getElementById(id2).value;
    const select = document.getElementById(selectId);
    const label = document.getElementById(labelId);

    label.textContent = `${team1} vs ${team2}`;
    select.innerHTML = `<option value="">Choisir</option>
                        <option value="${team1}">${team1}</option>
                        <option value="${team2}">${team2}</option>`;
  });

  document.getElementById('round3').style.display = 'block';
}

function createRound4Matchup() {
  if (currentSubmission > 3) return;
  const team1 = document.getElementById('R3_EST_1_team').value;
  const team2 = document.getElementById('R3_WEST_1_team').value;

  if (!team1 || !team2) return;

  const select = document.getElementById('R4_final_team');
  const label = document.getElementById('R4_final_label');

  label.textContent = `${team1} vs ${team2}`;
  select.innerHTML = `<option value="">Choisir</option>
                      <option value="${team1}">${team1}</option>
                      <option value="${team2}">${team2}</option>`;

  document.getElementById('round4').style.display = 'block';
  updateConnSmytheField();
}

function submitPredictions() {
  // Demander la confirmation avant de soumettre
  const confirmation = window.confirm("Êtes-vous sûr de soumettre vos prédictions ?");

  if (confirmation) {
    const form = document.getElementById("predictionForm");
    const formData = new FormData(form);

    // Convertir en format x-www-form-urlencoded
    const data = new URLSearchParams();
    for (const pair of formData.entries()) {
      data.append(pair[0], pair[1]);
    }
    
    data.append("Soumission", currentSubmission);
    
    fetch("https://script.google.com/macros/s/AKfycbzYN13JA9q2VM7DD65EyA2IgpMMlWhjV385oSObthBRj7MlUAPeXcDcmRptqAymtbNr/exec", {
      method: "POST",
      mode: "no-cors", 
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: data
    })
    .then(() => {
      alert("Prédictions envoyées!");
      form.reset(); // Réinitialiser le formulaire après l'envoi
    })
    .catch(error => {
      alert("Erreur lors de l’envoi : " + error);
      console.error(error);
    });
  } else {
    console.log("Soumission annulée.");
  }
}
function checkIfReadyToSubmit() {
  const requiredFields = ["Nom", "Prenom", "Conn_Smythe"];

  if (currentSubmission <= 1) {
    requiredFields.push(
      "R1_EST_1_team", "R1_EST_1_games",
      "R1_EST_2_team", "R1_EST_2_games",
      "R1_EST_3_team", "R1_EST_3_games",
      "R1_EST_4_team", "R1_EST_4_games",
      "R1_WEST_1_team", "R1_WEST_1_games",
      "R1_WEST_2_team", "R1_WEST_2_games",
      "R1_WEST_3_team", "R1_WEST_3_games",
      "R1_WEST_4_team", "R1_WEST_4_games"
    );
  }

  if (currentSubmission <= 2) {
    requiredFields.push(
      "R2_EST_1_team", "R2_EST_1_games",
      "R2_EST_2_team", "R2_EST_2_games",
      "R2_WEST_1_team", "R2_WEST_1_games",
      "R2_WEST_2_team", "R2_WEST_2_games"
    );
  }

  if (currentSubmission <= 3) {
    requiredFields.push(
      "R3_EST_1_team", "R3_EST_1_games",
      "R3_WEST_1_team", "R3_WEST_1_games"
    );
  }

  if (currentSubmission <=  4) {
    requiredFields.push(
      "R4_final_team", "R4_final_games"
    );
  }

  const allFilled = requiredFields.every(id => {
    const el = document.getElementById(id);
    if (!el) return false;
    const value = el.value.trim();
    return value !== "";
  });

  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) {
    submitBtn.disabled = !allFilled;
  }
}

function updateNomPrenom() {
  const participant = document.getElementById("participant").value;
  const [nom, prenom] = participant.split("|");

  document.getElementById("Nom").value = nom || "";
  document.getElementById("Prenom").value = prenom || "";
}
