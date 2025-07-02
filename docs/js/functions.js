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

function fetchParticipants() {
  const url = `https://chbroi.github.io/Pool-NHL-2025/data/participants.json?t=${Date.now()}`;
  fetch(url)
    .then(response => response.json())
    .then(json => {
      const list = document.getElementById("participantsList");
      list.innerHTML = ""; // Réinitialiser la liste

      if (json.participants && json.participants.length > 0) {
        json.participants.forEach(participant => {
          const item = document.createElement("li");
          item.textContent = `${participant.Prenom} ${participant.Nom} (Soumission ${participant.Soumission})`;
          list.appendChild(item);
        });
      } else {
        const empty = document.createElement("li");
        empty.textContent = "Aucun participant trouvé.";
        list.appendChild(empty);
      }
    })
    .catch(error => {
      console.error("Erreur lors du chargement des participants:", error);
      const list = document.getElementById("participantsList");
      list.innerHTML = "<li>Erreur de chargement des données.</li>";
    });
}

async function submitPredictions() {
  if (!confirm("Confirmer la soumission ?")) return;

  const form = document.getElementById("predictionForm");
  const data = Object.fromEntries(new FormData(form).entries());
  const payload = JSON.stringify(data);

  try {
    const resp = await fetch('https://POOL-NHL-2025.vercel.app/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prenom: data.Prenom.trim(),
        nom: data.Nom.trim(),
        soumission: currentSubmission,
        payload
      })
    });
    const j = await resp.json();
    if (j.success) alert("Soumission enregistrée !");
    else alert("Erreur: " + JSON.stringify(j.error));
  } catch (err) {
    console.error("Erreur fetch:", err);
    alert("Erreur réseau : " + err.message);
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

let participants = [];

function loadParticipants() {
  fetch('data/participants.json')
    .then(response => {
      if (!response.ok) throw new Error("Erreur chargement participants.json");
      return response.json();
    })
    .then(data => {
      console.log(data.participants); // tu peux ici afficher dynamiquement
      // Par exemple :
      renderParticipantsTable(data.participants);
    })
    .catch(error => {
      console.error("Erreur chargement des participants :", error);
    });
}
async function checkParticipantEligibility(nom, prenom, soumission) {
  try {
    const resp = await fetch("https://pool-nhl-2025.vercel.app/api/participants");
    const data = await resp.json();

    if (!data || !Array.isArray(data.participants)) {
      console.error("Structure inattendue du fichier participants.json :", data);
      return false;
    }

    const participant = data.participants.find(
      p => p.Nom === nom && p.Prenom === prenom
    );

    if (!participant) {
      // Si c’est la première soumission, on permet à tout le monde
      return soumission === 1;
    }

    // Si le participant existe, il doit avoir soumis la soumission précédente
    const previousSubmission = (soumission - 1).toString();
    return participant.soumissions && participant.soumissions[previousSubmission];
  } catch (e) {
    console.error("Erreur lors de la vérification du participant :", e);
    return false;
  }
}

function hasPreviousSubmission(nom, prenom, soumission) {
  // Vérifie qu'il y a une soumission précédente inférieure à 'soumission' pour ce nom/prenom
  return participants.some(p => 
    p.Nom.toLowerCase() === nom.toLowerCase().trim() &&
    p.Prenom.toLowerCase() === prenom.toLowerCase().trim() &&
    p.Soumission < soumission
  );
}

function isNameRegistered(nom, prenom) {
  return participants.some(p => 
    p.Nom.toLowerCase() === nom.toLowerCase().trim() &&
    p.Prenom.toLowerCase() === prenom.toLowerCase().trim()
  );
}
