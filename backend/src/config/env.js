// Carga de variables de entorno estándar (.env) para SpotMarket.
// Compatible con XAMPP (MySQL localhost:3306, user 'root', password '')
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BACKEND_ROOT = path.resolve(__dirname, '../..');

// Carga .env desde la raíz de backend/
dotenv.config({ path: path.join(BACKEND_ROOT, '.env') });
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 4000,

  // Base de datos: MySQL por defecto para XAMPP
  DB_DIALECT: (process.env.DB_DIALECT || 'mysql').toLowerCase(),
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASS: process.env.DB_PASS || process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'spotmarket',
  DB_STORAGE: process.env.DB_STORAGE || './data/spotmarket.sqlite',

  // Autenticación JWT
  JWT_SECRET: process.env.JWT_SECRET || 'spotmarket_secreto_formosa_2026',

  // CORS y clientes frontend
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Cloudinary (opcional: si no están cargadas, se guarda en backend/uploads/)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || ''
};
