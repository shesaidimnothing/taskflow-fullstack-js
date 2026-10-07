import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { api } from './api.js';
import Navbar from './components/Navbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Account from './components/Account.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Registerpage from './pages/Registerpage.jsx';
function readSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem('taskflow-session'));
    return session?.token && session?.user?.email ? session : null;
  } catch { return null; }
}
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
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
    <Navbar session={session} onLogout={() => logout()} />
    <main><Routes>
      <Route path="/login" element={session ? <Navigate to="/tasks" replace /> : <LoginPage onSession={authenticate} notice={notice} />} />
      <Route path="/register" element={session ? <Navigate to="/tasks" replace /> : <Registerpage onSession={authenticate} notice={notice} />} />
      <Route path="/tasks" element={session ? <Dashboard key={`${session.user.id}:${location.key}`} request={authorizedApi} /> : <Navigate to="/login" replace />} />
      <Route path="/account" element={session ? <Account session={session} request={authorizedApi} onBack={() => navigate('/tasks')} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={session ? '/tasks' : '/login'} replace />} />
    </Routes></main>
    <footer>TaskFlow <span>Un peu d’ordre. Plus de liberté.</span><a href="/api/docs" target="_blank" rel="noreferrer">Documentation API ↗</a></footer>
  </div>;
}
