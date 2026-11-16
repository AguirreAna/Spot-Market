// Gestor unificado de almacenamiento multimedia para SpotMarket.
// Si Cloudinary está configurado en .env, sube a la nube.
// Si no hay credenciales de Cloudinary o si falla la red, guarda en backend/uploads/ y sirve vía Express.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

export const guardarImagen = async (file, subcarpeta = 'general') => {
  if (!file || !file.buffer) return null;

  // 1. Intentar Cloudinary si están cargadas las credenciales en .env
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    try {
      const resultado = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `spotmarket/${subcarpeta}`, resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      return {
        url: resultado.secure_url,
        public_id: resultado.public_id
      };
    } catch (err) {
      console.warn(`[STORAGE AVISO] Falló Cloudinary (${err.message}). Guardando en disco local...`);
    }
  }

  // 2. Almacenamiento local garantizado (para XAMPP y entorno local)
  const dirDestino = path.join(UPLOADS_DIR, subcarpeta);
  fs.mkdirSync(dirDestino, { recursive: true });

  const extOriginal = path.extname(file.originalname || '') || '.jpg';
  const nombreLimpio = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extOriginal}`;
  const rutaCompleta = path.join(dirDestino, nombreLimpio);

  fs.writeFileSync(rutaCompleta, file.buffer);

  // URL servida estáticamente por Express: /uploads/subcarpeta/archivo.jpg
  const urlLocal = `/uploads/${subcarpeta}/${nombreLimpio}`;
  return {
    url: urlLocal,
    public_id: `local_${nombreLimpio}`
  };
};
