import { getAllFeedback } from "../../services/firestoreService.js";

export function renderAdminFeedbackCard() {

  return `

    <div class="card">

      <h3>
        💬 Commentaires reçus
      </h3>

      <div id="feedbackContainer">

      </div>

    </div>

  `;
}

export function reloadFeedbackSection(snapshot) {
  console.log("feedback count", snapshot.size);
  const container =
    document.getElementById(
      "feedbackContainer"
    );

  if (!container) return;

  container.innerHTML = "";

  snapshot.forEach(doc => {

    const f = {
      id: doc.id,
      ...doc.data()
    };

    const body =
      encodeURIComponent(

`Bonjour ${f.userName},

Pour faire suite à votre commentaire :

"${f.message}"

Insérer réponse.

Merci.

Charles Brosseau
Gestionnaire du Pool NHL
https://chbroi.github.io/Pool-NHL-2025/`

      );

   container.innerHTML += `
  <div class="card">

    <strong>
      ${f.userName}
    </strong>

    <br>
    <p>
      <small>
        ${new Date(f.timestamp).toLocaleString("fr-CA")}
      </small>
    </p>

    <a
      href="mailto:${f.email}?subject=Réponse au commentaire Pool LNH&body=${body}"
      style="color:#4da3ff; text>Commentaire :</strong>

    <p>
      ${f.message}
    </p>

    <button
      class="actionBtn"
      onclick="deleteFeedback('${f.id}')"
    >
      Supprimer
    </button>

  </div>
`;
  });

}
