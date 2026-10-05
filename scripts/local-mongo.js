import { MongoMemoryServer } from 'mongodb-memory-server';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const dbPath = fileURLToPath(new URL('../.local/mongodb/', import.meta.url));
await mkdir(dbPath, { recursive: true });
const mongo = await MongoMemoryServer.create({ binary: { version: '7.0.14' }, instance: { port: 27017, ip: '127.0.0.1', dbPath, storageEngine: 'wiredTiger', dbName: 'taskflow' } });
console.log(`MongoDB local persistant : ${mongo.getUri('taskflow')}`);
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await mongo.stop({ doCleanup: false }); process.exit(0); });
