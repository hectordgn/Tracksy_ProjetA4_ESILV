document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector(".login-btn");
  const signupBtn = document.querySelector(".signup-btn");

  const loginOverlay = document.getElementById("login-overlay");
  const loginModal = document.getElementById("login-modal");
  const closeLogin = document.querySelector(".close-login");

  const signupOverlay = document.getElementById("signup-overlay");
  const signupModal = document.getElementById("signup-modal");
  const closeSignup = document.querySelector(".close-signup");

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  function openLogin() {
    signupOverlay?.classList.remove("active");
    signupModal?.classList.remove("active");
    loginOverlay.classList.add("active");
    loginModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLoginModal() {
    loginOverlay.classList.remove("active");
    loginModal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  function openSignup() {
    loginOverlay?.classList.remove("active");
    loginModal?.classList.remove("active");
    signupOverlay.classList.add("active");
    signupModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSignupModal() {
    signupOverlay.classList.remove("active");
    signupModal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  if (loginBtn) loginBtn.addEventListener("click", openLogin);
  if (closeLogin) closeLogin.addEventListener("click", closeLoginModal);
  if (loginOverlay) loginOverlay.addEventListener("click", closeLoginModal);

  if (signupBtn) signupBtn.addEventListener("click", openSignup);
  if (closeSignup) closeSignup.addEventListener("click", closeSignupModal);
  if (signupOverlay) signupOverlay.addEventListener("click", closeSignupModal);

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("submit login"); // pour vérifier que ça passe ici

      const formData = new FormData(loginForm);
      const payload = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      try {
        const res = await fetch("http://localhost:3000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          alert("Erreur connexion: " + (data.error || res.status));
          return;
        }

        localStorage.setItem("tracksy_token", data.token);
        alert("Connecté en tant que " + data.pseudo);
        closeLoginModal();

      } catch (err) {
        console.error("Erreur login:", err);
        alert("Erreur réseau lors de la connexion");
      }
    });
  }


 // Envoi du formulaire d'inscription
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(signupForm);
      const payload = {
        pseudo: formData.get("pseudo"),
        email: formData.get("email"),
        password: formData.get("password"),
      };

      try {
        const res = await fetch("http://localhost:3000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          alert("Erreur inscription: " + (data.error || res.status));
          return;
        }

        alert("Compte créé avec succès, bienvenue " + data.pseudo);
        closeSignupModal();
      } catch (err) {
        console.error("Erreur signup:", err);
        alert("Erreur réseau lors de l'inscription");
      }
    });
  }
});