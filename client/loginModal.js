document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector(".login-btn");
  const overlay = document.getElementById("login-overlay");
  const loginModal = document.getElementById("login-modal");
  const closeLogin = document.querySelector(".close-login");

  if (!loginBtn) {
    console.error("Bouton .login-btn introuvable !");
    return;
  }

  loginBtn.addEventListener("click", () => {
    overlay.classList.add("active");
    loginModal.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  function closeModal() {
    overlay.classList.remove("active");
    loginModal.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  closeLogin.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);
});
