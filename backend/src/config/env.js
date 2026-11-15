import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BACKEND_ROOT = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(BACKEND_ROOT, '.env') });
dotenv.config();

const resolverRuta = (valor, defecto) => {
  const ruta = valor || defecto;
  return path.isAbsolute(ruta) ? ruta : path.resolve(BACKEND_ROOT, ruta);
};

export const env = {
  DB_DIALECT: (process.env.DB_DIALECT || 'sqlite').toLowerCase(),
  DB_NAME: process.env.DB_NAME || 'spot_market',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASS: process.env.DB_PASS || '',
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_STORAGE: resolverRuta(process.env.DB_STORAGE, './data/spotmarket.sqlite'),
  PORT: Number(process.env.PORT) || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'secreto_dev',
  NODE_ENV: process.env.NODE_ENV || 'development',
  UPLOAD_DIR: resolverRuta(process.env.UPLOAD_DIR, './uploads'),
  FRONTEND_DIR: resolverRuta(process.env.FRONTEND_DIR, '../frontend'),
  SQL_LOG: process.env.SQL_LOG === 'true'
};
