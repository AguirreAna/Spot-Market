// Controlador de ofertas temporales para SpotMarket.
// Sincroniza automáticamente el precio_oferta del producto para que se vea en el Inicio.
import { db } from '../models/index.js';

const { Oferta, Producto, Comercio } = db;

const obtenerComercioDelUsuario = async (usuarioId) => {
  return await Comercio.findOne({ where: { usuarioId } });
};

const productoDelComercio = async (productoId, comercioId) => {
  return await Producto.findOne({ where: { id: productoId, comercioId } });
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
          where: { comercioId: comercio.id },
          attributes: ['id', 'nombre', 'precio', 'imagen_url', 'categoria']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ ok: true, ofertas });
  } catch (error) {
    next(error);
  }
};

export const listarOfertasVigentes = async (req, res, next) => {
  try {
    const ofertas = await Oferta.findAll({
      include: [
        {
          model: Producto,
          as: 'producto',
          include: [{ model: Comercio, as: 'comercio', attributes: ['id', 'nombre_local', 'direccion', 'telefono'] }]
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

    const productoId = parseInt(req.body.productoId || req.body.producto_id, 10);
    const precio_oferta = parseFloat(req.body.precio_oferta);
    if (isNaN(productoId) || isNaN(precio_oferta)) {
      return res.status(400).json({ ok: false, mensaje: 'Producto y precio de oferta inválidos.' });
    }

    const producto = await productoDelComercio(productoId, comercio.id);
    if (!producto) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado o no te pertenece.' });

    const fecha_inicio = req.body.fecha_inicio ? new Date(req.body.fecha_inicio) : new Date();
    const fecha_fin = req.body.fecha_fin ? new Date(req.body.fecha_fin) : new Date(Date.now() + 7 * 86400000);

    const oferta = await Oferta.create({
      precio_oferta,
      fecha_inicio,
      fecha_fin,
      productoId: producto.id
    });

    // Sincronizar precio_oferta en el producto para que aparezca al instante en Inicio y Catálogo
    await producto.update({ precio_oferta });

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
    if (!oferta || oferta.producto?.comercioId !== comercio.id) {
      return res.status(404).json({ ok: false, mensaje: 'Oferta no encontrada o no te pertenece.' });
    }

    const updates = {};
    if (req.body.precio_oferta != null) updates.precio_oferta = parseFloat(req.body.precio_oferta);
    if (req.body.fecha_fin) updates.fecha_fin = new Date(req.body.fecha_fin);
    if (req.body.fecha_inicio) updates.fecha_inicio = new Date(req.body.fecha_inicio);

    await oferta.update(updates);

    if (updates.precio_oferta != null) {
      await oferta.producto.update({ precio_oferta: updates.precio_oferta });
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
    if (!oferta || oferta.producto?.comercioId !== comercio.id) {
      return res.status(404).json({ ok: false, mensaje: 'Oferta no encontrada o no te pertenece.' });
    }

    // Al eliminar la oferta, quitar el precio_oferta del producto
    await oferta.producto.update({ precio_oferta: null });
    await oferta.destroy();

    return res.json({ ok: true, mensaje: 'Oferta eliminada correctamente.' });
  } catch (error) {
    next(error);
  }
};
