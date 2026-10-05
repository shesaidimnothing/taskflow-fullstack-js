import { Task, publicTask } from '../models/Task.js';
import { validateTask, validateId } from '../utils/validation.js';
import { notFound } from '../utils/errors.js';
export async function listTasks(ownerId) {
  return (await Task.find({ ownerId }).sort({ createdAt: -1, _id: -1 })).map(publicTask);
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
