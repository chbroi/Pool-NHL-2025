export function reloadFeedbackSection(snapshot) {

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

Charles Brosseau`

      );

    container.innerHTML += `
      <div class="card">

        <strong>
          ${f.userName}
        </strong>

        <br>

        <a
          href="mailto:${f.email}?subject=Réponse au commentaire Pool LNH&body=${body        </a>

        <br><br>

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
  });

}
