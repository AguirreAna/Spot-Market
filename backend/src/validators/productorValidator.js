import { check } from 'express-validator';
import { CATEGORIAS_COMERCIO } from '../config/catalogos.js';

const validarTiposProductos = (value) => {
  const lista = Array.isArray(value) ? value : String(value || '').split(',');
  const limpios = lista.map((t) => String(t).trim()).filter(Boolean);
  if (limpios.length === 0) {
    throw new Error('Seleccioná al menos un tipo de producto.');
  }
  return true;
};

export const registrarProductorRules = [
  check('nombre').trim().notEmpty().withMessage('El nombre del responsable es obligatorio.').isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres.'),
  check('nombre_local').trim().notEmpty().withMessage('El nombre del local es obligatorio.').isLength({ max: 120 }).withMessage('El nombre del local no puede superar los 120 caracteres.'),
  check('email').trim().notEmpty().withMessage('El email es obligatorio.').isEmail().withMessage('Debe ser un email válido.'),
  check('telefono').trim().notEmpty().withMessage('El teléfono es obligatorio.').isLength({ max: 40 }).withMessage('El teléfono no puede superar los 40 caracteres.'),
  check('password').trim().notEmpty().withMessage('La contraseña es obligatoria.').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  check('ubicacion').trim().notEmpty().withMessage('La ubicación del local es obligatoria.'),
  check('categoria').trim().notEmpty().withMessage('La categoría es obligatoria.').isIn(CATEGORIAS_COMERCIO).withMessage(`La categoría debe ser: ${CATEGORIAS_COMERCIO.join(', ')}.`),
  check('tipos_productos').custom(validarTiposProductos),
  check('suscripcion').optional().isIn(['premium', 'estandar']).withMessage('La suscripción debe ser "premium" o "estandar".'),
  check('latitud').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }).withMessage('La latitud debe ser válida.'),
  check('longitud').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }).withMessage('La longitud debe ser válida.'),
  check('descripcion').optional().trim().isLength({ max: 1000 }).withMessage('La descripción no puede superar los 1000 caracteres.'),
  check('fotos').optional().isArray().withMessage('Las fotos deben enviarse como una lista.')
];

export const loginRules = [
  check('email').trim().notEmpty().withMessage('El email es obligatorio.').isEmail().withMessage('Debe ser un email válido.'),
  check('password').trim().notEmpty().withMessage('La contraseña es obligatoria.')
];

export const actualizarProductorRules = [
  check('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
  check('nombre_local').optional().trim().notEmpty().withMessage('El nombre del local no puede estar vacío.'),
  check('telefono').optional().trim().notEmpty().withMessage('El teléfono no puede estar vacío.'),
  check('ubicacion').optional().trim().notEmpty().withMessage('La ubicación no puede estar vacía.'),
  check('categoria').optional().isIn(CATEGORIAS_COMERCIO).withMessage(`La categoría debe ser: ${CATEGORIAS_COMERCIO.join(', ')}.`),
  check('tipos_productos').optional().custom(validarTiposProductos),
  check('suscripcion').optional().isIn(['premium', 'estandar']).withMessage('La suscripción debe ser "premium" o "estandar".'),
  check('latitud').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }).withMessage('La latitud debe ser válida.'),
  check('longitud').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }).withMessage('La longitud debe ser válida.'),
  check('descripcion').optional().trim().isLength({ max: 1000 }).withMessage('La descripción no puede superar los 1000 caracteres.'),
  check('fotos').optional().isArray().withMessage('Las fotos deben enviarse como una lista.'),
  check('password').optional().trim().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
];
