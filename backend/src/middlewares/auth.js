import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const extraerUsuario = (header) => {
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.split(' ')[1];
  const payload = jwt.verify(token, env.JWT_SECRET);
  return {
    id: payload.id,
    rol: payload.rol,
    email: payload.email
  };
};

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      message: 'No se proporcionó un token de autenticación.'
    });
  }

  try {
    req.usuario = extraerUsuario(header);
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Token inválido o expirado.'
    });
  }
};

export const optionalAuthenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return next();

  try {
    req.usuario = extraerUsuario(header);
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Token inválido o expirado.'
    });
  }
};

export const requireAuthForPriceFilter = (req, res, next) => {
  const { precio_min, precio_max, orden } = req.query;
  const usaFiltroPrecio =
    precio_min !== undefined ||
    precio_max !== undefined ||
    (typeof orden === 'string' && orden.startsWith('precio'));

  if (!usaFiltroPrecio) return next();

  if (!req.usuario) {
    return res.status(401).json({
      ok: false,
      codigo: 'REGISTRO_REQUERIDO',
      message: 'Registrate o iniciá sesión para filtrar y ordenar por precio.'
    });
  }

  return next();
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para realizar esta acción.'
      });
    }
    next();
  };
};
