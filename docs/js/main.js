//MAIN Script pour le pool


import { auth, db, GoogleAuthProvider } from "./firebase.js";
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

let currentUser = null;

// LOGIN
document.getElementById("loginBtn").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  currentUser = result.user;
});

// AUTO LOGIN/ LOGOUT


onAuthStateChanged(auth, async (user) => {

  if (user) {
    currentUser = user;
    // reset possible ancien contenu
    document.getElementById("appContent").innerHTML = "";
    // Vérifier éligibilité
    const eligible = await checkEligibility();

    const alreadyDone = await alreadySubmitted();
    
    if (alreadyDone) {
      document.getElementById("appContent").innerHTML =
        "<h2 style='text-align:center'> Tu as déjà soumis pour cette ronde.</h2>";
    
      document.getElementById("appContent").style.display = "block";
      document.getElementById("loginContainer").style.display = "none";
    
      return;
    }

    if (!eligible) {
      document.getElementById("appContent").innerHTML =
        "<h2 style='text-align:center'> Tu n'es pas éligible pour cette ronde.</h2>";
      document.getElementById("loginContainer").style.display = "none";
      document.getElementById("appContent").style.display = "block";
      return;
    }

    // ✅ UI normale
    document.getElementById("userInfo").innerText =
      "Connecté: " + user.displayName;
    document.getElementById("appContent").style.display = "block";
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";

  } else {
    currentUser = null;
    document.getElementById("appContent").style.display = "none";
    document.getElementById("loginContainer").style.display = "block";
    document.getElementById("loginBtn").style.display = "inline-block";
    document.getElementById("logoutBtn").style.display = "none";
    document.getElementById("userInfo").innerText = "";
  }
});


document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);

  currentUser = null;

  // reset UI
  document.getElementById("appContent").style.display = "none";
  document.getElementById("loginContainer").style.display = "block";
  document.getElementById("logoutBtn").style.display = "none";
  document.getElementById("loginBtn").style.display = "inline-block";

  document.getElementById("userInfo").innerText = "";
});



import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function alreadySubmitted() {

  const q = query(
    collection(db, "predictions"),
    where("userId", "==", currentUser.uid),
    where("round", "==", currentSubmission)
  );

  const snapshot = await getDocs(q);

  return !snapshot.empty;
}


//loadParticipants()
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
