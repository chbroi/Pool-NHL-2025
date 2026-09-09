import { appState } from "../../app/state.js";
import { renderAdminSubmissionCard, loadDeadlineFields } from "./renderAdminSubmission.js";
import { renderAdminPaymentsCard, loadAdminPayments } from "./renderAdminPayments.js";
import { renderAdminFeedbackCard } from "./renderAdminFeedback.js";
import { renderAdminHistoryCard,loadAdminHistory} from "./renderAdminHistory.js";

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
  await loadAdminSubmission();
  await loadAdminHistory();
  await loadDeadlineFields();
}
