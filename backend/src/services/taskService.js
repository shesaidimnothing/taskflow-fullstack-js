import { Task, publicTask } from '../models/Task.js';
import { validateTask, validateId, validateTaskQuery } from '../utils/validation.js';
import { notFound } from '../utils/errors.js';
const priorityRank = { high: 0, medium: 1, low: 2 };
// sans échéance = en dernier quand on trie par date
const byDueDate = (a, b) => (a.dueDate ?? '9999-99-99').localeCompare(b.dueDate ?? '9999-99-99');
export async function listTasks(ownerId, query = {}) {
  const { status, priority, dueFrom, dueTo, sort } = validateTaskQuery(query);
  const filter = { ownerId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority === 'medium' ? { $in: ['medium', null] } : priority;
  if (dueFrom || dueTo) {
    // les dates sont stockées en texte AAAA-MM-JJ, donc l'ordre alphabétique = l'ordre chronologique
    filter.dueDate = { $type: 'string', ...(dueFrom ? { $gte: dueFrom } : {}), ...(dueTo ? { $lte: dueTo } : {}) };
  }
  const tasks = (await Task.find(filter).sort({ createdAt: -1, _id: -1 })).map(publicTask);
  // tri fait en JS : Mongo trierait les priorités par ordre alphabétique (high, low, medium)
  if (sort === 'dueDate') tasks.sort(byDueDate);
  if (sort === 'priority') tasks.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || byDueDate(a, b));
  return tasks;
}
export async function createTask(ownerId, body) {
  return publicTask(await Task.create({ ...validateTask(body), ownerId }));
}
export async function getTask(ownerId, id) {
  validateId(id);
  const task = await Task.findOne({ _id: id, ownerId });
  if (!task) throw notFound();
  return publicTask(task);
}
export async function updateTask(ownerId, id, body) {
  validateId(id);
  const data = validateTask(body, true);
  const task = await Task.findOneAndUpdate({ _id: id, ownerId }, { $set: data }, { returnDocument: 'after', runValidators: true });
  if (!task) throw notFound();
  return publicTask(task);
}
export async function deleteTask(ownerId, id) {
  validateId(id);
  if (!(await Task.findOneAndDelete({ _id: id, ownerId }))) throw notFound();
}
