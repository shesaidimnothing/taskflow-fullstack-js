import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
const path = new URL('../backend/.env', import.meta.url);
try {
  await writeFile(path, `PORT=3000\nMONGODB_URI=mongodb://127.0.0.1:27017/taskflow\nJWT_SECRET=${randomBytes(48).toString('hex')}\n`, { flag: 'wx', mode: 0o600 });
  console.log('backend/.env créé avec une clé aléatoire.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('backend/.env existe déjà : configuration conservée.');
}
