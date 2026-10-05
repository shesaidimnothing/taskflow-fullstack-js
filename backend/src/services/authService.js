import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { validateAuth } from '../utils/validation.js';
import { ApiError, unauthorized } from '../utils/errors.js';
function session(user) {
  return {
    user: { id: user._id.toString(), email: user.email },
    token: jwt.sign({}, config.jwtSecret, { subject: user._id.toString(), expiresIn: '1h', algorithm: 'HS256' }),
  };
}
export async function register(body) {
  const { email, password } = validateAuth(body, true);
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    return session(await User.create({ email, passwordHash }));
  } catch (error) {
    if (error.code === 11000) throw new ApiError(409, 'EMAIL_ALREADY_USED', 'Cette adresse email est déjà utilisée.');
    throw error;
  }
}
export async function login(body) {
  const { email, password } = validateAuth(body);
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw unauthorized();
  return session(user);
}
