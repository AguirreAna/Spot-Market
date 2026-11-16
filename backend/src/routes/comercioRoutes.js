import { Router } from 'express';
import {
  listarComercios,
  obtenerComercio,
  obtenerMiComercio,
  comerciosCercanos,
  actualizarComercio,
  masBuscados
} from '../controllers/comercioController.js';
import { verificarToken, verificarRol } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// Rutas específicas antes de /:id
router.get('/mi-comercio', verificarToken, verificarRol('comerciante'), obtenerMiComercio);
router.get('/cercanos', comerciosCercanos);
router.get('/mas-buscados', verificarToken, verificarRol('comerciante'), masBuscados);
router.get('/', listarComercios);
router.get('/:id', obtenerComercio);
router.put('/:id', verificarToken, verificarRol('comerciante'), upload.array('fotos', 8), actualizarComercio);

export default router;
