document.addEventListener("DOMContentLoaded", async () => {
  const authButtons = document.querySelector(".auth-buttons");
  const nav = document.querySelector(".nav-links");
  const token = localStorage.getItem("tracksy_token");

  if (!nav) return;

  // lien profil doit toujours pointer vers profile.html
  const profilLink = nav.querySelector('a[href="profile.html"]');
  if (profilLink) {
    profilLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "profile.html";
    });
  }

  if (!token) {
    // pas connecté : on garde Connexion / S’inscrire
    return;
  }

  // connecté : on remplace par pseudo + logout
  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      headers: { Authorization: "Bearer " + token },
    });
    const me = await res.json();

    if (!res.ok) {
      // token invalide -> on nettoie
      localStorage.removeItem("tracksy_token");
      return;
    }

    if (authButtons) {
      authButtons.innerHTML = "";

      const userSpan = document.createElement("span");
      userSpan.textContent = me.pseudo;

      const logoutBtn = document.createElement("button");
      logoutBtn.textContent = "Se déconnecter";
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("tracksy_token");
        window.location.href = "index.html";
      });

      authButtons.appendChild(userSpan);
      authButtons.appendChild(logoutBtn);
    }
  } catch {
    // en cas d’erreur réseau, on ne casse rien
  }
});
