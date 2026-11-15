import { check } from 'express-validator';
import { TIPOS_PRODUCTOS } from '../config/catalogos.js';

export const crearProductoRules = [
  check('nombre').trim().notEmpty().withMessage('El nombre del producto es obligatorio.').isLength({ max: 120 }).withMessage('El nombre no puede superar los 120 caracteres.'),
  check('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria.'),
  check('especificacion').optional().trim().isLength({ max: 1500 }).withMessage('La especificación no puede superar los 1500 caracteres.'),
  check('tipo').optional().trim().isIn(TIPOS_PRODUCTOS).withMessage('El tipo de producto no es válido.'),
  check('imagen').optional().trim().isLength({ max: 300 }).withMessage('La URL de la imagen no puede superar los 300 caracteres.'),
  check('precio').notEmpty().withMessage('El precio es obligatorio.').isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0.'),
  check('precio_oferta').optional({ values: 'falsy' }).isFloat({ gt: 0 }).withMessage('El precio de oferta debe ser un número mayor a 0.'),
  check('stock').notEmpty().withMessage('El stock es obligatorio.').isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0.')
];

export const actualizarProductoRules = [
  check('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
  check('descripcion').optional().trim().notEmpty().withMessage('La descripción no puede estar vacía.'),
  check('especificacion').optional().trim().isLength({ max: 1500 }).withMessage('La especificación no puede superar los 1500 caracteres.'),
  check('tipo').optional().trim().isIn(TIPOS_PRODUCTOS).withMessage('El tipo de producto no es válido.'),
  check('imagen').optional().trim().isLength({ max: 300 }).withMessage('La URL de la imagen no puede superar los 300 caracteres.'),
  check('precio').optional().isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0.'),
  check('precio_oferta').optional({ values: 'falsy' }).isFloat({ gt: 0 }).withMessage('El precio de oferta debe ser un número mayor a 0.'),
  check('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0.')
];
