import * as authService from '../services/authService.js';
export async function register(request, response) {
  response.status(201).json(await authService.register(request.body));
}
export async function login(request, response) {
  response.json(await authService.login(request.body));
}
export async function changePassword(request, response) {
  await authService.changePassword(request.userId, request.body);
  response.status(204).end();
}
