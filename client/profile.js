document.addEventListener("DOMContentLoaded", async () => {
  const info = document.getElementById("user-info");
  const list = document.getElementById("tracks-list");

  const token = localStorage.getItem("tracksy_token");
  if (!token) {
    info.textContent = "Vous n'êtes pas connecté.";
    return;
  }

  /** ───────────────────────────────────────────
   * 1. Récupération infos utilisateur
   * ─────────────────────────────────────────── */
  try {
    const resMe = await fetch("http://localhost:3000/api/auth/me", {
      headers: { Authorization: "Bearer " + token },
    });
    const me = await resMe.json();

    if (!resMe.ok) {
      info.textContent = "Erreur: " + (me.error || resMe.status);
      return;
    }

    info.textContent = `Connecté en tant que ${me.pseudo} (${me.email})`;
  } catch {
    info.textContent = "Erreur réseau.";
    return;
  }

  /** ───────────────────────────────────────────
   * 2. Récupération des morceaux
   * ─────────────────────────────────────────── */
  try {
    const resTracks = await fetch("http://localhost:3000/api/music/my-tracks", {
      headers: { Authorization: "Bearer " + token },
    });

    const tracks = await resTracks.json();

    if (!resTracks.ok) {
      list.textContent = "Erreur en récupérant vos morceaux";
      return;
    }
    if (!Array.isArray(tracks) || tracks.length === 0) {
      list.textContent = "Aucun morceau ajouté pour l'instant.";
      return;
    }

    list.innerHTML = "";

    tracks.forEach((t) => {
      const card = document.createElement("div");
      card.classList.add("profile-track");
        console.log("Profil track:", t.name, "rating:", t.rating);
      /** Image **/
      if (t.image) {
        const img = document.createElement("img");
        img.src = t.image;
        img.height = 60;
        img.className = "track-cover";
        card.appendChild(img);
      }

      /** colonne infos **/
      const infoBox = document.createElement("div");
      infoBox.className = "track-info";

      const title = document.createElement("div");
      title.className = "track-title";
      title.textContent = t.name || "Morceau sans titre";

      const subtitle = document.createElement("div");
      subtitle.className = "track-sub";
      subtitle.textContent =
        (t.artistName || "") + (t.albumName ? " — " + t.albumName : "");

      infoBox.appendChild(title);
      infoBox.appendChild(subtitle);

      /** étoiles de notation **/
      const starsContainer = document.createElement("div");
      starsContainer.className = "stars";
      renderStars(starsContainer, t.trackId, t.rating || 0);
      infoBox.appendChild(starsContainer);

      /** cœur **/
      const heart = document.createElement("button");
      heart.className = "heart-btn liked";
      heart.innerHTML = "♥";
      heart.title = "Retirer des likes";
      heart.addEventListener("click", () => handleUnlike(t.trackId, card));

      /** placement final **/
      card.appendChild(infoBox);
      card.appendChild(heart);
      list.appendChild(card);
    });
  } catch (e) {
    console.error("Erreur my-tracks front:", e);
    list.textContent = "Erreur réseau.";
  }
});

/* ─────────────────────────────────────────────
   COEUR : retirer un like
────────────────────────────────────────────── */
async function handleUnlike(trackId, card) {
  const token = localStorage.getItem("tracksy_token");
  if (!token) return;

  try {
    const res = await fetch(
      `http://localhost:3000/api/ratings/unlike-track/${trackId}`,
      {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      }
    );

    if (!res.ok) {
      alert("Erreur en retirant des likes");
      return;
    }

    card.remove();
  } catch {
    alert("Erreur réseau");
  }
}

/* ─────────────────────────────────────────────
   ÉTOILES DE NOTATION
────────────────────────────────────────────── */

function renderStars(container, trackId, initialRating) {
  container.innerHTML = "";
  const token = localStorage.getItem("tracksy_token");
  let currentRating = initialRating;

  for (let i = 1; i <= 5; i++) {
    const span = document.createElement("span");
    span.classList.add("star");
    updateStarClass(span, i, currentRating);

    span.addEventListener("click", async () => {
      if (!token) return alert("Connecte-toi pour noter.");

      let newRating;

      if (currentRating === i) newRating = i - 0.5;
      else if (currentRating === i - 0.5) newRating = i;
      else newRating = i;

      try {
        const res = await fetch(
          "http://localhost:3000/api/ratings/rate-track",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ trackId, rating: newRating }),
          }
        );

        if (!res.ok) {
          alert("Erreur lors de l'enregistrement de la note");
          return;
        }

        currentRating = newRating;
        renderStars(container, trackId, currentRating);
      } catch {
        alert("Erreur réseau");
      }
    });

    container.appendChild(span);
  }
}

function updateStarClass(span, index, rating) {
  span.classList.remove("full", "half", "empty");

  // S'assurer que "rating" vaut 0 au lieu de null/undefined
  if (!rating) rating = 0;

  if (rating >= index) {
    span.classList.add("full");
  } else if (rating >= index - 0.5) {
    span.classList.add("half");
  } else {
    span.classList.add("empty");
  }
}

