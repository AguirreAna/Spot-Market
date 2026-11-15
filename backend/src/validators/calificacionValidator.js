import { check } from 'express-validator';

export const crearCalificacionRules = [
  check('puntaje')
    .notEmpty()
    .withMessage('El puntaje es obligatorio.')
    .isInt({ min: 1, max: 5 })
    .withMessage('El puntaje debe ser un entero entre 1 y 5.'),
  check('comentario')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('El comentario no puede superar los 500 caracteres.')
];
