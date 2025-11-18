import { useState, useEffect } from 'react'
import './App.css'

// Définition de l'URL de l'API (soit celle de Render, soit localhost)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  // États
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // --- EFFET POUR DETECTER LE CLICK DEPUIS LE MAIL ---
  useEffect(() => {
    // On regarde si l'URL contient "?token=..."
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (token) {
      // Si oui, on appelle le serveur pour valider
      verifyAccount(token);
    }
  }, []);

  const verifyAccount = async (token) => {
    try {
      // Utilisation de API_URL
      const res = await fetch(`${API_URL}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Compte validé ! Vous pouvez vous connecter.");
        // On nettoie l'URL pour faire joli
        window.history.replaceState({}, document.title, "/");
      } else {
        setError(data.message);
      }
    } catch (err) { setError("Erreur de validation"); }
  };
  // ----------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const endpoint = isRegistering ? '/api/register' : '/api/login';
    
    // On inclut l'email seulement si on s'inscrit
    const payload = isRegistering 
      ? { username, email, password } 
      : { username, password };

    try {
      // Utilisation de API_URL + endpoint
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (isRegistering) {
          setSuccessMsg(data.message); // "Vérifiez vos emails"
          setIsRegistering(false);
        } else {
          setUser(data.user);
        }
      } else {
        setError(data.message);
      }
    } catch (err) { setError("Erreur serveur"); }
  };

  const handleLogout = () => {
    setUser(null); setUsername(''); setPassword(''); setEmail('');
  };

  return (
    <div className="app-container">
      {user ? (
        <div className="login-card">
          <h1>🎉 Bienvenue, {user.name} !</h1>
          <button onClick={handleLogout} className="logout-btn">Se déconnecter</button>
        </div>
      ) : (
        <div className="login-card">
          <h2>{isRegistering ? "Inscription" : "Connexion"}</h2>
          
          {successMsg && <div className="success-msg">{successMsg}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Pseudo" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                />
            </div>

            {/* Champ Email visible uniquement lors de l'inscription */}
            {isRegistering && (
                <div className="input-group">
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                    />
                </div>
            )}

            <div className="input-group">
                <input 
                  type="password" 
                  placeholder="Mot de passe" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button type="submit" className="submit-btn">
              {isRegistering ? "S'inscrire" : "Se connecter"}
            </button>
          </form>
          <div className="toggle-container">
            <span onClick={() => setIsRegistering(!isRegistering)} className="toggle-btn">
              {isRegistering ? "J'ai déjà un compte ? Me connecter" : "Pas encore de compte ? Créer un compte"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default App