// Transforme les opérations sur les tâches en réponses HTTP.
import * as service from '../services/taskService.js';
export async function list(request, response) {
  response.json({ items: await service.listTasks(request.userId, request.query) });
}
export async function create(request, response) {
  response.status(201).json(await service.createTask(request.userId, request.body));
}
export async function get(request, response) {
  response.json(await service.getTask(request.userId, request.params.id));
}
export async function update(request, response) {
  response.json(await service.updateTask(request.userId, request.params.id, request.body));
}
export async function remove(request, response) {
  await service.deleteTask(request.userId, request.params.id);
  response.status(204).end();
}
