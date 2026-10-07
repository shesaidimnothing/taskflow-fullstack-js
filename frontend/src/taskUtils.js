export const statusLabels = { todo: 'À faire', doing: 'En cours', done: 'Terminée' };
export const emptyTask = { title: '', status: 'todo', description: '', dueDate: '' };
export function displayDate(value) {
  return value ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)) : 'Sans échéance';
}
