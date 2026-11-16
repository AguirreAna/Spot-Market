// Controlador de ofertas temporales para SpotMarket.
// Sincroniza automáticamente el precio_oferta del producto para que se vea en el Inicio.
import { Op } from 'sequelize';
import { matchedData } from 'express-validator';
import { db } from '../models/index.js';
import { obtenerComercioDelUsuario, productoDelComercio } from '../utils/propiedad.js';

const { Oferta, Producto, Comercio } = db;

const whereVigente = () => {
  const ahora = new Date();
  return { fecha_inicio: { [Op.lte]: ahora }, fecha_fin: { [Op.gte]: ahora } };
};

export const listarOfertasVigentes = async (req, res, next) => {
  try {
    const ofertas = await Oferta.findAll({
      where: whereVigente(),
      include: [
        {
          model: Producto,
          as: 'producto',
          include: [{ model: Comercio, as: 'comercio', attributes: ['id', 'nombre_local', 'tipo_comercio', 'direccion'] }]
        }
      ],
      order: [['fecha_fin', 'ASC']]
    });
    return res.json({ ok: true, ofertas });
  } catch (error) {
    next(error);
  }
};

export const listarMisOfertas = async (req, res, next) => {
  try {
    const comercio = await obtenerComercioDelUsuario(req.usuario.id);
    if (!comercio) return res.status(403).json({ ok: false, mensaje: 'No tenés un comercio registrado.' });

    const ofertas = await Oferta.findAll({
      include: [
        {
          model: Producto,
          as: 'producto',
          where: { comercioId: comercio.id }
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ ok: true, ofertas });
  } catch (error) {
    next(error);
  }
};

export const crearOferta = async (req, res, next) => {
  try {
    const comercio = await obtenerComercioDelUsuario(req.usuario.id);
    if (!comercio) return res.status(403).json({ ok: false, mensaje: 'No tenés un comercio registrado.' });

    const data = { ...req.body, ...matchedData(req) };
    const productoId = data.productoId || data.producto_id;
    const producto = await productoDelComercio(productoId, comercio.id);
    if (!producto) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado o no te pertenece.' });

    const oferta = await Oferta.create({
      precio_oferta: data.precio_oferta,
      fecha_inicio: data.fecha_inicio || new Date(),
      fecha_fin: data.fecha_fin,
      productoId: producto.id
    });

    // Sincronizar precio_oferta en el producto para que aparezca al instante en Inicio y Catálogo
    await producto.update({ precio_oferta: data.precio_oferta });

    return res.status(201).json({ ok: true, mensaje: 'Oferta creada y visible en el inicio.', oferta });
  } catch (error) {
    next(error);
  }
};

export const actualizarOferta = async (req, res, next) => {
  try {
    const comercio = await obtenerComercioDelUsuario(req.usuario.id);
    if (!comercio) return res.status(403).json({ ok: false, mensaje: 'No tenés un comercio registrado.' });

    const oferta = await Oferta.findByPk(req.params.id, { include: [{ model: Producto, as: 'producto' }] });
    if (!oferta || oferta.producto.comercioId !== comercio.id) {
      return res.status(404).json({ ok: false, mensaje: 'Oferta no encontrada o no te pertenece.' });
    }

    await oferta.update(req.body);

    if (req.body.precio_oferta) {
      await oferta.producto.update({ precio_oferta: req.body.precio_oferta });
    }

    return res.json({ ok: true, mensaje: 'Oferta actualizada.', oferta });
  } catch (error) {
    next(error);
  }
};

export const eliminarOferta = async (req, res, next) => {
  try {
    const comercio = await obtenerComercioDelUsuario(req.usuario.id);
    if (!comercio) return res.status(403).json({ ok: false, mensaje: 'No tenés un comercio registrado.' });

    const oferta = await Oferta.findByPk(req.params.id, { include: [{ model: Producto, as: 'producto' }] });
    if (!oferta || oferta.producto.comercioId !== comercio.id) {
      return res.status(404).json({ ok: false, mensaje: 'Oferta no encontrada o no te pertenece.' });
    }

    // Al eliminar la oferta, quitar el precio_oferta del producto
    await oferta.producto.update({ precio_oferta: null });
    await oferta.destroy();

    return res.json({ ok: true, mensaje: 'Oferta eliminada y producto restablecido a precio normal.' });
  } catch (error) {
    next(error);
  }
};
