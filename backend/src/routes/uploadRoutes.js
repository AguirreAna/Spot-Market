import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.post(
  '/',
  authenticate,
  upload.fields([
    { name: 'archivo', maxCount: 1 },
    { name: 'archivos', maxCount: 6 }
  ]),
  (req, res) => {
    const archivos = [
      ...((req.files && req.files.archivo) || []),
      ...((req.files && req.files.archivos) || [])
    ];

    if (archivos.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'No se recibió ninguna imagen.'
      });
    }

    const urls = archivos.map((archivo) => `/uploads/${archivo.filename}`);

    return res.status(201).json({
      ok: true,
      message: 'Imagen subida correctamente.',
      data: urls,
      url: urls[0]
    });
  }
);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      ok: false,
      message: error.code === 'LIMIT_FILE_SIZE' ? 'La imagen supera el límite de 5 MB.' : error.message
    });
  }
  if (error) {
    return res.status(400).json({ ok: false, message: error.message });
  }
  next();
});

export default router;
