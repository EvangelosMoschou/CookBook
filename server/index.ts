import express from 'express';
import { env } from './env';
import { migrate } from './db/migrate';
import { createApiRouter } from './http/router';
import { errorHandler, notFoundHandler } from './http/errors';

const migrations = migrate();

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.use('/api', createApiRouter());
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}/api`);
  console.log(`database: ${env.dbPath}`);
  console.log(
    `migrations: ${migrations.applied.length ? `applied ${migrations.applied.join(', ')}` : 'up to date'}`,
  );
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
