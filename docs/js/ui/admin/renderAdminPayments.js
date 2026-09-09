export function renderAdminPaymentsCard() {

  return `

    <div class="card">

      <h3>
        💰 Gestion des paiements
      </h3>

      <div id="paymentsContainer">

      </div>

    </div>

  `;
}

export async function loadAdminPayments() {

  const participants =
    await getAllParticipants();

  const container =
    document.getElementById(
      "paymentsContainer"
    );

  container.innerHTML = "";

  participants.forEach(p => {
  
  paymentsContainer.innerHTML += `
  
    <div>
  
      <label>
  
        <input
          type="checkbox"
          ${
            p.paid
              ? "checked"
              : ""
          }
          onchange="
            togglePayment(
              '${p.id}',
              this.checked
            )
          "
        >
  
        ${p.name || p.displayName}
  
      </label>
  
    </div>
  
  `;
  
  });;

}
