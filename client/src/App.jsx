import { useState } from 'react'
import './App.css'

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null); // Stocke l'utilisateur connecté
  const [error, setError] = useState('');
  
  // Ce booléen permet de savoir si on affiche le formulaire d'inscription ou de connexion
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // On choisit la bonne URL selon le mode (Inscription ou Connexion)
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        if (isRegistering) {
          alert("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
          setIsRegistering(false); // On bascule vers la connexion
        } else {
          setUser(data.user); // On connecte l'utilisateur
        }
      } else {
        setError(data.message || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
  };

  // --- AFFICHAGE ---

  return (
    <div className="app-container" style={{ padding: '50px', textAlign: 'center' }}>
      
      {/* Si l'utilisateur est connecté */}
      {user ? (
        <div>
          <h1>🎉 Bienvenue, {user.name} !</h1>
          <p>Vous êtes connecté via MongoDB Atlas.</p>
          <button onClick={handleLogout} style={{ padding: '10px', cursor: 'pointer' }}>
            Se déconnecter
          </button>
        </div>
      ) : (
        /* Si l'utilisateur n'est PAS connecté */
        <div style={{ maxWidth: '350px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
          
          <h2>{isRegistering ? "Créer un compte" : "Se connecter"}</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
              />
            </div>

            {error && <p style={{ color: 'red', fontSize: '0.9rem' }}>{error}</p>}

            <button type="submit" style={{ width: '100%', padding: '10px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none' }}>
              {isRegistering ? "S'inscrire" : "Connexion"}
            </button>
          </form>

          <p 
            onClick={() => setIsRegistering(!isRegistering)} 
            style={{ marginTop: '15px', cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
          >
            {isRegistering 
              ? "J'ai déjà un compte ? Me connecter" 
              : "Pas encore de compte ? S'inscrire"}
          </p>

        </div>
      )}
    </div>
  )
}

export default App