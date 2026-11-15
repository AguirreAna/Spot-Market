import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { registrarCompradorRules, actualizarCompradorRules } from '../validators/compradorValidator.js';
import { registrarComprador } from '../controllers/authController.js';
import {
  listarCompradores,
  obtenerComprador,
  actualizarComprador,
  eliminarComprador,
  listaProductoresVinculados
} from '../controllers/compradorController.js';

const router = Router();

router.post('/registro', registrarCompradorRules, validateRequest, registrarComprador);

router.get('/', authenticate, listarCompradores);
router.get('/:id/productores', authenticate, listaProductoresVinculados);
router.get('/:id', authenticate, obtenerComprador);
router.patch('/:id', authenticate, actualizarCompradorRules, validateRequest, actualizarComprador);
router.delete('/:id', authenticate, eliminarComprador);

export default router;