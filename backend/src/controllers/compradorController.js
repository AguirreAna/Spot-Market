import bcrypt from 'bcryptjs';
import { matchedData } from 'express-validator';
import { Comprador } from '../models/Comprador.js';
import { Productor } from '../models/Productor.js';
import { Transaccion } from '../models/Transaccion.js';
import { serializarComprador } from './authController.js';

export const listarCompradores = async (req, res, next) => {
  try {
    const compradores = await Comprador.findAll({
      attributes: { exclude: ['password'] }
    });

    return res.status(200).json({
      ok: true,
      message: 'Listado de usuarios.',
      data: compradores,
      total: compradores.length
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerComprador = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comprador = await Comprador.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Transaccion,
          as: 'pedidos',
          attributes: { exclude: ['comprador_id'] }
        }
      ]
    });

    if (!comprador) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado.'
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Usuario obtenido.',
      data: comprador
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarComprador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = matchedData(req);

    const comprador = await Comprador.findByPk(id);
    if (!comprador) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado.'
      });
    }

    if (Number(req.usuario.id) !== comprador.id) {
      return res.status(403).json({
        ok: false,
        message: 'Solo puedes modificar tu propio perfil.'
      });
    }

    const cambios = {};
    ['nombre', 'telefono', 'tipo', 'ubicacion'].forEach((campo) => {
      if (data[campo] !== undefined) cambios[campo] = data[campo];
    });

    if (data.password) {
      cambios.password = await bcrypt.hash(data.password, 10);
    }

    await comprador.update(cambios);

    return res.status(200).json({
      ok: true,
      message: 'Perfil actualizado correctamente.',
      data: serializarComprador(comprador)
    });
  } catch (error) {
    next(error);
  }
};

export const eliminarComprador = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comprador = await Comprador.findByPk(id);
    if (!comprador) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado.'
      });
    }

    if (Number(req.usuario.id) !== comprador.id) {
      return res.status(403).json({
        ok: false,
        message: 'Solo puedes eliminar tu propio perfil.'
      });
    }

    await comprador.destroy();

    return res.status(200).json({
      ok: true,
      message: 'Usuario eliminado correctamente (soft delete).'
    });
  } catch (error) {
    next(error);
  }
};

export const listaProductoresVinculados = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.usuario.rol !== 'comprador' || Number(req.usuario.id) !== Number(id)) {
      return res.status(403).json({
        ok: false,
        message: 'Solo podés consultar tus propios comercios vinculados.'
      });
    }

    const productores = await Productor.findAll({
      attributes: ['id', 'nombre', 'nombre_local', 'email', 'telefono', 'ubicacion', 'categoria', 'suscripcion'],
      include: [
        {
          model: Comprador,
          as: 'compradores',
          where: { id },
          attributes: []
        }
      ]
    });

    return res.status(200).json({
      ok: true,
      message: 'Comercios conectados al usuario por transacciones.',
      data: productores
    });
  } catch (error) {
    next(error);
  }
};
