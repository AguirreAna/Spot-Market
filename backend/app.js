import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './src/routes/index.js';
import { env } from './src/config/env.js';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/uploads', express.static(env.UPLOAD_DIR));
app.use('/api/v1', routes);
app.use('/api', notFoundHandler);

app.use('/assets', express.static(path.join(env.FRONTEND_DIR, 'assets')));

app.get('/', (req, res, next) => {
  const inicio = path.join(env.FRONTEND_DIR, 'index.html');
  if (fs.existsSync(inicio)) return res.sendFile(inicio);
  return next();
});

app.get(/^\/[^/]+\.html$/, (req, res, next) => {
  const pagina = path.join(env.FRONTEND_DIR, path.basename(req.path));
  if (fs.existsSync(pagina)) return res.sendFile(pagina);
  return next();
});

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next();

  const pagina404 = path.join(env.FRONTEND_DIR, '404.html');
  if (fs.existsSync(pagina404)) {
    return res.status(404).sendFile(pagina404);
  }

  return next();
});

app.use(notFoundHandler);
app.use(errorHandler);
