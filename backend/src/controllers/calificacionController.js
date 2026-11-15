import { matchedData } from 'express-validator';
import { Calificacion } from '../models/Calificacion.js';
import { Comprador } from '../models/Comprador.js';
import { Productor } from '../models/Productor.js';
import { Producto } from '../models/Producto.js';
import { resumenComercios, resumenProductos } from '../utils/calificaciones.js';

const incluirUsuario = {
  model: Comprador,
  as: 'usuario',
  attributes: ['id', 'nombre']
};

const responderResumen = async (res, resumen, mensaje, data, estado = 201) => {
  return res.status(estado).json({
    ok: true,
    message: mensaje,
    data,
    resumen
  });
};

export const listarCalificacionesComercio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productor = await Productor.findByPk(id);
    if (!productor) {
      return res.status(404).json({ ok: false, message: 'Comercio no encontrado.' });
    }

    const [calificaciones, resumen] = await Promise.all([
      Calificacion.findAll({
        where: { productor_id: id },
        include: [incluirUsuario],
        order: [['fecha', 'DESC']]
      }),
      resumenComercios([Number(id)])
    ]);

    return res.status(200).json({
      ok: true,
      message: 'Calificaciones del comercio.',
      data: calificaciones,
      resumen: resumen[id] || { promedio: null, total: 0 }
    });
  } catch (error) {
    next(error);
  }
};

export const calificarComercio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = matchedData(req);

    const productor = await Productor.findByPk(id);
    if (!productor) {
      return res.status(404).json({ ok: false, message: 'Comercio no encontrado.' });
    }

    if (req.usuario.rol === 'productor' && Number(req.usuario.id) === productor.id) {
      return res.status(403).json({ ok: false, message: 'No podés calificar tu propio comercio.' });
    }

    const existente = await Calificacion.findOne({
      where: { usuario_id: req.usuario.id, productor_id: productor.id }
    });

    let calificacion;
    let estado = 201;

    if (existente) {
      await existente.update({ puntaje: data.puntaje, comentario: data.comentario || null, fecha: new Date() });
      calificacion = existente;
      estado = 200;
    } else {
      calificacion = await Calificacion.create({
        usuario_id: req.usuario.id,
        productor_id: productor.id,
        puntaje: data.puntaje,
        comentario: data.comentario || null
      });
    }

    const resumen = await resumenComercios([productor.id]);
    const mensaje = existente ? 'Calificación actualizada.' : '¡Gracias por calificar el comercio!';
    return responderResumen(res, resumen[productor.id] || { promedio: null, total: 0 }, mensaje, calificacion, estado);
  } catch (error) {
    next(error);
  }
};

export const listarCalificacionesProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ ok: false, message: 'Producto no encontrado.' });
    }

    const [calificaciones, resumen] = await Promise.all([
      Calificacion.findAll({
        where: { producto_id: id },
        include: [incluirUsuario],
        order: [['fecha', 'DESC']]
      }),
      resumenProductos([Number(id)])
    ]);

    return res.status(200).json({
      ok: true,
      message: 'Calificaciones del producto.',
      data: calificaciones,
      resumen: resumen[id] || { promedio: null, total: 0 }
    });
  } catch (error) {
    next(error);
  }
};

export const calificarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = matchedData(req);

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ ok: false, message: 'Producto no encontrado.' });
    }

    if (req.usuario.rol === 'productor' && Number(req.usuario.id) === producto.productor_id) {
      return res.status(403).json({ ok: false, message: 'No podés calificar tu propio producto.' });
    }

    const existente = await Calificacion.findOne({
      where: { usuario_id: req.usuario.id, producto_id: producto.id }
    });

    let calificacion;
    let estado = 201;

    if (existente) {
      await existente.update({ puntaje: data.puntaje, comentario: data.comentario || null, fecha: new Date() });
      calificacion = existente;
      estado = 200;
    } else {
      calificacion = await Calificacion.create({
        usuario_id: req.usuario.id,
        producto_id: producto.id,
        puntaje: data.puntaje,
        comentario: data.comentario || null
      });
    }

    const resumen = await resumenProductos([producto.id]);
    const mensaje = existente ? 'Calificación actualizada.' : '¡Gracias por calificar el producto!';
    return responderResumen(res, resumen[producto.id] || { promedio: null, total: 0 }, mensaje, calificacion, estado);
  } catch (error) {
    next(error);
  }
};
