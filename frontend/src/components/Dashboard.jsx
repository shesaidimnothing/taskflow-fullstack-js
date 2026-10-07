import { useEffect, useRef, useState } from 'react';
const labels = { todo: 'À faire', doing: 'En cours', done: 'Terminée' };
const priorityLabels = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };
const empty = { title: '', status: 'todo', priority: 'medium', description: '', dueDate: '' };
const statusFilters = { '': 'Toutes', todo: 'À faire', doing: 'En cours', done: 'Terminées' };
const dueFilters = { '': 'Toutes les échéances', overdue: 'Échéance passée', today: 'Aujourd’hui', week: '7 prochains jours' };
const sortLabels = { createdAt: 'Plus récentes', dueDate: 'Échéance la plus proche', priority: 'Priorité la plus haute' };
const noFilters = { status: '', priority: '', due: '', sort: 'createdAt' };
function displayDate(value) {
  return value ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'Sans échéance';
}
// date du jour de l'utilisateur (heure locale) au format AAAA-MM-JJ, décalée de offset jours
function localDay(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
// transforme les filtres choisis en paramètres pour GET /api/tasks
function buildQuery(filters) {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.due === 'overdue') params.set('dueTo', localDay(-1));
  if (filters.due === 'today') { params.set('dueFrom', localDay()); params.set('dueTo', localDay()); }
  if (filters.due === 'week') { params.set('dueFrom', localDay()); params.set('dueTo', localDay(6)); }
  if (filters.sort !== 'createdAt') params.set('sort', filters.sort);
  const text = params.toString();
  return text ? `?${text}` : '';
}
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
  const [form, setForm] = useState(empty);
  const [filters, setFilters] = useState(noFilters);
  const heading = useRef(null);
  const query = buildQuery(filters);
  const filtersActive = Boolean(filters.status || filters.priority || filters.due);
  async function refresh(currentQuery) {
    setLoading(true); setError('');
    try { setItems((await requestRef.current(`/tasks${currentQuery}`)).items); }
    catch (error) { setError(error.message); }
    finally { setLoading(false); setLoaded(true); }
  }
  useEffect(() => { refresh(query); }, [query]);
  useEffect(() => { heading.current?.focus(); }, [mode]);
  async function openTask(id) {
    setBusy(true); setError(''); setSuccess('');
    try {
      const task = await requestRef.current(`/tasks/${id}`);
      setSelected(task); setForm({ title: task.title, status: task.status, priority: task.priority, description: task.description, dueDate: task.dueDate || '' }); setMode('detail');
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try {
      await requestRef.current(mode === 'create' ? '/tasks' : `/tasks/${selected.id}`, { method: mode === 'create' ? 'POST' : 'PATCH', body: { ...form, dueDate: form.dueDate || null } });
      setSuccess(mode === 'create' ? 'Votre tâche a été créée.' : 'Les modifications sont enregistrées.'); setMode('list');
      // on recharge avec les filtres en cours : la tâche ne correspond peut-être plus au filtre
      await refresh(query);
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
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  function changeFilter(event) { setSuccess(''); setFilters({ ...filters, [event.target.name]: event.target.value }); }
  return <section className="dashboard">
    <div className="page-heading"><div><p className="eyebrow">VOTRE ESPACE PERSONNEL</p><h1 ref={heading} tabIndex={-1}>{mode === 'list' ? 'Une chose à la fois.' : mode === 'create' ? 'Une nouvelle idée ?' : mode === 'edit' ? 'Ajuster le programme.' : mode === 'delete' ? 'Supprimer cette tâche ?' : 'Tout est dans le détail.'}</h1><p>{mode === 'list' ? 'Gardez le cap sur ce que vous avez envie d’accomplir.' : 'Chaque petit pas compte.'}</p></div>
      {mode === 'list' ? <button className="primary" disabled={busy || !loaded} onClick={() => { setForm(empty); setMode('create'); setError(''); setSuccess(''); }}>+ Nouvelle tâche</button> : <button className="ghost" disabled={busy} onClick={() => { setMode('list'); setError(''); }}>← Mes tâches</button>}
    </div>
    {error && <div className="message error" role="alert">{error} {mode === 'list' && <button onClick={() => refresh(query)}>Réessayer</button>}</div>}
    {success && <p className="message" role="status">{success}</p>}
    {!loaded ? <p role="status" className="empty-state">Chargement de votre espace…</p> : mode === 'list' ? <div className="task-section"><div className="section-label"><h2>Mes tâches</h2><span>VOTRE PROCHAINE ÉTAPE COMMENCE ICI</span></div>
      {(items.length > 0 || filtersActive) && <div className="toolbar">
        <div className="filters" role="group" aria-label="Filtrer par statut">{Object.entries(statusFilters).map(([value, label]) => <button key={value} type="button" className={filters.status === value ? 'filter active' : 'filter'} aria-pressed={filters.status === value} onClick={() => { setSuccess(''); setFilters({ ...filters, status: value }); }}>{label}</button>)}</div>
        <div className="toolbar-selects">
          <label htmlFor="filter-priority" className="sr-only">Filtrer par priorité</label><select id="filter-priority" name="priority" value={filters.priority} onChange={changeFilter}><option value="">Toutes les priorités</option>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>Priorité {label.toLowerCase()}</option>)}</select>
          <label htmlFor="filter-due" className="sr-only">Filtrer par échéance</label><select id="filter-due" name="due" value={filters.due} onChange={changeFilter}>{Object.entries(dueFilters).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <label htmlFor="filter-sort" className="sr-only">Trier les tâches</label><select id="filter-sort" name="sort" value={filters.sort} onChange={changeFilter}>{Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>Tri : {label.toLowerCase()}</option>)}</select>
        </div>
        <p className="count" aria-live="polite">{items.length} tâche{items.length > 1 ? 's' : ''}{filtersActive ? ' correspondant aux filtres' : ''}{filtersActive && <button type="button" className="text-button" onClick={() => setFilters(noFilters)}>Réinitialiser</button>}</p>
      </div>}
      {!items.length && !filtersActive ? <div className="empty-state"><div className="empty-symbol" aria-hidden="true">↗</div><h2>Faites de la place à vos projets.</h2><p>Ajoutez votre première tâche. Le reste viendra pas à pas.</p></div> : !items.length ? <p className="empty-state">Aucune tâche ne correspond à ces filtres.</p> : <div className={loading ? 'task-grid refreshing' : 'task-grid'} aria-busy={loading}>{items.map(task => <button className="task-card" key={task.id} disabled={busy} onClick={() => openTask(task.id)} aria-label={`Consulter ${task.title}`}><div className="card-top"><span className="badges"><span className={`badge ${task.status}`}>{labels[task.status]}</span><span className={`badge priority-${task.priority}`}>Priorité {priorityLabels[task.priority].toLowerCase()}</span></span><span aria-hidden="true">↗</span></div><h3>{task.title}</h3><p>{task.description || 'Un petit pas de plus vers votre objectif.'}</p><div className="card-bottom">{displayDate(task.dueDate)}<span>Voir la tâche →</span></div></button>)}</div>}
    </div> : mode === 'create' || mode === 'edit' ? <form className="editor panel" onSubmit={save}>
      <label htmlFor="title">Titre</label><input id="title" name="title" value={form.title} onChange={change} required maxLength={120} placeholder="Qu’avez-vous en tête ?" />
      <div className="form-row"><div><label htmlFor="status">Statut</label><select id="status" name="status" value={form.status} onChange={change}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div><label htmlFor="priority">Priorité</label><select id="priority" name="priority" value={form.priority} onChange={change}>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
      <label htmlFor="dueDate">Échéance (facultative)</label><input id="dueDate" name="dueDate" type="date" min="0001-01-01" max="9999-12-31" value={form.dueDate} onChange={change} />
      <label htmlFor="description">Description (facultative)</label><textarea id="description" name="description" rows={5} maxLength={1000} value={form.description} onChange={change} placeholder="Quelques détails pour vous aider à avancer…" />
      <div className="actions"><button className="primary" disabled={busy || !form.title.trim()}>{busy ? 'Enregistrement…' : mode === 'create' ? 'Créer la tâche' : 'Enregistrer les modifications'}</button><button className="ghost" type="button" disabled={busy} onClick={() => setMode('list')}>Annuler</button></div>
    </form> : mode === 'delete' ? <div className="panel"><h2>{selected.title}</h2><p>Cette suppression est définitive. Voulez-vous continuer ?</p><div className="actions"><button className="danger" disabled={busy} onClick={remove}>{busy ? 'Suppression…' : 'Confirmer la suppression'}</button><button className="ghost" disabled={busy} onClick={() => setMode('detail')}>Annuler</button></div></div> : <article className="panel detail"><span className="badges"><span className={`badge ${selected.status}`}>{labels[selected.status]}</span><span className={`badge priority-${selected.priority}`}>Priorité {priorityLabels[selected.priority].toLowerCase()}</span></span><h2>{selected.title}</h2><p className="description">{selected.description || 'Aucune description.'}</p><p className="date-label">Échéance : {displayDate(selected.dueDate)}</p><div className="actions"><button className="primary" onClick={() => setMode('edit')}>Modifier</button><button className="danger-outline" onClick={() => setMode('delete')}>Supprimer</button></div></article>}
  </section>;
}
