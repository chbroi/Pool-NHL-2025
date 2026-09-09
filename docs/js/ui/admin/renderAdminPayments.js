import { getAllParticipants } from "../../services/firestoreService.js";

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
  
  participants.forEach(p => {
  
  container.innerHTML += `
  
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
