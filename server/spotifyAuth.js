const fetch = global.fetch; // Node 20

let cachedToken = null;
let cachedExpiresAt = 0;

async function getSpotifyAccessToken() {
  const now = Date.now();
  if (cachedToken && now < cachedExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error("Impossible d'obtenir un token Spotify, status " + res.status);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // expire_in est en secondes
  cachedExpiresAt = now + (data.expires_in - 60) * 1000; // marge 1 min

  return cachedToken;
}

module.exports = { getSpotifyAccessToken };
