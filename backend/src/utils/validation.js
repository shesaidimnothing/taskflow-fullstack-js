import { invalid } from './errors.js';
export const PRIORITIES = ['low', 'medium', 'high'];
const SORTS = ['createdAt', 'dueDate', 'priority'];
export function objectBody(body, allowed) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !allowed.includes(key))) {
    throw invalid('Le corps JSON contient des champs non autorisés ou un format incorrect.');
  }
}
export function validateAuth(body, register = false) {
  objectBody(body, ['email', 'password']);
  if (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) throw invalid('Adresse email invalide.');
  if (typeof body.password !== 'string' || !body.password.length || Buffer.byteLength(body.password, 'utf8') > 72 || (register && body.password.length < 8)) throw invalid('Le mot de passe doit contenir au moins 8 caractères et au maximum 72 octets à l’inscription.');
  return { email: body.email.trim().toLowerCase(), password: body.password };
}
export function isCivilDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validateTask(body, partial = false) {
  objectBody(body, ['title', 'status', 'priority', 'description', 'dueDate']);
  if (!Object.keys(body).length) throw invalid('Au moins un champ est nécessaire.');
  if ((!partial || 'title' in body) && (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 120)) throw invalid('Le titre doit contenir entre 1 et 120 caractères.');
  if ((!partial || 'status' in body) && !['todo', 'doing', 'done'].includes(body.status)) throw invalid('Le statut doit être todo, doing ou done.');
  if ('priority' in body && !PRIORITIES.includes(body.priority)) throw invalid('La priorité doit être low, medium ou high.');
  if ('description' in body && (typeof body.description !== 'string' || body.description.length > 1000)) throw invalid('La description doit contenir au maximum 1000 caractères.');
  if ('dueDate' in body && body.dueDate !== null && !isCivilDate(body.dueDate)) throw invalid('L’échéance doit être une date réelle au format AAAA-MM-JJ.');
  return { ...body, ...('title' in body ? { title: body.title.trim() } : {}) };
}
export function validateId(id) {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) throw invalid('Identifiant invalide.');
}
// filtres de GET /api/tasks (bonus B1) : ?status=&priority=&dueFrom=&dueTo=&sort=
export function validateTaskQuery(query) {
  const allowed = ['status', 'priority', 'dueFrom', 'dueTo', 'sort'];
  for (const [key, value] of Object.entries(query)) {
    // un paramètre répété (?status=todo&status=done) arrive en tableau : refusé
    if (!allowed.includes(key) || typeof value !== 'string') throw invalid('Paramètre de filtre inconnu ou répété.');
  }
  if (query.status !== undefined && !['todo', 'doing', 'done'].includes(query.status)) throw invalid('Le filtre status doit être todo, doing ou done.');
  if (query.priority !== undefined && !PRIORITIES.includes(query.priority)) throw invalid('Le filtre priority doit être low, medium ou high.');
  for (const key of ['dueFrom', 'dueTo']) {
    if (query[key] !== undefined && !isCivilDate(query[key])) throw invalid(`Le filtre ${key} doit être une date réelle au format AAAA-MM-JJ.`);
  }
  if (query.dueFrom && query.dueTo && query.dueFrom > query.dueTo) throw invalid('dueFrom doit être avant ou égal à dueTo.');
  if (query.sort !== undefined && !SORTS.includes(query.sort)) throw invalid('Le tri doit être createdAt, dueDate ou priority.');
  return { status: query.status, priority: query.priority, dueFrom: query.dueFrom, dueTo: query.dueTo, sort: query.sort ?? 'createdAt' };
}
