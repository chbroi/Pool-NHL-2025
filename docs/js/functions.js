//Ensemble des fonctions utiliser pour le pool.

export function confirmEngagement() {
      alert("Merci de vous être engagé. Vous pouvez maintenant soumettre vos prédictions.");
      document.getElementById('engagementContainer').style.display = 'none';
      document.getElementById('predictionForm').style.display = 'block';
      document.getElementById('round1').style.display = "block";
}

// Fonction pour obtenir les matchs à afficher en fonction de la ronde
// Fonction générique pour afficher les matchs selon les données précédentes
export function showRoundFromData(roundNumber, data) {
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
export function getMatchupsForRound(roundNumber) {
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
export function updateConnSmytheList(team1, team2) {
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
export function updateConnSmytheField() {
    const team1 = document.getElementById('R3_EST_1_team').value;
    const team2 = document.getElementById('R3_WEST_1_team').value;
    if (team1 && team2) {
        updateConnSmytheList(team1, team2);
    }
}

    
export function createRound2Matchups() {
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

export function createRound3Matchups() {
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

export function createRound4Matchup() {
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

export function fetchParticipants() {
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




export async function submitPredictions() {

  if (!currentUser) {
    alert("Tu dois être connecté.");
    return;
  }

  // ✅ CHECK DOUBLE SUBMISSION
  const alreadyDone = await alreadySubmitted();

  if (alreadyDone) {
    alert(" Tu as déjà soumis pour cette ronde.");
    return;
  }

  if (!confirm("Confirmer la soumission?")) return;

  const form = document.getElementById("predictionForm");
  const formData = new FormData(form);

  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  try {
    await addDoc(collection(db, "predictions"), {
      userId: currentUser.uid,
      userName: currentUser.displayName,
      round: currentSubmission,
      picks: data,
      timestamp: Date.now()
    });

    alert(" Prédictions soumises !");
    document.getElementById("submitBtn").disabled = true;

  } catch (err) {
    console.error(err);
    alert("Erreur: " + err.message);
  }
}



        
export function checkIfReadyToSubmit() {
  const requiredFields = ["Conn_Smythe"];

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

let participants = [];

export async function loadParticipants() {

  const snapshot = await getDocs(collection(db, "predictions"));

  const list = document.getElementById("participantsList");
  list.innerHTML = "";

  snapshot.forEach(doc => {
    const p = doc.data();

    const li = document.createElement("li");
    li.textContent = `${p.userName} - Ronde ${p.round}`;
    list.appendChild(li);
  });
}


import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function checkEligibility(db, currentUser, currentSubmission) {

  if (!currentUser) return false;

  // ✅ Ronde 1 → toujours OK
  if (currentSubmission === 1) {
    return true;
  }

  // ✅ Vérifier la ronde précédente
  const previousRound = currentSubmission - 1;

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", currentUser.uid),
    where("round", "==", previousRound)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}


export function hasPreviousSubmission(nom, prenom, soumission) {
  // Vérifie qu'il y a une soumission précédente inférieure à 'soumission' pour ce nom/prenom
  return participants.some(p => 
    p.Nom.toLowerCase() === nom.toLowerCase().trim() &&
    p.Prenom.toLowerCase() === prenom.toLowerCase().trim() &&
    p.Soumission < soumission
  );
}

export function isNameRegistered(nom, prenom) {
  return participants.some(p => 
    p.Nom.toLowerCase() === nom.toLowerCase().trim() &&
    p.Prenom.toLowerCase() === prenom.toLowerCase().trim()
  );

export function renderParticipantsTable(participants) {
  const container = document.getElementById("participantsTable");
  if (!container) return;

  // Vide le contenu précédent
  container.innerHTML = "";

  if (!Array.isArray(participants) || participants.length === 0) {
    container.textContent = "Aucune prédiction soumise.";
    return;
  }

  // Crée un tableau HTML
  const table = document.createElement("table");
  table.border = "1";
  table.style.borderCollapse = "collapse";
  table.style.marginTop = "20px";

  // Lignes d'en-tête
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
    <th>Prénom</th>
    <th>Nom</th>
    <th>Soumission</th>
    <th>Clé</th>
    <th>Valeur</th>
  `;
  table.appendChild(headerRow);

  // Remplit le tableau
  participants.forEach(participant => {
    const { Prenom, Nom, soumissions } = participant;

    if (!soumissions || typeof soumissions !== "object") return;

    Object.entries(soumissions).forEach(([numSoumission, predictionObj]) => {
      Object.entries(predictionObj).forEach(([key, value], i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${Prenom}</td>
          <td>${Nom}</td>
          <td>${numSoumission}</td>
          <td>${key}</td>
          <td>${value}</td>
        `;
        table.appendChild(row);
      });
    });
  });

  container.appendChild(table);
}      
}
