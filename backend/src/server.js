import app from './app.js';
import { User } from './models/User.js';
import { connectDb, disconnectDb } from './config/db.js';
import { config, validateConfig } from './config/env.js';
validateConfig();
await connectDb(config.mongoUri);
await User.init();
const server = app.listen(config.port, () => console.log(`TaskFlow : http://localhost:${config.port}`));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close(async () => { await disconnectDb(); process.exit(0); }));
}
