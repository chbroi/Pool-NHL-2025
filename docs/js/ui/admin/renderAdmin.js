
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
