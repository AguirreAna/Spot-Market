// Carga de variables de entorno y configuración centralizada de la aplicación.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BACKEND_ROOT = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(BACKEND_ROOT, '.env') });
dotenv.config();

export const env = {
  DB_DIALECT: (process.env.DB_DIALECT || 'sqlite').toLowerCase(),
  DB_NAME: process.env.DB_NAME || 'spotmarket',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASS: process.env.DB_PASS || '',
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_STORAGE: process.env.DB_STORAGE || './data/spotmarket.sqlite',
  PORT: Number(process.env.PORT) || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'secreto_desarrollo_spotmarket_formosa_2026',
  NODE_ENV: process.env.NODE_ENV || 'development',
  // Orígenes permitidos para CORS (para permitir cookies httpOnly con credentials: 'include')
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  // Credenciales opcionales de Cloudinary (para subida en la nube)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || ''
};
