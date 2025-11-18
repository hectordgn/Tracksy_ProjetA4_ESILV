import { useState, useEffect } from 'react'
import './App.css'

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
      const res = await fetch('http://localhost:5000/api/verify', {
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
      const response = await fetch(`http://localhost:5000${endpoint}`, {
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
    <div className="app-container" style={{ padding: '50px', textAlign: 'center' }}>
      {user ? (
        <div>
          <h1>🎉 Bienvenue, {user.name} !</h1>
          <button onClick={handleLogout}>Se déconnecter</button>
        </div>
      ) : (
        <div className="login-card" style={{maxWidth: '350px', margin: '0 auto'}}>
          <h2>{isRegistering ? "Inscription" : "Connexion"}</h2>
          
          {successMsg && <div style={{color: 'green', marginBottom: '10px', fontWeight: 'bold'}}>{successMsg}</div>}
          
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom: '10px'}}>
                <input type="text" placeholder="Pseudo" value={username} onChange={e => setUsername(e.target.value)} required style={{width: '100%', padding:'8px'}}/>
            </div>

            {/* Champ Email visible uniquement lors de l'inscription */}
            {isRegistering && (
                <div style={{marginBottom: '10px'}}>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{width: '100%', padding:'8px'}}/>
                </div>
            )}

            <div style={{marginBottom: '10px'}}>
                <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required style={{width: '100%', padding:'8px'}}/>
            </div>

            {error && <p style={{color: 'red'}}>{error}</p>}

            <button type="submit" style={{width: '100%', padding:'10px', cursor:'pointer'}}>
              {isRegistering ? "S'inscrire" : "Se connecter"}
            </button>
          </form>
          <p onClick={() => setIsRegistering(!isRegistering)} style={{cursor: 'pointer', color: 'blue', marginTop: '15px'}}>
            {isRegistering ? "J'ai déjà un compte" : "Créer un compte"}
          </p>
        </div>
      )}
    </div>
  )
}

export default App