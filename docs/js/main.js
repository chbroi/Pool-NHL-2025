//MAIN Script pour le pool    
  // Affichage spécial si la soumission est 1
  if (currentSubmission === 1) {
    // Affiche les règlements au chargement
    window.addEventListener('DOMContentLoaded', () => {
      document.getElementById('rulesContainer').style.display = 'block';
    });

    // Lorsqu'on accepte les règles
    document.getElementById('acceptRulesButton').addEventListener('click', () => {
      document.getElementById('rulesContainer').style.display = 'none';
      document.getElementById('engagementContainer').style.display = 'block';
    });

    // Lorsqu'on confirme l'engagement
    confirmEngagement()
}
  // Affichage des rondes selon les soumissions
window.addEventListener("DOMContentLoaded", () => {
  if (currentSubmission >= 2) {
    document.getElementById('predictionForm').style.display = "block";
    document.getElementById('round1').style.display = "none";
    document.getElementById('round2').style.display = "block";
    showRoundFromData(2, previousData); // Affiche les choix de la ronde 2
  }
  if (currentSubmission >= 3) {
    document.getElementById('round2').style.display = "none";
    document.getElementById('round3').style.display = "block";
    showRoundFromData(3, previousData); // Affiche les choix de la ronde 3
  }
  if (currentSubmission >= 4) {
    document.getElementById('round3').style.display = "none";
    document.getElementById('round4').style.display = "block";
    showRoundFromData(4, previousData); // Affiche les choix de la ronde 4
    updateConnSmytheList(previousData.R3_EST_1_team,previousData.R3_WEST_1_team);
  }
}); 
    
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#predictionForm select, #predictionForm input").forEach(el => {
    el.addEventListener("change", checkIfReadyToSubmit);
  });
});





/*Décommenter lorsque la première soumission est terminée
window.addEventListener('DOMContentLoaded', () => {
  // Affiche uniquement le message de fin
  document.getElementById('rulesContainer').style.display = 'none';
  document.getElementById('engagementContainer').style.display = 'none';
  document.getElementById('predictionForm').style.display = 'none';

  const lateMessage = document.createElement('div');
  lateMessage.style.padding = '1rem';
  lateMessage.style.fontSize = '1.2rem';
  lateMessage.style.textAlign = 'center';
  lateMessage.style.fontWeight = 'bold';
  lateMessage.innerText = "Il est désormais trop tard pour la première prédiction. Veuillez revenir sur cette page lors de la prochaine soumission avant le début de la  deuxième ronde! :)";

  document.body.appendChild(lateMessage);
});
//Décommenter lorsque la première soumission est terminée*/

document.getElementById('R3_EST_1_team').addEventListener('change', updateConnSmytheField);
document.getElementById('R3_WEST_1_team').addEventListener('change', updateConnSmytheField);
round1Ids.forEach(id => {
  document.getElementById(id).addEventListener('change', createRound2Matchups);
});

[
  'R2_EST_1_team', 'R2_EST_2_team', 'R2_WEST_1_team', 'R2_WEST_2_team'
].forEach(id => {
  document.getElementById(id).addEventListener('change', createRound3Matchups);
});

[
  'R3_EST_1_team', 'R3_WEST_1_team'
].forEach(id => {
  document.getElementById(id).addEventListener('change', createRound4Matchup);
});
  
window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("predictionForm");

  if (form) {
    form.querySelectorAll("input, select").forEach(el => {
      el.addEventListener("input", checkIfReadyToSubmit);
      el.addEventListener("change", checkIfReadyToSubmit);
    });

    checkIfReadyToSubmit(); // Appel initial
  }
});
