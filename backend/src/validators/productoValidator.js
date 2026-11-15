import { body, query } from 'express-validator';

export const validarCrearProducto = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('precio').isFloat({ min: 0.01 }).withMessage('El precio debe ser un número positivo.'),
  body('precio_oferta').optional({ values: 'falsy' }).isFloat({ min: 0.01 }).withMessage('El precio de oferta debe ser un número positivo.'),
  body('tipo_precio').optional().isIn(['diario', 'mensual']).withMessage('Tipo de precio inválido.'),
  body('cuotas').optional({ values: 'falsy' }).isString().withMessage('Información de cuotas inválida.'),
  body('destacado').optional().isBoolean().withMessage('El valor destacado debe ser booleano.'),
  body('categoria').optional({ values: 'falsy' }).isString(),
  body('descripcion').optional({ values: 'falsy' }).isString(),
  body('especificaciones').optional({ values: 'falsy' }).isString()
];

export const validarActualizarProducto = [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
  body('precio').optional().isFloat({ min: 0.01 }).withMessage('Precio inválido.'),
  body('precio_oferta').optional({ values: 'falsy' }).isFloat({ min: 0.01 }).withMessage('Precio de oferta inválido.'),
  body('tipo_precio').optional().isIn(['diario', 'mensual']).withMessage('Tipo de precio inválido.'),
  body('cuotas').optional({ values: 'falsy' }).isString(),
  body('destacado').optional().isBoolean(),
  body('categoria').optional({ values: 'falsy' }).isString(),
  body('descripcion').optional({ values: 'falsy' }).isString(),
  body('especificaciones').optional({ values: 'falsy' }).isString()
];
