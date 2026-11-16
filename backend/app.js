// Configuración principal de Express para SpotMarket.
// Registra middlewares globales (CORS con credenciales para cookies httpOnly,
// parseo JSON, cookies, archivos estáticos /uploads) y monta la API bajo /api.
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './src/routes/index.js';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.js';
import { env, BACKEND_ROOT } from './src/config/env.js';

export const app = express();

// Asegurar existencia de carpeta uploads local
const uploadsDir = path.join(BACKEND_ROOT, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

// CORS con credentials: para enviar cookies httpOnly entre frontend y backend
const origenesPermitidos = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origin (como herramientas de test o móviles) o si está en la lista
      if (!origin || origenesPermitidos.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // En desarrollo permitir orígenes locales
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Servidor de archivos estáticos para fotos subidas localmente
app.use('/uploads', express.static(uploadsDir));

// Rutas de la API REST
app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);
