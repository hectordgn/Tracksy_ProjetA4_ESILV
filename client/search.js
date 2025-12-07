document.addEventListener("DOMContentLoaded", () => {
  console.log("search.js chargé");

  const btn = document.getElementById("searchBtn");
  const input = document.getElementById("searchInput");

  console.log("btn =", btn, "input =", input);

  if (!btn || !input) {
    alert("searchBtn ou searchInput introuvable dans le DOM");
    return;
  }

  btn.addEventListener("click", async () => {
    const query = input.value.trim();
    console.log("clic sur Rechercher, valeur =", query);

    if (!query) {
      alert("Tape un artiste, un album ou un titre avant de rechercher.");
      return;
    }

    try {
      const url = `http://localhost:3000/api/spotify/search?q=${encodeURIComponent(query)}`;
      console.log("appel fetch ->", url);

      const res = await fetch(url);
      console.log("status backend =", res.status, res.statusText);

      const raw = await res.text();
      console.log("corps brut reçu =", raw);

      if (!res.ok) {
        alert("Erreur backend : " + res.status);
        return;
      }

      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error("Impossible de parser le JSON :", e);
        alert("Réponse invalide du serveur");
        return;
      }

      displayResults(data);
    } catch (err) {
      console.error("Erreur de requête fetch :", err);
      alert("Erreur lors de la recherche (voir console).");
    }
  });
});

function displayResults(results) {
  console.log("displayResults avec", results);

  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!Array.isArray(results) || results.length === 0) {
    container.textContent = "Aucun résultat.";
    return;
  }

  results.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("result-item");

    div.innerHTML = `
      <img src="${item.image}" height="80">
      <h3>${item.name}</h3>
      <p>${item.type}</p>
      <button class="add-btn">Ajouter</button>
    `;

    div.querySelector(".add-btn").addEventListener("click", () => addToDB(item));
    container.appendChild(div);
  });
}

async function addToDB(item) {
  try {
    const res = await fetch("http://localhost:3000/api/music/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
