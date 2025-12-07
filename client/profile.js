document.addEventListener("DOMContentLoaded", async () => {
  const info = document.getElementById("user-info");
  const list = document.createElement("ul");
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

  // 2. Ses morceaux notés
  try {
    console.log("Appel /api/ratings/my-tracks avec token", token);
    const resRatings = await fetch(
      "http://localhost:3000/api/ratings/my-tracks",
      {
        headers: { Authorization: "Bearer " + token },
      }
    );
    console.log("status my-tracks =", resRatings.status);

    const ratings = await resRatings.json();
    if (!resRatings.ok) {
      list.innerHTML = "<li>Erreur en récupérant les morceaux</li>";
      return;
    }

    if (ratings.length === 0) {
      list.innerHTML = "<li>Aucun morceau noté pour l'instant.</li>";
      return;
    }

    list.innerHTML = "";
    ratings.forEach((r) => {
      const li = document.createElement("li");
      const trackTitle =
        r.track?.title || r.track?.name || "Morceau sans titre";
      li.textContent = `${trackTitle} — note : ${r.rating}/5`;
      list.appendChild(li);
    });
  } catch (e) {
    console.error("Erreur my-tracks front:", e);
    list.innerHTML = "<li>Erreur réseau en récupérant les morceaux.</li>";
  }
});
