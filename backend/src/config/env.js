// Load and validate backend environment settings.
import 'dotenv/config';
export const config = {
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
};
export function validateConfig() {
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) throw new Error('PORT invalide.');
  if (!config.mongoUri) throw new Error('MONGODB_URI est obligatoire.');
  if (!config.jwtSecret || config.jwtSecret.length < 32) throw new Error('JWT_SECRET doit contenir au moins 32 caractères.');
}
