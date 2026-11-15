import { check } from 'express-validator';

export const registrarCompradorRules = [
  check('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.').isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres.'),
  check('email').trim().notEmpty().withMessage('El email es obligatorio.').isEmail().withMessage('Debe ser un email válido.'),
  check('telefono').optional().trim().isLength({ max: 40 }).withMessage('El teléfono no puede superar los 40 caracteres.'),
  check('password').trim().notEmpty().withMessage('La contraseña es obligatoria.').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  check('tipo').trim().notEmpty().withMessage('El tipo de usuario es obligatorio.').isIn(['comercio', 'restaurante', 'mayorista', 'vecino']).withMessage('El tipo debe ser "comercio", "restaurante", "mayorista" o "vecino".'),
  check('ubicacion').trim().notEmpty().withMessage('La ubicación es obligatoria.')
];

export const actualizarCompradorRules = [
  check('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
  check('telefono').optional().trim().isLength({ max: 40 }).withMessage('El teléfono no puede superar los 40 caracteres.'),
  check('tipo').optional().isIn(['comercio', 'restaurante', 'mayorista', 'vecino']).withMessage('El tipo debe ser "comercio", "restaurante", "mayorista" o "vecino".'),
  check('ubicacion').optional().trim().notEmpty().withMessage('La ubicación no puede estar vacía.'),
  check('password').optional().trim().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
];
