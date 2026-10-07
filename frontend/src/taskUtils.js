export const statusLabels = { todo: 'À faire', doing: 'En cours', done: 'Terminée' };
export const priorityLabels = { high: 'Haute', medium: 'Moyenne', low: 'Basse' };
export const emptyTask = { title: '', status: 'todo', priority: 'medium', description: '', dueDate: '' };
export function displayDate(value) {
  return value ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'Sans échéance';
}
export const noFilters = { status: '', priority: '', due: '', sort: 'createdAt' };
// date du jour de l'utilisateur (heure locale) au format AAAA-MM-JJ, décalée de offset jours
function localDay(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
// transforme les filtres choisis en paramètres pour GET /api/tasks (bonus B1)
export function buildQuery(filters) {
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
