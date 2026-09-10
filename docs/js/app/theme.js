  const btn = document.getElementById("themeToggle");

  // restore thème
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    document.body.setAttribute("data-theme", savedTheme);

    // mettre le bon icône au chargement
    if (btn) {
      btn.innerText = savedTheme === "dark" ? "☀️" : "🌙";
    }
  }

  if (btn) {
    btn.addEventListener("click", () => {

      const current = document.body.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";

      document.body.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);

      btn.innerText = next === "dark" ? "☀️" : "🌙";

    });
  }

});


  
      // ======================
      // Accueil
      // ======================
  
      const lastTab = localStorage.getItem("activeTab") || "home";
      showTab(lastTab);
  
    } catch (err) {
  
      console.error(err);
  
      alert(
        "Erreur d'initialisation : " +
        err.message
      );
  
    }
  
  } else {
  
    // ======================
    // Déconnexion
    // ======================
    const profileTab =
    document.getElementById("profileTab");
  
    if (profileTab) {
      profileTab.style.display = "none";
      profileTab.innerHTML = "";
    }

    const adminBtn =
    document.getElementById(
      "adminTabButton"
    );
  
    if (adminBtn) {
      adminBtn.style.display = "none";
    }
  
    appState.user = null;
  
    if (loginBtn) {
      loginBtn.style.display =
        "inline-block";
    }
  
    if (logoutBtn) {
      logoutBtn.style.display =
        "none";
    }
  
    if (userInfo) {
      userInfo.innerText = "";
      userInfo.style.display ="none";
    }
  
    const profileBtn =
      document.getElementById(
        "profileTabButton"
      );
  
    if (profileBtn) {
      profileBtn.style.display =
        "none";
    }
  
    if (profileTab) {
      profileTab.innerHTML = "";
    }
  
    // Retour automatique à la page actuelle
  
    const lastTab =localStorage.getItem( "activeTab") || "home";
    showTab(lastTab);
  
    // Page d'accueil visiteur
  
    const home =
      document.getElementById(
        "homeTab"
      );
  
    if (home) {
  
      home.innerHTML = `
        <div class="card">
  
          <h2>
            🏒 Pool des séries éliminatoires
          </h2>
  
          <p>
            Consultez les résultats
            et le classement gratuitement.
          </p>
  
          <p>
            Connectez-vous pour participer.
          </p>
  
          <button
            onclick="document.getElementById('loginBtn').click()">
  
            Connexion pour participer
  
          </button>
  
        </div>
      `;
    }
  }
})
