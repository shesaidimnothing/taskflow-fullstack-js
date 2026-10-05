import { useState } from 'react';
import { api } from '../api.js';
export default function Auth({ onSession, notice }) {
  const [register, setRegister] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try { onSession(await api(`/auth/${register ? 'register' : 'login'}`, { method: 'POST', body: { email: data.get('email'), password: data.get('password') } })); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return <section className="auth-layout">
    <div className="intro"><p className="eyebrow">DE LA PLACE POUR L’ESSENTIEL</p><h1>Vos idées.<br />Vos tâches.<br /><em>À votre rythme.</em></h1><p className="intro-copy">Un espace simple pour organiser ce qui compte, avancer pas à pas et profiter du chemin.</p><div className="intro-note"><span className="note-line" />Un espace personnel. Des tâches qui restent privées.</div></div>
    <div className="auth-card"><p className="eyebrow">BIENVENUE CHEZ VOUS</p><h2>{register ? 'Créer mon espace' : 'Heureux de vous revoir'}</h2><p>{register ? 'Quelques secondes pour prendre un nouveau départ.' : 'Retrouvez vos tâches et reprenez le fil.'}</p>
      {notice && <p role="status" className="message">{notice}</p>}
      <form onSubmit={submit}>
        <label htmlFor="email">Adresse email</label><input id="email" name="email" type="email" autoComplete="email" placeholder="vous@exemple.fr" required maxLength={254} />
        <label htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 8 : undefined} required />
        {register && <small>8 caractères minimum, 72 octets maximum.</small>}
        {error && <p role="alert" className="message error">{error}</p>}
        <button className="primary full" disabled={busy}>{busy ? 'Un instant…' : register ? 'Créer mon compte' : 'Se connecter'}<span aria-hidden="true">→</span></button>
      </form><div className="auth-switch">{register ? 'Déjà un compte ?' : 'Première visite ?'} <button disabled={busy} className="text-button" onClick={() => { setRegister(!register); setError(''); }}>{register ? 'Se connecter' : 'Créer un compte'}</button></div>
    </div>
  </section>;
}
