import { body } from 'express-validator';

// Validador flexible para la creación de ofertas temporales.
// Requiere productoId y precio_oferta numérico positivo.
// fecha_inicio y fecha_fin son opcionales (toman por defecto fecha actual y +7 días si no se especifican).
export const validarOferta = [
  body('productoId')
    .notEmpty()
    .withMessage('Debes seleccionar un producto del catálogo.')
    .isInt({ min: 1 })
    .withMessage('Identificador de producto inválido.'),
  body('precio_oferta')
    .notEmpty()
    .withMessage('El precio de oferta es obligatorio.')
    .isFloat({ min: 0.01 })
    .withMessage('El precio de oferta debe ser un número mayor a 0.'),
  body('fecha_inicio')
    .optional({ values: 'falsy' }),
  body('fecha_fin')
    .optional({ values: 'falsy' })
];
