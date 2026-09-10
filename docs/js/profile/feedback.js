export async function submitFeedback() {

  const message =
    document
      .getElementById(
        "profileComment"
      )
      ?.value
      ?.trim();

  if (!message) {

    alert(
      "Veuillez entrer un commentaire."
    );

    return;
  }

  try {

    await addDoc(
      collection(db, "feedback"),
      {
        userId: appState.user.uid,
        userName: appState.user.displayName,
        email: appState.user.email,
        message,
        timestamp: Date.now()
      }
    );

    alert(
      "Merci pour votre commentaire !"
    );

    document.getElementById(
      "profileComment"
    ).value = "";

  } catch (err) {

    console.error(err);

    alert(
      "Erreur lors de l'envoi du commentaire."
    );

  }

};
