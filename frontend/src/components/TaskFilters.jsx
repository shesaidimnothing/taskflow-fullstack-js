import { priorityLabels } from '../taskUtils.js';
const statusFilters = { '': 'Toutes', todo: 'À faire', doing: 'En cours', done: 'Terminées' };
const dueFilters = { '': 'Toutes les échéances', overdue: 'Échéance passée', today: 'Aujourd’hui', week: '7 prochains jours' };
const sortLabels = { createdAt: 'Plus récentes', dueDate: 'Échéance la plus proche', priority: 'Priorité la plus haute' };
// barre de filtres du bonus B1 : chaque changement relance GET /api/tasks avec les bons paramètres
export default function TaskFilters({ filters, count, active, onChange, onReset }) {
  function change(event) { onChange({ ...filters, [event.target.name]: event.target.value }); }
  return <div className="toolbar">
    <div className="filters" role="group" aria-label="Filtrer par statut">{Object.entries(statusFilters).map(([value, label]) => <button key={value} type="button" className={filters.status === value ? 'filter active' : 'filter'} aria-pressed={filters.status === value} onClick={() => onChange({ ...filters, status: value })}>{label}</button>)}</div>
    <div className="toolbar-selects">
      <label htmlFor="filter-priority" className="sr-only">Filtrer par priorité</label><select id="filter-priority" name="priority" value={filters.priority} onChange={change}><option value="">Toutes les priorités</option>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>Priorité {label.toLowerCase()}</option>)}</select>
      <label htmlFor="filter-due" className="sr-only">Filtrer par échéance</label><select id="filter-due" name="due" value={filters.due} onChange={change}>{Object.entries(dueFilters).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <label htmlFor="filter-sort" className="sr-only">Trier les tâches</label><select id="filter-sort" name="sort" value={filters.sort} onChange={change}>{Object.entries(sortLabels).map(([value, label]) => <option key={value} value={value}>Tri : {label.toLowerCase()}</option>)}</select>
    </div>
    <p className="count" aria-live="polite">{count} tâche{count > 1 ? 's' : ''}{active ? ' correspondant aux filtres' : ''}{active && <button type="button" className="text-button" onClick={onReset}>Réinitialiser</button>}</p>
  </div>;
}
