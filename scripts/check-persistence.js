import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
const mongo = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
const env = { ...process.env, PORT: '3101', MONGODB_URI: mongo.getUri('taskflow_restart_test'), JWT_SECRET: randomBytes(48).toString('hex') };
let child;
async function start() {
  child = spawn(process.execPath, ['backend/src/server.js'], { env, stdio: ['ignore', 'pipe', 'inherit'] });
  await Promise.race([once(child.stdout, 'data'), once(child, 'exit').then(() => { throw new Error('API failed to start'); })]);
}
async function stop() {
  const stopped = once(child, 'exit'); child.kill('SIGTERM'); await stopped; child = null;
}
try {
  await start();
  const registration = await fetch('http://127.0.0.1:3101/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'restart@example.test', password: 'RestartTest123!' }) });
  assert.equal(registration.status, 201);
  const { token } = await registration.json();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const created = await fetch('http://127.0.0.1:3101/api/tasks', { method: 'POST', headers, body: JSON.stringify({ title: 'Survit au redémarrage', status: 'todo' }) });
  assert.equal(created.status, 201);
  const task = await created.json();
  await stop(); await start();
  const restored = await fetch(`http://127.0.0.1:3101/api/tasks/${task.id}`, { headers });
  assert.equal(restored.status, 200); assert.deepEqual(await restored.json(), task);
  console.log('PASS : tâche et compte conservés après arrêt et redémarrage réels du processus API.');
} finally {
  if (child) await stop();
  await mongo.stop();
}
