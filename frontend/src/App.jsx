import { useState, useEffect, useRef } from 'react';
import { api } from './api.js';
import Auth from './components/Auth.jsx';
import Dashboard from './components/Dashboard.jsx';
import Account from './components/Account.jsx';

function readSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem('taskflow-session'));
    return session?.token && session?.user?.email ? session : null;
  } catch { return null; }
}

export default function App() {
  const [session, setSession] = useState(readSession);
  const [notice, setNotice] = useState('');
  const [view, setView] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  function authenticate(value) {
    sessionStorage.setItem('taskflow-session', JSON.stringify(value));
    setSession(value);
    setNotice('');
    setView('dashboard');
  }

  function logout(message = '') {
    sessionStorage.removeItem('taskflow-session');
    setSession(null);
    setView('dashboard');
    setNotice(message);
    setMenuOpen(false);
  }

  async function authorizedApi(path, options = {}) {
    try { return await api(path, { ...options, token: session.token }); }
    catch (error) {
      if (error.status === 401) logout('Votre session a expiré. Reconnectez-vous.');
      throw error;
    }
  }

  const initial = session?.user?.email ? session.user.email[0].toUpperCase() : '';

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="/" aria-label="TaskFlow, accueil">
        <span className="brand-mark">t.</span>TaskFlow<span className="brand-caption">MON ESPACE</span>
      </a>
      {session && (
        <div className="account-menu-container" ref={menuRef}>
          <button
            type="button"
            className="account-trigger-btn"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="Menu utilisateur"
          >
            <span className="account-trigger-avatar" aria-hidden="true">{initial}</span>
            <span className="account-trigger-email">{session.user.email}</span>
            <span className="account-trigger-chevron" aria-hidden="true">▼</span>
          </button>
          {menuOpen && (
            <div className="account-dropdown-popover">
              <button
                type="button"
                className="account-dropdown-item"
                onClick={() => { setView('account'); setMenuOpen(false); }}
              >
                <svg className="dropdown-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Mon compte</span>
              </button>
              <button
                type="button"
                className="account-dropdown-item disconnect-item"
                onClick={() => logout()}
              >
                <svg className="dropdown-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m19 5 3-3" />
                  <path d="m2 22 3-3" />
                  <path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z" />
                  <path d="M7.5 13.5 10 11" />
                  <path d="M10.5 16.5 13 14" />
                  <path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z" />
                </svg>
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
    <main>{session
      ? view === 'account'
        ? <Account session={session} request={authorizedApi} onBack={() => setView('dashboard')} />
        : <Dashboard key={session.user.id} request={authorizedApi} />
      : <Auth onSession={authenticate} notice={notice} />}
    </main>
    <footer>TaskFlow <span>Un peu d&apos;ordre. Plus de liberté.</span><a href="/api/docs" target="_blank" rel="noreferrer">Documentation API ↗</a></footer>
  </div>;
}

