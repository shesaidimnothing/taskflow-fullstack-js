import { useEffect, useRef, useState } from 'react';
import TaskList from './TaskList.jsx';
import TaskForm from './TaskForm.jsx';
import TaskFilters from './TaskFilters.jsx';
import TaskCalendar, { todayKey } from './TaskCalendar.jsx';
import { statusLabels as labels, priorityLabels, displayDate, noFilters, buildQuery } from '../taskUtils.js';
export default function Dashboard({ request }) {
  const requestRef = useRef(request);
  requestRef.current = request;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mode, setMode] = useState('list');
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState(noFilters);
  const [view, setView] = useState('list');
  const [calendarDate, setCalendarDate] = useState(todayKey);
  const refreshId = useRef(0);
  const heading = useRef(null);
  const query = view === 'calendar' ? '' : buildQuery(filters);
  const filtersActive = Boolean(filters.status || filters.priority || filters.due);
  async function refresh(currentQuery) {
    const id = ++refreshId.current;
    setLoading(true); setError('');
    try {
      const result = await requestRef.current(`/tasks${currentQuery}`);
      if (id === refreshId.current) setItems(result.items);
    } catch (error) { if (id === refreshId.current) setError(error.message); }
    finally { if (id === refreshId.current) { setLoading(false); setLoaded(true); } }
  }
  useEffect(() => { refresh(query); }, [query]);
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
      await requestRef.current(mode === 'create' ? '/tasks' : `/tasks/${selected.id}`, { method: mode === 'create' ? 'POST' : 'PATCH', body });
      setSuccess(mode === 'create' ? 'Votre tâche a été créée.' : 'Les modifications sont enregistrées.'); setMode('list');
      // Reload the active view after a task changes.
      await refresh(query);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  async function changeStatus(task, status) {
    setBusy(true); setError(''); setSuccess('');
    try {
      await requestRef.current(`/tasks/${task.id}`, { method: 'PATCH', body: { status } });
      await refresh(query);
      setSuccess(status === 'done' ? 'Tâche terminée.' : 'Tâche remise à faire.');
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
      {mode === 'list' ? <button className="primary" disabled={busy || !loaded} onClick={() => { setMode('create'); setError(''); setSuccess(''); }}>+ Nouvelle tâche</button> : <button className="ghost" disabled={busy} onClick={() => { setMode('list'); setError(''); }}>← Mes tâches</button>}
    </div>
    {error && <div className="message error" role="alert">{error} {mode === 'list' && <button onClick={() => refresh(query)}>Réessayer</button>}</div>}
    {success && <p className="message" role="status">{success}</p>}
    {mode === 'list' && <div className="view-switch filters" aria-label="Vue des tâches"><button className={`filter ${view === 'list' ? 'active' : ''}`} aria-pressed={view === 'list'} disabled={busy} onClick={() => setView('list')}>Liste</button><button className={`filter ${view === 'calendar' ? 'active' : ''}`} aria-pressed={view === 'calendar'} disabled={busy} onClick={() => setView('calendar')}>Calendrier</button></div>}
    {!loaded ? <p role="status" className="empty-state">Chargement de votre espace…</p> : mode === 'list' && view === 'calendar' ? (loading ? <p role="status">Chargement du calendrier…</p> : <TaskCalendar items={items} busy={busy} selectedDate={calendarDate} onSelectDate={setCalendarDate} onOpen={openTask} onStatus={changeStatus} />) : mode === 'list' ? <TaskList items={items} busy={busy} loading={loading} filtersActive={filtersActive} onOpen={openTask}>
      {(items.length > 0 || filtersActive) && <TaskFilters filters={filters} count={items.length} active={filtersActive} onChange={value => { setSuccess(''); setFilters(value); }} onReset={() => setFilters(noFilters)} />}
    </TaskList> : mode === 'create' || mode === 'edit' ?
      <TaskForm key={mode === 'create' ? 'new' : selected.id} task={mode === 'edit' ? selected : null} busy={busy} onSave={save} onCancel={() => setMode('list')} /> : mode === 'delete' ? <div className="panel"><h2>{selected.title}</h2><p>Cette suppression est définitive. Voulez-vous continuer ?</p><div className="actions"><button className="danger" disabled={busy} onClick={remove}>{busy ? 'Suppression…' : 'Confirmer la suppression'}</button><button className="ghost" disabled={busy} onClick={() => setMode('detail')}>Annuler</button></div></div> : <article className="panel detail"><span className="badges"><span className={`badge ${selected.status}`}>{labels[selected.status]}</span><span className={`badge priority-${selected.priority}`}>Priorité {priorityLabels[selected.priority].toLowerCase()}</span></span><h2>{selected.title}</h2><p className="description">{selected.description || 'Aucune description.'}</p><p className="date-label">Échéance : {displayDate(selected.dueDate)}</p><div className="actions"><button className="primary" onClick={() => setMode('edit')}>Modifier</button><button className="danger-outline" onClick={() => setMode('delete')}>Supprimer</button></div></article>}
  </section>;
}
