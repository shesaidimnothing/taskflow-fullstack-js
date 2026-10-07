import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import AuthLayout from '../components/AuthLayout.jsx';
export default function LoginPage({ onSession, notice }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      onSession(await api('/auth/login', { method: 'POST', body: { email, password } }));
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return <AuthLayout title="Heureux de vous revoir" subtitle="Retrouvez vos tâches et reprenez le fil." notice={notice}>
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Adresse email</label>
      <input id="email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.fr" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={busy} />
      <label htmlFor="password">Mot de passe</label>
      <input id="password" name="password" type="password" autoComplete="current-password"  required value={password} onChange={event => setPassword(event.target.value)} disabled={busy} />
      
      {error && <p role="alert" className="message error">{error}</p>}
      <button className="primary full" disabled={busy}>{busy ? 'Un instant…' : 'Se connecter'}<span aria-hidden="true">→</span></button>
    </form>
    <div className="auth-switch">Première visite ? <Link className="text-button" to="/register">Créer un compte</Link></div>
  </AuthLayout>;
}
