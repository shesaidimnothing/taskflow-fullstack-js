// Authenticate JWTs and attach the current user to requests.
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { unauthorized } from '../utils/errors.js';
export async function requireAuth(request, _response, next) {
  const match = /^Bearer ([^ ]+)$/i.exec(request.get('authorization') || '');
  if (!match) throw unauthorized();
  let payload;
  try {
    payload = jwt.verify(match[1], config.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw unauthorized();
  }
  if (typeof payload.sub !== 'string' || !/^[a-fA-F0-9]{24}$/.test(payload.sub) || !Number.isInteger(payload.exp) || !(await User.exists({ _id: payload.sub }))) throw unauthorized();
  request.userId = payload.sub;
  next();
}
