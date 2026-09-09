import { appState } from "../../app/state.js";
import { renderAdminSubmissionCard } from "./renderAdminSubmission.js";
import { renderAdminPaymentsCard, loadAdminPayments } from "./renderAdminPayments.js";
import { renderAdminFeedbackCard, loadAdminFeedback } from "./renderAdminFeedback.js";
import { renderAdminHistoryCard, loadAdminHistory } from "./renderAdminHistory.js";

export async function renderAdmin() {

  const container =
    document.getElementById("adminTab");

  container.innerHTML = `
    ${renderAdminStatus()}
    ${renderAdminSubmissions()}
    ${renderAdminPaymentsCard()}
    ${renderAdminFeedbackCard()}
    ${renderAdminHistoryCard()}
  `;

  await loadAdminPayments();
  await loadAdminFeedback();
  await loadAdminHistory();
}
