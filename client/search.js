document.addEventListener("DOMContentLoaded", () => {
  console.log("search.js chargé");

  const btn = document.getElementById("searchBtn");
  const input = document.getElementById("searchInput");
  const resultsRoot = document.getElementById("results");

  if (!btn || !input || !resultsRoot) {
    console.error("Éléments manquants dans le DOM");
    return;
  }

  btn.addEventListener("click", () => lancerRecherche(input.value.trim()));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") lancerRecherche(input.value.trim());
  });

  async function lancerRecherche(query) {
    console.log("clic / enter, query =", query);
    if (!query) {
      alert("Tape un artiste, un album ou un titre.");
      return;
    }

    // message global mais on NE TOUCHE PAS à la structure interne
    resultsRoot.querySelectorAll(".results-list").forEach((col) => {
      col.innerHTML = "<p>Recherche en cours...</p>";
    });

    try {
      const url = `http://localhost:3000/api/spotify/search?q=${encodeURIComponent(
        query
      )}`;
      console.log("appel fetch ->", url);

      const res = await fetch(url);
      console.log("status backend =", res.status, res.statusText);

      const raw = await res.text();
      console.log("corps brut reçu =", raw);

      if (!res.ok) {
        resultsRoot.querySelectorAll(".results-list").forEach((col) => {
          col.textContent = "Erreur backend : " + res.status;
        });
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error("JSON invalide :", e);
        resultsRoot.querySelectorAll(".results-list").forEach((col) => {
          col.textContent = "Réponse invalide du serveur.";
        });
        return;
      }

      displayResults(data);
    } catch (err) {
      console.error("Erreur fetch :", err);
      resultsRoot.querySelectorAll(".results-list").forEach((col) => {
        col.textContent = "Erreur réseau lors de la recherche.";
      });
    }
  }

  function displayResults(results) {
    console.log("displayResults avec", results);

    const tracksCol = document.querySelector("#results-tracks .results-list");
    const albumsCol = document.querySelector("#results-albums .results-list");
    const artistsCol = document.querySelector("#results-artists .results-list");

    if (!tracksCol || !albumsCol || !artistsCol) {
      console.error("Colonnes manquantes", { tracksCol, albumsCol, artistsCol });
      return;
    }

    tracksCol.innerHTML = "";
    albumsCol.innerHTML = "";
    artistsCol.innerHTML = "";

    if (!Array.isArray(results) || results.length === 0) {
      tracksCol.innerHTML = "<p>Aucun morceau.</p>";
      albumsCol.innerHTML = "<p>Aucun album.</p>";
      artistsCol.innerHTML = "<p>Aucun artiste.</p>";
      return;
    }

    results.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("result-item");

      let imageUrl = item.image || "";
      let subtitle = "";

      if (item.type === "track") {
        imageUrl = imageUrl || item.extra?.album?.images?.[0]?.url || "";
        const artistName = item.extra?.artists?.[0]?.name || "";
        const albumName = item.extra?.album?.name || "";
        subtitle = `${artistName} — ${albumName}`;
      } else if (item.type === "album") {
        imageUrl = imageUrl || item.extra?.images?.[0]?.url || "";
        subtitle = item.extra?.artists?.[0]?.name || "";
      } else if (item.type === "artist") {
        imageUrl = imageUrl || item.extra?.images?.[0]?.url || "";
        subtitle = "Artiste";
      }

      div.innerHTML = `
        ${imageUrl ? `<img src="${imageUrl}" height="80">` : ""}
        <div class="result-text">
          <h3>${item.name}</h3>
          <p>${subtitle}</p>
          <p class="badge">${item.type}</p>
          <button class="add-btn">Ajouter</button>
        </div>
      `;

      div.querySelector(".add-btn").addEventListener("click", () =>
        addToDB(item)
      );

      if (item.type === "track") tracksCol.appendChild(div);
      else if (item.type === "album") albumsCol.appendChild(div);
      else if (item.type === "artist") artistsCol.appendChild(div);
    });
  }

  async function addToDB(item) {
    try {
      const token = localStorage.getItem("tracksy_token");

      const res = await fetch("http://localhost:3000/api/music/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(item),
      });

      console.log("addToDB status =", res.status);

      if (!res.ok) {
        alert("Erreur lors de l'ajout en base");
        return;
      }

      alert("Ajouté à ta liste !");
    } catch (e) {
      console.error("Erreur addToDB :", e);
      alert("Erreur réseau lors de l'ajout.");
    }
  }
});
