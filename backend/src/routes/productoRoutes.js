import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticate, optionalAuthenticate, requireAuthForPriceFilter } from '../middlewares/auth.js';
import { crearProductoRules, actualizarProductoRules } from '../validators/productoValidator.js';
import { crearCalificacionRules } from '../validators/calificacionValidator.js';
import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from '../controllers/productoController.js';
import {
  listarCalificacionesProducto,
  calificarProducto
} from '../controllers/calificacionController.js';

const router = Router();

router.get('/', optionalAuthenticate, requireAuthForPriceFilter, listarProductos);
router.get('/:id/calificaciones', listarCalificacionesProducto);
router.post('/:id/calificaciones', authenticate, crearCalificacionRules, validateRequest, calificarProducto);
router.get('/:id', obtenerProducto);
router.post('/', authenticate, authorizeProductor, crearProductoRules, validateRequest, crearProducto);
router.patch('/:id', authenticate, authorizeProductor, actualizarProductoRules, validateRequest, actualizarProducto);
router.delete('/:id', authenticate, authorizeProductor, eliminarProducto);

function authorizeProductor(req, res, next) {
  if (req.usuario?.rol !== 'productor') {
    return res.status(403).json({
      ok: false,
      message: 'Solo los comercios pueden publicar productos.'
    });
  }
  next();
}

export default router;
