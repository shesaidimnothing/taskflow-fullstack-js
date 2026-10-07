import { useEffect, useRef, useState } from 'react';
import TaskList from './TaskList.jsx';
import TaskForm from './TaskForm.jsx';
import { statusLabels as labels, displayDate } from '../taskUtils.js';
export default function Dashboard({ request }) {
  const requestRef = useRef(request);
  requestRef.current = request;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState('list');
  const [selected, setSelected] = useState(null);
  const heading = useRef(null);
  async function refresh() {
    setLoading(true); setError('');
    try { setItems((await requestRef.current('/tasks')).items); }
    catch (error) { setError(error.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => { heading.current?.focus(); }, [mode]);
  async function openTask(id) {
    setBusy(true); setError(''); setSuccess('');
    try {
      const task = await requestRef.current(`/tasks/${id}`);
      setSelected(task); setMode('detail');
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  async function save(body) { setBusy(true); setError(''); setSuccess('');
    try {
      const task = await requestRef.current(mode === 'create' ? '/tasks' : `/tasks/${selected.id}`, { method: mode === 'create' ? 'POST' : 'PATCH', body });
      setItems(current => mode === 'create' ? [task, ...current] : current.map(item => item.id === task.id ? task : item));
      setSuccess(mode === 'create' ? 'Votre tâche a été créée.' : 'Les modifications sont enregistrées.'); setMode('list');
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true); setError(''); setSuccess('');
    try {
      await requestRef.current(`/tasks/${selected.id}`, { method: 'DELETE' });
      setItems(current => current.filter(item => item.id !== selected.id)); setMode('list'); setSuccess('La tâche a été supprimée.');
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return <section className="dashboard">
    <div className="page-heading"><div><p className="eyebrow">VOTRE ESPACE PERSONNEL</p><h1 ref={heading} tabIndex={-1}>{mode === 'list' ? 'Une chose à la fois.' : mode === 'create' ? 'Une nouvelle idée ?' : mode === 'edit' ? 'Ajuster le programme.' : mode === 'delete' ? 'Supprimer cette tâche ?' : 'Tout est dans le détail.'}</h1><p>{mode === 'list' ? 'Gardez le cap sur ce que vous avez envie d’accomplir.' : 'Chaque petit pas compte.'}</p></div>
      {mode === 'list' ? <button className="primary" disabled={busy || loading} onClick={() => { setMode('create'); setError(''); setSuccess(''); }}>+ Nouvelle tâche</button> : <button className="ghost" disabled={busy} onClick={() => { setMode('list'); setError(''); }}>← Mes tâches</button>}
    </div>
    {error && <div className="message error" role="alert">{error} {mode === 'list' && <button onClick={refresh}>Réessayer</button>}</div>}
    {success && <p className="message" role="status">{success}</p>}
    {loading ? <p role="status" className="empty-state">Chargement de votre espace…</p> : mode === 'list' ? <TaskList items={items} busy={busy} onOpen={openTask} /> : mode === 'create' || mode === 'edit' ?
      <TaskForm key={mode === 'create' ? 'new' : selected.id} task={mode === 'edit' ? selected : null} busy={busy} onSave={save} onCancel={() => setMode('list')} /> : mode === 'delete' ? <div className="panel"><h2>{selected.title}</h2><p>Cette suppression est définitive. Voulez-vous continuer ?</p><div className="actions"><button className="danger" disabled={busy} onClick={remove}>{busy ? 'Suppression…' : 'Confirmer la suppression'}</button><button className="ghost" disabled={busy} onClick={() => setMode('detail')}>Annuler</button></div></div> : <article className="panel detail"><span className={`badge ${selected.status}`}>{labels[selected.status]}</span><h2>{selected.title}</h2><p className="description">{selected.description || 'Aucune description.'}</p><p className="date-label">Échéance : {displayDate(selected.dueDate)}</p><div className="actions"><button className="primary" onClick={() => setMode('edit')}>Modifier</button><button className="danger-outline" onClick={() => setMode('delete')}>Supprimer</button></div></article>}
  </section>;
}
