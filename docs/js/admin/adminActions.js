import * as funcs from "../functions.js";
import { db } from "../firebase.js";
import { appState } from "../app/state.js";
import { showTab } from "../app/tabs.js";
import { renderAdmin } from "../ui/render.js";
import {collection, doc, addDoc, updateDoc, deleteDoc,getDocs} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export async function toggleSubmissionOpen(status) {
  
  await updateDoc(
    doc(db, "config", "ui"),
    {
      submissionOpen: status
    }
  );
  await addDoc(
  collection(db, "adminLogs"),
  {
    action: status
      ? "Ouverture des soumissions"
      : "Fermeture des soumissions",

    admin:
      appState.user.displayName,

    timestamp:
      Date.now()
  }
);

  appState.submissionOpen = status;
  renderAdmin();
if (document.getElementById("submitTab").style.display === "block") {
showTab("submit");
}
  const helper =
  document.getElementById(
    "helperMessage"
  );

if (helper) {

  if (status) {
    const currentDeadline = appState[
    `round${appState.submission}Deadline`];

    helper.innerHTML =
      `⏳ Vous avez jusqu'au ${
        new Date(
          currentDeadline
        ).toLocaleString()
      } pour soumettre vos prédictions.`;

  } else {

    helper.innerHTML =
      "🔒 Prédictions terminées. Revenez plus tard.";

  }
}
  
  alert(
    status
    ? "Soumissions ouvertes"
    : "Soumissions fermées"
  );
funcs.refreshHelperMessage();
};

export async function updateSubmissionRound() {

  const round = Number(
    document.getElementById(
      "adminSubmission"
    ).value
  );

  await updateDoc(
    doc(db, "config", "ui"),
    {
      currentSubmission: round
    }
  );
  await addDoc(
  collection(db, "adminLogs"),
  {
    action:
      `Soumission active -> ${round}`,

    admin:
      appState.user.displayName,

    timestamp:
      Date.now()
  }
);

  appState.submission = round;
  renderAdmin();
  funcs.refreshHelperMessage();

  alert(
    `Soumission ${round} activée`
  );
  
};

export async function clearAdminHistory(){

  if (
    !confirm(
      "Supprimer tout l'historique ?"
    )
  ) {
    return;
  }

  const snapshot =
    await getDocs(
      collection(
        db,
        "adminLogs"
      )
    );

  await Promise.all(

    snapshot.docs.map(
      d =>
        deleteDoc(d.ref)
    )

  );

  renderAdmin();

};


export async function updateDeadline() {

  await addDoc(
  collection(db, "adminLogs"),
  {
    action:
      "Modification des dates limites",

    admin:
      appState.user.displayName,

    timestamp:
      Date.now()
  }
);


  await updateDoc(
    doc(db, "config", "ui"),
    {

      round1Deadline:
        new Date(
          document.getElementById(
            "round1Deadline"
          ).value
        ).getTime(),

      round2Deadline:
        new Date(
          document.getElementById(
            "round2Deadline"
          ).value
        ).getTime(),

      round3Deadline:
        new Date(
          document.getElementById(
            "round3Deadline"
          ).value
        ).getTime(),

      round4Deadline:
        new Date(
          document.getElementById(
            "round4Deadline"
          ).value
        ).getTime()

    }
  );

  alert(
    "Dates mises à jour"
  );
funcs.refreshHelperMessage();
};


export async function deletePredictionAdmin() {

  const id =
    document.getElementById(
      "deletePredictionSelect"
    ).value;

  if (
    !confirm(
      "Supprimer cette soumission ?"
    )
  ) {
    return;
  }

  await deleteDoc(
    doc(
      db,
      "predictions",
      id
    )
  );

  renderAdmin();

  alert(
    "Soumission supprimée."
  );

};

export async function togglePayment(uid, paid){

  await updateDoc(
    doc(
      db,
      "participants",
      uid
    ),
    {
      paid
    }
  );

};

export async function deleteFeedback(id) {

  if (
    !confirm(
      "Supprimer ce commentaire ?"
    )
  ) {
    return;
  }

  await deleteDoc(
    doc(
      db,
      "feedback",
      id
    )
  );

  renderAdmin();

};
