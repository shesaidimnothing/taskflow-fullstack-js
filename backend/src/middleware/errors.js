// Convert application errors into consistent HTTP responses.
import { ApiError, invalid } from '../utils/errors.js';
export function errorHandler(error, _request, response, _next) {
  if (error.type === 'entity.parse.failed' || error.type === 'entity.too.large' || error.name === 'ValidationError' || error.name === 'CastError') error = invalid();
  if (error instanceof ApiError) return response.status(error.status).json({ error: { code: error.code, message: error.message } });
  return response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue.' } });
}
