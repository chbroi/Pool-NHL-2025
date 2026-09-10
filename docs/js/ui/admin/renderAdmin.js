import { appState } from "../../app/state.js";
import { renderAdminSubmissionCard, loadDeadlineFields, loadAdminSubmission } from "./renderAdminSubmission.js";
import { renderAdminPaymentsCard, loadAdminPayments } from "./renderAdminPayments.js";
import { renderAdminFeedbackCard, reloadFeedbackSection } from "./renderAdminFeedback.js";
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
  console.log(
  "feedback div exists?",
  document.getElementById(
    "feedbackContainer"
  )
);
  if (appState.feedbackSnapshot) { 
    reloadFeedbackSection(appState.feedbackSnapshot);
}

  await loadAdminPayments();
  await loadAdminSubmission();
  await loadAdminHistory();
  await loadDeadlineFields();
}
