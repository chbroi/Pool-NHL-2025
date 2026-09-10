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
   

const feedbackContainer =
  document.getElementById(
    "feedbackContainer"
  );
  console.log(
  "feedbackContainer",
  feedbackContainer
);
if (!feedbackContainer) return;

snapshot.forEach(doc => {

  const f = {
    id: doc.id,
    ...doc.data()
  };

const body = encodeURIComponent(
`Bonjour ${f.userName},

Pour faire suite à votre commentaire :

"${f.message}"

Insérer votre réponse ici.

Merci pour votre commentaire.

Charles Brosseau

https://chbroi.github.io/Pool-NHL-2025/`
);

 feedbackContainer.innerHTML += `
  <div class="card">

   <strong>${f.userName}</strong>

    <br>

    <small>
      ${new Date(f.timestamp).toLocaleString("fr-CA")}
    </small>
    
    <br><br>

  <a
  href="mailto:${f.email}?subject=Réponse au commentaire Pool LNH&body=${body}"
  style="color:#4da3ff; text-decoration:none;"
>
  📧 Répondre à ${f.userName}
</a>

<br><br>

<strong>

    <br>

    ${f.message}

    <br><br>

    <button
      class="actionBtn"
      onclick="deleteFeedback('${f.id}')"
    >
      Supprimer
    </button>

  </div>
`;
  
})
  

}
