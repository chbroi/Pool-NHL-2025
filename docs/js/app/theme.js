// app/theme.js

export function initializeTheme() {

  const btn =
    document.getElementById(
      "themeToggle"
    );

  const savedTheme =
    localStorage.getItem(
      "theme"
    );

  if (savedTheme) {

    document.body.setAttribute(
      "data-theme",
      savedTheme
    );

    if (btn) {

      btn.innerText =
        savedTheme === "dark"
          ? "☀️"
          : "🌙";
    }

  }

  if (btn) {

    btn.addEventListener(
      "click",

      () => {

        const current =
          document.body.getAttribute(
            "data-theme"
          );

        const next =
          current === "dark"
            ? "light"
            : "dark";

        document.body.setAttribute(
          "data-theme",
          next
        );

        localStorage.setItem(
          "theme",
          next
        );

        btn.innerText =
          next === "dark"
            ? "☀️"
            : "🌙";

      }

    );

  }

}
    }
  }
})
