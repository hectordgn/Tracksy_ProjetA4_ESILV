document.addEventListener("DOMContentLoaded", async () => {
  const info = document.getElementById("user-info");
  const list = document.getElementById("tracks-list");
  list.id = "tracks-list";
  document.body.appendChild(list);

  const token = localStorage.getItem("tracksy_token");
  if (!token) {
    info.textContent = "Vous n'êtes pas connecté.";
    return;
  }

  // 1. Infos user
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

  // 2. Ses morceaux ajoutés
  try {
    const resTracks = await fetch(
      "http://localhost:3000/api/music/my-tracks",
      {
        headers: { Authorization: "Bearer " + token },
      }
    );

    const tracks = await resTracks.json();
    console.log("status /api/music/my-tracks =", resTracks.status, tracks);

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

      // Coeur déjà rouge
      const heart = document.createElement("button");
      heart.className = "heart-btn liked";
      heart.textContent = "♥";
      heart.title = "Retirer des likes";
      heart.addEventListener("click", () => handleUnlike(t.trackId, card));

      // Titre
      const title = document.createElement("span");
      title.className = "track-title";
      title.textContent = t.name || "Morceau sans titre";

      // Étoiles
      const stars = document.createElement("div");
      stars.className = "stars";
      renderStars(stars, t.trackId, t.rating || 0);

      card.appendChild(heart);
      card.appendChild(title);
      card.appendChild(stars);
      list.appendChild(card);
    });
  } catch (e) {
    console.error("Erreur my-tracks front:", e);
    list.textContent = "Erreur réseau en récupérant les morceaux.";
  }
});

// --- gestion du coeur ---

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
    // enlève la carte de l'UI
    card.remove();
  } catch {
    alert("Erreur réseau");
  }
}

// --- gestion des étoiles (avec demi-étoiles) ---

function renderStars(container, trackId, initialRating) {
  container.innerHTML = "";
  const token = localStorage.getItem("tracksy_token");
  let currentRating = initialRating; // ex. 2.5

  for (let i = 1; i <= 5; i++) {
    const span = document.createElement("span");
    span.classList.add("star");
    updateStarSpan(span, i, currentRating);

    span.addEventListener("click", async () => {
      if (!token) {
        alert("Connecte-toi pour noter.");
        return;
      }

      let newRating;
      // logique simple : cliquer sur même "index" alterne entier / demi
      if (currentRating === i) {
        newRating = i - 0.5; // ex: 3 -> 2.5
      } else if (currentRating === i - 0.5) {
        newRating = i; // ex: 2.5 -> 3
      } else {
        newRating = i; // sinon on met plein
      }

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
        // re-rendu complet pour mettre à jour toutes les classes
        renderStars(container, trackId, currentRating);
      } catch {
        alert("Erreur réseau");
      }
    });

    container.appendChild(span);
  }
}

function updateStarSpan(span, index, rating) {
  span.classList.remove("full", "half", "empty");
  if (rating >= index) {
    span.classList.add("full");
  } else if (rating >= index - 0.5) {
    span.classList.add("half");
  } else {
    span.classList.add("empty");
  }
}
