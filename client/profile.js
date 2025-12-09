document.addEventListener("DOMContentLoaded", async () => {
  const info = document.getElementById("user-info");
  const list = document.getElementById("tracks-list");
  const albumsList = document.getElementById("albums-list");
  const artistsList = document.getElementById("artists-list");

  const token = localStorage.getItem("tracksy_token");
  if (!token) {
    info.textContent = "Vous n'êtes pas connecté.";
    return;
  }

  // 1. Infos utilisateur
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

  // 2. Mes morceaux
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

      if (t.image) {
        const img = document.createElement("img");
        img.src = t.image;
        img.height = 60;
        img.className = "track-cover";
        card.appendChild(img);
      }

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

      const starsContainer = document.createElement("div");
      starsContainer.className = "stars";
      renderStars(starsContainer, t.trackId, t.rating || 0);
      infoBox.appendChild(starsContainer);

      const heart = document.createElement("button");
      heart.className = "heart-btn liked";
      heart.innerHTML = "♥";
      heart.title = "Retirer des likes";
      heart.addEventListener("click", () => handleUnlike(t.trackId, card));

      card.appendChild(infoBox);
      card.appendChild(heart);
      list.appendChild(card);
    });
  } catch (e) {
    console.error("Erreur my-tracks front:", e);
    list.textContent = "Erreur réseau.";
  }

  // 3. Mes albums
  try {
    const resAlbums = await fetch("http://localhost:3000/api/music/my-albums", {
      headers: { Authorization: "Bearer " + token },
    });
    const albums = await resAlbums.json();

    if (resAlbums.ok && Array.isArray(albums) && albums.length > 0) {
      albumsList.innerHTML = "";
      albums.forEach((a) => {
        const card = document.createElement("div");
        card.classList.add("profile-track");

        if (a.image) {
          const img = document.createElement("img");
          img.src = a.image;
          img.height = 60;
          img.className = "track-cover";
          card.appendChild(img);
        }

        const infoBox = document.createElement("div");
        infoBox.className = "track-info";

        const artistAlbum = document.createElement("div");
        artistAlbum.className = "track-sub";
        artistAlbum.textContent = a.artistName || "Artiste inconnu";
        infoBox.appendChild(artistAlbum);

        const title = document.createElement("div");
        title.className = "track-title";
        title.textContent = a.name || "Album sans titre";
        infoBox.appendChild(title);

        const starsContainer = document.createElement("div");
        starsContainer.className = "stars";
        renderStarsAlbum(starsContainer, a.albumId, a.rating || 0);
        infoBox.appendChild(starsContainer);

        const heart = document.createElement("button");
        heart.className = "heart-btn liked";
        heart.innerHTML = "♥";
        heart.title = "Retirer des likes";
        heart.addEventListener("click", () =>
          handleUnlikeAlbum(a.albumId, card)
        );

        card.appendChild(infoBox);
        card.appendChild(heart);
        albumsList.appendChild(card);
      });
    } else {
      albumsList.textContent = "Aucun album liké.";
    }
  } catch (e) {
    console.error("Erreur my-albums front:", e);
    albumsList.textContent = "Erreur réseau.";
  }

  // 4. Mes artistes
  try {
    const resArtists = await fetch(
      "http://localhost:3000/api/music/my-artists",
      {
        headers: { Authorization: "Bearer " + token },
      }
    );
    const artists = await resArtists.json();

    if (resArtists.ok && Array.isArray(artists) && artists.length > 0) {
      artistsList.innerHTML = "";
      artists.forEach((a) => {
        const card = document.createElement("div");
        card.classList.add("profile-track");

        if (a.image) {
          const img = document.createElement("img");
          img.src = a.image;
          img.height = 60;
          img.className = "track-cover";
          card.appendChild(img);
        }

        const infoBox = document.createElement("div");
        infoBox.className = "track-info";

        const title = document.createElement("div");
        title.className = "track-title";
        title.textContent = a.name || "Artiste sans nom";
        infoBox.appendChild(title);

        const starsContainer = document.createElement("div");
        starsContainer.className = "stars";
        renderStarsArtist(starsContainer, a.artistId, a.rating || 0);
        infoBox.appendChild(starsContainer);

        const heart = document.createElement("button");
        heart.className = "heart-btn liked";
        heart.innerHTML = "♥";
        heart.title = "Retirer des likes";
        heart.addEventListener("click", () =>
          handleUnlikeArtist(a.artistId, card)
        );

        card.appendChild(infoBox);
        card.appendChild(heart);
        artistsList.appendChild(card);
      });
    } else {
      artistsList.textContent = "Aucun artiste liké.";
    }
  } catch (e) {
    console.error("Erreur my-artists front:", e);
    artistsList.textContent = "Erreur réseau.";
  }
});

// cœur / étoiles (tracks)
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

// utilitaire pour les 3 types
function updateStarClass(span, index, rating) {
  span.classList.remove("full", "half", "empty");
  if (rating == null) rating = 0;

  if (rating >= index) {
    span.classList.add("full");
  } else if (rating >= index - 0.5) {
    span.classList.add("half");
  } else {
    span.classList.add("empty");
  }
}

// unlike artiste
async function handleUnlikeArtist(artistId, card) {
  const token = localStorage.getItem("tracksy_token");
  if (!token) return;

  try {
    const res = await fetch(
      `http://localhost:3000/api/ratings/unlike-artist/${artistId}`,
      {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      }
    );

    if (!res.ok) {
      alert("Erreur en retirant l'artiste des likes");
      return;
    }

    card.remove();
  } catch {
    alert("Erreur réseau");
  }
}

// unlike album
async function handleUnlikeAlbum(albumId, card) {
  const token = localStorage.getItem("tracksy_token");
  if (!token) return;

  try {
    const res = await fetch(
      `http://localhost:3000/api/ratings/unlike-album/${albumId}`,
      {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      }
    );

    if (!res.ok) {
      alert("Erreur en retirant l'album des likes");
      return;
    }

    card.remove();
  } catch {
    alert("Erreur réseau");
  }
}

// étoiles artiste
function renderStarsArtist(container, artistId, initialRating) {
  container.innerHTML = "";
  const token = localStorage.getItem("tracksy_token");
  let currentRating = initialRating || 0;

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
          "http://localhost:3000/api/ratings/rate-artist",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ artistId, rating: newRating }),
          }
        );
        if (!res.ok) {
          alert("Erreur lors de l'enregistrement de la note artiste");
          return;
        }
        currentRating = newRating;
        renderStarsArtist(container, artistId, currentRating);
      } catch {
        alert("Erreur réseau");
      }
    });

    container.appendChild(span);
  }
}

// étoiles album
function renderStarsAlbum(container, albumId, initialRating) {
  container.innerHTML = "";
  const token = localStorage.getItem("tracksy_token");
  let currentRating = initialRating || 0;

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
          "http://localhost:3000/api/ratings/rate-album",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + token,
            },
            body: JSON.stringify({ albumId, rating: newRating }),
          }
        );
        if (!res.ok) {
          alert("Erreur lors de l'enregistrement de la note album");
          return;
        }
        currentRating = newRating;
        renderStarsAlbum(container, albumId, currentRating);
      } catch {
        alert("Erreur réseau");
      }
    });

    container.appendChild(span);
  }
}
