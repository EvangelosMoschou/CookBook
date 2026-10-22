import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const env = {
  port: Number(process.env.PORT ?? 3001),
  dbPath: process.env.DB_PATH ?? path.join(here, 'data', 'cookbook.sqlite'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
};
