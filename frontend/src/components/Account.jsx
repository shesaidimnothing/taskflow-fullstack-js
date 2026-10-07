import { useState } from 'react';
function createdAtFromId(id) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(parseInt(id.substring(0, 8), 16) * 1000)
  );
}
const emptyForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
export default function Account({ session, request, onBack }) {
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault();
    setError(''); setSuccess('');
    if (form.newPassword !== form.confirmPassword) { setError('La confirmation ne correspond pas au nouveau mot de passe.'); return; }
    setBusy(true);
    try {
      await request('/auth/password', { method: 'PATCH', body: { currentPassword: form.currentPassword, newPassword: form.newPassword } });
      setSuccess('Votre mot de passe a bien été modifié.');
      setForm(emptyForm);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  const initial = session.user.email[0].toUpperCase();
  return <section className="dashboard">
    <div className="page-heading">
      <div><p className="eyebrow">MON COMPTE</p><h1>Votre espace.</h1><p>Retrouvez vos informations et gérez votre mot de passe.</p></div>
      <button className="ghost" onClick={onBack}>← Mes tâches</button>
    </div>

    <div className="section-label" style={{ marginBottom: '24px' }}><h2>Informations personnelles</h2><span>VOS DONNÉES</span></div>
    <div className="account-profile">
      <div className="account-avatar" aria-hidden="true">{initial}</div>
      <div className="account-meta">
        <strong>{session.user.email}</strong>
        <span>Membre depuis le {createdAtFromId(session.user.id)}</span>
      </div>
    </div>

    <div className="section-label" style={{ marginBottom: '24px', marginTop: '44px' }}><h2>Modifier le mot de passe</h2><span>SÉCURITÉ</span></div>
    <form className="panel editor" style={{ maxWidth: '520px', margin: '0 auto' }} onSubmit={submit}>
      <label htmlFor="currentPassword" style={{ marginTop: 0 }}>Mot de passe actuel</label>
      <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" value={form.currentPassword} onChange={change} required />
      <label htmlFor="newPassword">Nouveau mot de passe</label>
      <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} value={form.newPassword} onChange={change} required />
      <small>8 caractères minimum, 72 octets maximum.</small>
      <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
      <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={change} required />
      {error && <p role="alert" className="message error">{error}</p>}
      {success && <p role="status" className="message">{success}</p>}
      <div className="actions">
        <button className="primary" disabled={busy || !form.currentPassword || !form.newPassword || !form.confirmPassword}>{busy ? 'Enregistrement…' : 'Modifier le mot de passe'}</button>
        <button type="button" className="ghost" disabled={busy} onClick={() => setForm(emptyForm)}>Effacer</button>
      </div>
    </form>
  </section>;
}
