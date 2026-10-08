// Définit le stockage des tâches et les données renvoyées par l'API.
import mongoose from 'mongoose';
import { isCivilDate } from '../utils/validation.js';
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  status: { type: String, enum: ['todo', 'doing', 'done'], required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  description: { type: String, maxlength: 1000, default: '' },
  dueDate: { type: String, default: null, validate: value => value === null || isCivilDate(value) },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });
export const Task = mongoose.model('Task', taskSchema);
export function publicTask(task) {
  return { id: task._id.toString(), title: task.title, status: task.status, priority: task.priority ?? 'medium', description: task.description, dueDate: task.dueDate };
}
