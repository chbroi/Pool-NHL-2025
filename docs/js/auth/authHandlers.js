onAuthStateChanged(auth, async (user) => {

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userInfo = document.getElementById("userInfo");
  const profileTab = document.getElementById("profileTab");
  const { config, results } = await loadAppConfig();
  if (user) {

  try {

      appState.user = user;
  
      appState.acceptedRules = await hasAcceptedRules(user.uid);
      const participantDoc = await getDoc(doc(db, "participants", user.uid));
      appState.isAdmin = participantDoc.exists() && participantDoc.data().isAdmin === true;
      setupRealtimeListeners();
  
      
  
      appState.submission = Number(config.currentSubmission);
      appState.results = results;
      appState.deadline = config.deadline;
      appState.submissionOpen = config.submissionOpen;
      appState.hasSubmitted = await alreadySubmitted();
      appState.round1Deadline = config.round1Deadline;
      appState.round2Deadline = config.round2Deadline;
      appState.round3Deadline = config.round3Deadline;
      appState.round4Deadline = config.round4Deadline;
      appState.paid = participantDoc.data()?.paid ?? false;
      funcs.refreshHelperMessage();
    
      // ======================
      // UI connecté
      // ======================
  
      if (loginBtn) {
        loginBtn.style.display = "none";
      }
  
      if (logoutBtn) {
        logoutBtn.style.display = "inline-block";
      }
  
      if (userInfo) {
        userInfo.innerText =user.displayName;
        userInfo.style.display = "inline-block";
        userInfo.onclick = () => { showTab("profile");}
      }    
      const profileBtn =
        document.getElementById(
          "profileTabButton"
        );
  
      if (profileBtn) {
        profileBtn.style.display =
          "inline-block";
      }
    const adminBtn =
      document.getElementById(
        "adminTabButton"
      );
    
    if (adminBtn) {
    
      adminBtn.style.display =
        appState.isAdmin
          ? "inline-block"
          : "none";
    
    }
  
      // ======================
      // Message utilisateur
      // ======================
  
  
      // ======================
      // Génération des rondes
      // ======================
  
      if (
        appState.results &&
        Object.keys(appState.results)
          .length > 0
      ) {
  
        for (
          let i = 1;
          i <= appState.submission;
          i++
        ) {
  
          await generateRound(i);
  
        }
  
      }
  
      // ======================
      // Listeners
      // ======================
  
      attachRound1Listeners();
      attachRound2Listeners();
      attachRound3Listeners();
      attachConnSmytheListeners();
  
      const form =
        document.getElementById(
          "predictionForm"
        );
  
      if (form && !form.hasListener) {
  
        form.addEventListener(
          "change",
          () => {
  
            funcs.checkIfReadyToSubmit(
              appState.submission
            );
  
          }
        );
  
        form.hasListener = true;
      }

  
