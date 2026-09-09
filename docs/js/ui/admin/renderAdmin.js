import { appState } from "../../app/state.js";
import { renderAdminSubmissionCard } from "./renderAdminSubmission.js";
import { renderAdminPaymentsCard, loadAdminPayments } from "./renderAdminPayments.js";
import { renderAdminFeedbackCard } from "./renderAdminFeedback.js";
import { renderAdminHistoryCard} from "./renderAdminHistory.js";

export async function renderAdmin() {

  const container =
    document.getElementById("adminTab");

  container.innerHTML = `
    ${renderAdminSubmissionCard()}
    ${renderAdminPaymentsCard()}
    ${renderAdminFeedbackCard()}
    ${renderAdminHistoryCard()}
  `;

  await loadAdminPayments();
  await loadAdminHistory();
}
