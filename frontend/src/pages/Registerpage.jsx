import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import AuthLayout from '../components/AuthLayout.jsx';
export default function Registerpage({ onSession, notice }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      onSession(await api('/auth/register', { method: 'POST', body: { email, password } }));
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return <AuthLayout title="Créer mon espace" subtitle="Quelques secondes pour prendre un nouveau départ." notice={notice}>
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Adresse email</label>
      <input id="email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.fr" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={busy} />
      <label htmlFor="password">Mot de passe</label>
      <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={event => setPassword(event.target.value)} disabled={busy} />
      <small>8 caractères minimum, 72 octets maximum.</small>
      {error && <p role="alert" className="message error">{error}</p>}
      <button className="primary full" disabled={busy}>{busy ? 'Un instant…' : 'Créer mon compte'}<span aria-hidden="true">→</span></button>
    </form>
    <div className="auth-switch">Déjà un compte ? <Link className="text-button" to="/login">Se connecter</Link></div>
  </AuthLayout>;
}
