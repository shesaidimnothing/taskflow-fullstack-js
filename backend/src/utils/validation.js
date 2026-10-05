import { invalid } from './errors.js';
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
  objectBody(body, ['title', 'status', 'description', 'dueDate']);
  if (!Object.keys(body).length) throw invalid('Au moins un champ est nécessaire.');
  if ((!partial || 'title' in body) && (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 120)) throw invalid('Le titre doit contenir entre 1 et 120 caractères.');
  if ((!partial || 'status' in body) && !['todo', 'doing', 'done'].includes(body.status)) throw invalid('Le statut doit être todo, doing ou done.');
  if ('description' in body && (typeof body.description !== 'string' || body.description.length > 1000)) throw invalid('La description doit contenir au maximum 1000 caractères.');
  if ('dueDate' in body && body.dueDate !== null && !isCivilDate(body.dueDate)) throw invalid('L’échéance doit être une date réelle au format AAAA-MM-JJ.');
  return { ...body, ...('title' in body ? { title: body.title.trim() } : {}) };
}
export function validateId(id) {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) throw invalid('Identifiant invalide.');
}
