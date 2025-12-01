import { useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  // States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // NOTE: Removed useEffect for token verification

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const endpoint = isRegistering ? '/api/register' : '/api/login';
    
    // Payload now only contains username and password
    const payload = { username, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (isRegistering) {
          setSuccessMsg(data.message); 
          setIsRegistering(false); // Switch to login view immediately
        } else {
          setUser(data.user);
        }
      } else {
        setError(data.message);
      }
    } catch (err) { setError("Erreur serveur"); }
  };

  const handleLogout = () => {
    setUser(null); setUsername(''); setPassword('');
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

            {/* Email input group removed */}

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