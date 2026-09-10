import { appState } from "./state.js";
import { acceptRules } from "../services/userService.js";
import { showTab } from "./tabs.js";

export function showRulesModal() {

  const modal =
  document.getElementById("rulesModal");

if (!modal) {

  console.error(
    "rulesModal introuvable"
  );

  return;
}

modal.style.display = "flex";

  const checkbox =
    document.getElementById(
      "rulesAcceptedCheckbox"
    );

  const btn =
    document.getElementById(
      "acceptModalBtn"
    );
  const closeBtn =
    document.getElementById(
      "closeRulesModal"
    );
  closeBtn.onclick = () => {
    modal.style.display = "none";
    showTab("home");
  };
  const viewRulesBtn =
    document.getElementById(
      "viewRulesBtn"
    );
  
    viewRulesBtn.onclick = () => {
      modal.style.display = "none";
      const backContainer =
        document.getElementById(
          "rulesBackContainer"
        );
    
      if (backContainer) {
        backContainer.style.display =
          "block";
      }
      showTab("rules");
    };

  checkbox.onchange = () => {
    btn.disabled = !checkbox.checked;
  };

  btn.onclick = async () => {

    await acceptRules(appState.user);
    const backContainer =
      document.getElementById(
        "rulesBackContainer"
      );
    
    if (backContainer) {
      backContainer.style.display =
        "none";
    }

    appState.acceptedRules = true;

    modal.style.display = "none";

    showTab("submit");
  };
};
