import { useState } from 'react';
import { api } from './api.js';
import Auth from './components/Auth.jsx';
import Dashboard from './components/Dashboard.jsx';
function readSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem('taskflow-session'));
    return session?.token && session?.user?.email ? session : null;
  } catch { return null; }
}
export default function App() {
  const [session, setSession] = useState(readSession);
  const [notice, setNotice] = useState('');
  function authenticate(value) {
    sessionStorage.setItem('taskflow-session', JSON.stringify(value));
    setSession(value);
    setNotice('');
  }
  function logout(message = '') {
    sessionStorage.removeItem('taskflow-session');
    setSession(null);
    setNotice(message);
  }
  async function authorizedApi(path, options = {}) {
    try { return await api(path, { ...options, token: session.token }); }
    catch (error) {
      if (error.status === 401) logout('Votre session a expiré. Reconnectez-vous.');
      throw error;
    }
  }
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="/" aria-label="TaskFlow, accueil"><span className="brand-mark">t.</span>TaskFlow<span className="brand-caption">MON ESPACE</span></a>
      {session && <div className="account"><span>{session.user.email}</span><button className="ghost" onClick={() => logout()}>Se déconnecter</button></div>}
    </header>
    <main>{session ? <Dashboard key={session.user.id} request={authorizedApi} /> : <Auth onSession={authenticate} notice={notice} />}</main>
    <footer>TaskFlow <span>Un peu d’ordre. Plus de liberté.</span><a href="/api/docs" target="_blank" rel="noreferrer">Documentation API ↗</a></footer>
  </div>;
}
