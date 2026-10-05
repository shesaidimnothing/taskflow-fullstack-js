export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export const invalid = (message = 'Les données envoyées sont invalides.') => new ApiError(400, 'INVALID_INPUT', message);
export const unauthorized = () => new ApiError(401, 'UNAUTHORIZED', 'Connexion requise ou identifiants incorrects.');
export const notFound = () => new ApiError(404, 'NOT_FOUND', 'Ressource introuvable.');
