import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Task } from '../src/models/Task.js';
let mongo;
let tokenA;
let tokenB;
const password = 'MotDePasse123!';
const taskBody = { title: 'Préparer la démo', status: 'todo', description: 'Plan et données', dueDate: '2026-10-05' };
const auth = token => ({ Authorization: `Bearer ${token}` });
beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ binary: { version: '7.0.14' } });
  await mongoose.connect(mongo.getUri('taskflow_test'));
  await User.init();
  const a = await request(app).post('/api/auth/register').send({ email: 'a@example.test', password });
  const b = await request(app).post('/api/auth/register').send({ email: 'b@example.test', password });
  tokenA = a.body.token; tokenB = b.body.token;
});
beforeEach(async () => { await Task.deleteMany({}); });
afterAll(async () => { await mongoose.disconnect(); if (mongo) await mongo.stop(); });
async function create() { return request(app).post('/api/tasks').set(auth(tokenA)).send(taskBody); }
function expectError(response, status, code) {
  expect(response.status).toBe(status);
  expect(response.body.error.code).toBe(code);
  expect(typeof response.body.error.message).toBe('string');
  expect(response.body.error.message.length).toBeGreaterThan(0);
  expect(response.body.error).not.toHaveProperty('stack');
}
test('health répond exactement selon le contrat', async () => {
  const response = await request(app).get('/api/health');
  expect(response.status).toBe(200); expect(response.body).toEqual({ status: 'ok' });
});
test('inscription : email normalisé, JWT signé, bcrypt et aucune fuite', async () => {
  const response = await request(app).post('/api/auth/register').send({ email: ' Alice@Example.test ', password });
  expect(response.status).toBe(201);
  expect(response.body.user).toEqual({ id: expect.any(String), email: 'alice@example.test' });
  expect(jwt.verify(response.body.token, process.env.JWT_SECRET).sub).toBe(response.body.user.id);
  const user = await User.findById(response.body.user.id).select('+passwordHash');
  expect(await bcrypt.compare(password, user.passwordHash)).toBe(true);
  expect(JSON.stringify(response.body)).not.toMatch(/password|passwordHash/);
  expectError(await request(app).post('/api/auth/register').send({ email: 'ALICE@example.test', password }), 409, 'EMAIL_ALREADY_USED');
});
test('connexion valide et mauvais identifiants', async () => {
  const response = await request(app).post('/api/auth/login').send({ email: 'A@EXAMPLE.TEST', password });
  expect(response.status).toBe(200); expect(response.body.token).toEqual(expect.any(String));
  for (const email of ['a@example.test', 'absent@example.test']) expectError(await request(app).post('/api/auth/login').send({ email, password: 'incorrect' }), 401, 'UNAUTHORIZED');
});
test.each([{ email: 'invalid', password }, { email: 'x@example.test', password: 'short' }, { email: 'x@example.test', password: 12345678 }, {}, [], { email: 'x@example.test', password, admin: true }])('inscription invalide : %j', async body => {
  expectError(await request(app).post('/api/auth/register').send(body), 400, 'INVALID_INPUT');
});
test('parcours CRUD complet, enveloppe items, id public, trim et suppression 204', async () => {
  expect((await request(app).get('/api/tasks').set(auth(tokenA))).body).toEqual({ items: [] });
  const created = await request(app).post('/api/tasks').set(auth(tokenA)).send({ ...taskBody, title: '  Préparer la démo  ' });
  expect(created.status).toBe(201); expect(created.body).toEqual({ ...taskBody, id: expect.stringMatching(/^[a-f0-9]{24}$/) });
  const id = created.body.id;
  const detail = await request(app).get(`/api/tasks/${id}`).set(auth(tokenA));
  expect(detail.status).toBe(200); expect(detail.body).toEqual(created.body);
  expect((await request(app).get('/api/tasks').set(auth(tokenA))).body.items).toEqual([created.body]);
  const patch = await request(app).patch(`/api/tasks/${id}`).set(auth(tokenA)).send({ status: 'done', dueDate: null, description: '' });
  expect(patch.status).toBe(200); expect(patch.body).toEqual({ ...created.body, status: 'done', dueDate: null, description: '' });
  const removed = await request(app).delete(`/api/tasks/${id}`).set(auth(tokenA));
  expect(removed.status).toBe(204); expect(removed.text).toBe('');
  expectError(await request(app).get(`/api/tasks/${id}`).set(auth(tokenA)), 404, 'NOT_FOUND');
});
test('les champs facultatifs peuvent être omis et une date bissextile est valide', async () => {
  const response = await request(app).post('/api/tasks').set(auth(tokenA)).send({ title: 'Simple', status: 'doing' });
  expect(response.status).toBe(201); expect(response.body.dueDate).toBeNull();
  expect((await request(app).patch(`/api/tasks/${response.body.id}`).set(auth(tokenA)).send({ dueDate: '2028-02-29' })).status).toBe(200);
});
test.each([{ title: '' }, { title: '   ' }, { title: 'x'.repeat(121) }, { title: 1 }, { status: 'archived' }, { status: null }, { description: null }, { description: 'x'.repeat(1001) }, { dueDate: '2026-02-29' }, { dueDate: '2026-04-31' }, { dueDate: '2026-13-01' }, { dueDate: '2026-1-01' }, { dueDate: '' }, { dueDate: 123 }, { ownerId: '507f1f77bcf86cd799439011' }, { id: '507f1f77bcf86cd799439011' }, { unknown: true }, { '$set': { title: 'hack' } }])('POST/PATCH rejettent %j', async invalid => {
  expectError(await request(app).post('/api/tasks').set(auth(tokenA)).send({ ...taskBody, ...invalid }), 400, 'INVALID_INPUT');
  const task = await create();
  expectError(await request(app).patch(`/api/tasks/${task.body.id}`).set(auth(tokenA)).send(invalid), 400, 'INVALID_INPUT');
});
test('champs requis, objets vides, tableau et JSON malformé', async () => {
  for (const body of [{}, [], { title: 'Titre' }, { status: 'todo' }]) expectError(await request(app).post('/api/tasks').set(auth(tokenA)).send(body), 400, 'INVALID_INPUT');
  const task = await create();
  expectError(await request(app).patch(`/api/tasks/${task.body.id}`).set(auth(tokenA)).send({}), 400, 'INVALID_INPUT');
  expectError(await request(app).post('/api/tasks').set(auth(tokenA)).set('Content-Type', 'application/json').send('{broken'), 400, 'INVALID_INPUT');
});
test('les cinq opérations refusent les jetons absents, falsifiés et expirés', async () => {
  const expired = jwt.sign({}, process.env.JWT_SECRET, { subject: new mongoose.Types.ObjectId().toString(), expiresIn: -1 });
  for (const token of [null, 'bad.token.value', expired, jwt.sign({}, 'another-secret', { subject: new mongoose.Types.ObjectId().toString() })]) {
    for (const [method, path] of [['get', '/api/tasks'], ['post', '/api/tasks'], ['get', '/api/tasks/507f1f77bcf86cd799439011'], ['patch', '/api/tasks/507f1f77bcf86cd799439011'], ['delete', '/api/tasks/507f1f77bcf86cd799439011']]) {
      const call = request(app)[method](path); if (token) call.set(auth(token));
      expectError(await call, 401, 'UNAUTHORIZED');
    }
  }
});
test('isolation A/B : liste, lecture, modification, suppression et objet A préservé', async () => {
  const task = await create();
  const b = await request(app).post('/api/tasks').set(auth(tokenB)).send({ title: 'Tâche B', status: 'todo' });
  expect((await request(app).get('/api/tasks').set(auth(tokenB))).body.items.map(item => item.id)).toEqual([b.body.id]);
  for (const method of ['get', 'patch', 'delete']) {
    const call = request(app)[method](`/api/tasks/${task.body.id}`).set(auth(tokenB));
    if (method === 'patch') call.send({ title: 'Tentative B' });
    expectError(await call, 404, 'NOT_FOUND');
  }
  expect((await request(app).get(`/api/tasks/${task.body.id}`).set(auth(tokenA))).body).toEqual(task.body);
});
test.each(['get', 'patch', 'delete'])('%s : identifiant malformé 400 et absent 404', async method => {
  for (const [id, status, code] of [['invalid', 400, 'INVALID_INPUT'], ['507f1f77bcf86cd799439011', 404, 'NOT_FOUND']]) {
    const call = request(app)[method](`/api/tasks/${id}`).set(auth(tokenA));
    if (method === 'patch') call.send({ status: 'done' });
    expectError(await call, status, code);
  }
});
test('persistance après déconnexion et reconnexion à MongoDB', async () => {
  const task = await create();
  await mongoose.disconnect(); await mongoose.connect(mongo.getUri('taskflow_test'));
  expect((await request(app).get(`/api/tasks/${task.body.id}`).set(auth(tokenA))).body).toEqual(task.body);
});
test('OpenAPI accessible et route API inconnue en JSON', async () => {
  expect((await request(app).get('/api/openapi.json')).body.openapi).toBe('3.0.3');
  expectError(await request(app).get('/api/missing'), 404, 'NOT_FOUND');
});
