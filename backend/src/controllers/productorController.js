import bcrypt from 'bcryptjs';
import { matchedData } from 'express-validator';
import { Productor } from '../models/Productor.js';
import { Comprador } from '../models/Comprador.js';
import { Producto } from '../models/Producto.js';
import { Transaccion } from '../models/Transaccion.js';
import { Chat } from '../models/Chat.js';
import { Calificacion } from '../models/Calificacion.js';
import { normalizarLista, serializarProductor } from './authController.js';
import { distanciaKm } from '../utils/geo.js';
import { resumenComercios, resumenProductos, adjuntarCalificacion } from '../utils/calificaciones.js';

const incluirProductos = {
  model: Producto,
  as: 'productos',
  attributes: ['id', 'nombre', 'precio', 'precio_oferta', 'stock', 'tipo', 'imagen']
};

const incluirProductosConteo = {
  model: Producto,
  as: 'productos',
  attributes: ['id']
};

const coincideCategoria = (categoriaComercio, filtro) => {
  if (!filtro) return true;
  if (filtro === 'mayorista') return categoriaComercio === 'mayorista' || categoriaComercio === 'ambos';
  if (filtro === 'minorista') return categoriaComercio === 'minorista' || categoriaComercio === 'ambos';
  return categoriaComercio === filtro;
};

const normalizarTexto = (valor) => String(valor || '').trim().toLowerCase();

const prepararComercio = (productor, resumen) => {
  const json = productor.toJSON ? productor.toJSON() : { ...productor };
  if (Array.isArray(json.productos)) {
    json.productos_total = json.productos.length;
    delete json.productos;
  }
  return adjuntarCalificacion(json, resumen);
};

export const listarProductores = async (req, res, next) => {
  try {
    const { q, categoria, tipo, orden } = req.query;

    const productores = await Productor.findAll({
      attributes: { exclude: ['password'] },
      include: [incluirProductosConteo]
    });

    const resumen = await resumenComercios(productores.map((p) => p.id));
    const texto = normalizarTexto(q);

    let data = productores
      .map((p) => prepararComercio(p, resumen))
      .filter((p) => {
        if (!coincideCategoria(p.categoria, categoria)) return false;
        if (tipo && !(p.tipos_productos || []).includes(tipo)) return false;
        if (!texto) return true;
        return [p.nombre, p.nombre_local, p.ubicacion, p.descripcion]
          .some((campo) => normalizarTexto(campo).includes(texto));
      });

    if (orden === 'calificacion') {
      data.sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0));
    } else {
      data.sort((a, b) => String(a.nombre_local).localeCompare(String(b.nombre_local)));
    }

    return res.status(200).json({
      ok: true,
      message: 'Listado de comercios.',
      data,
      total: data.length
    });
  } catch (error) {
    next(error);
  }
};

export const listarCercanos = async (req, res, next) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radio = Number(req.query.radio) || 10;
    const { categoria, tipo, q } = req.query;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        ok: false,
        message: 'Indicá una latitud y longitud válidas.'
      });
    }

    const productores = await Productor.findAll({
      attributes: { exclude: ['password'] },
      include: [incluirProductosConteo]
    });

    const resumen = await resumenComercios(productores.map((p) => p.id));
    const texto = normalizarTexto(q);

    const data = productores
      .map((p) => {
        const json = prepararComercio(p, resumen);
        const distancia = distanciaKm(lat, lng, p.latitud, p.longitud);
        return { ...json, distancia_km: distancia === null ? null : Number(distancia.toFixed(2)) };
      })
      .filter((p) => {
        if (p.distancia_km === null || p.distancia_km > radio) return false;
        if (!coincideCategoria(p.categoria, categoria)) return false;
        if (tipo && !(p.tipos_productos || []).includes(tipo)) return false;
        if (!texto) return true;
        return [p.nombre, p.nombre_local, p.ubicacion, p.descripcion]
          .some((campo) => normalizarTexto(campo).includes(texto));
      })
      .sort((a, b) => a.distancia_km - b.distancia_km);

    return res.status(200).json({
      ok: true,
      message: 'Comercios cercanos a tu ubicación.',
      centro: { lat, lng, radio_km: radio },
      data,
      total: data.length
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerProductor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productor = await Productor.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [incluirProductos]
    });

    if (!productor) {
      return res.status(404).json({
        ok: false,
        message: 'Comercio no encontrado.'
      });
    }

    const [resumenComercio, resumenProducto, calificaciones] = await Promise.all([
      resumenComercios([productor.id]),
      resumenProductos((productor.productos || []).map((p) => p.id)),
      Calificacion.findAll({
        where: { productor_id: productor.id },
        include: [{ model: Comprador, as: 'usuario', attributes: ['id', 'nombre'] }],
        order: [['fecha', 'DESC']],
        limit: 10
      })
    ]);

    const data = adjuntarCalificacion(productor.toJSON(), resumenComercio);
    data.productos = (data.productos || []).map((p) => adjuntarCalificacion(p, resumenProducto));
    data.ultimas_calificaciones = calificaciones;

    return res.status(200).json({
      ok: true,
      message: 'Comercio obtenido.',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarProductor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = matchedData(req);

    const productor = await Productor.findByPk(id);
    if (!productor) {
      return res.status(404).json({
        ok: false,
        message: 'Comercio no encontrado.'
      });
    }

    if (Number(req.usuario.id) !== productor.id) {
      return res.status(403).json({
        ok: false,
        message: 'Solo puedes modificar tu propio perfil.'
      });
    }

    const cambios = {};
    const campos = [
      'nombre',
      'nombre_local',
      'telefono',
      'ubicacion',
      'latitud',
      'longitud',
      'categoria',
      'descripcion',
      'suscripcion'
    ];

    campos.forEach((campo) => {
      if (data[campo] !== undefined) cambios[campo] = data[campo];
    });

    if (data.tipos_productos !== undefined) {
      cambios.tipos_productos = normalizarLista(data.tipos_productos);
    }
    if (data.fotos !== undefined) {
      cambios.fotos = normalizarLista(data.fotos);
    }
    if (data.password) {
      cambios.password = await bcrypt.hash(data.password, 10);
    }

    await productor.update(cambios);

    return res.status(200).json({
      ok: true,
      message: 'Perfil del comercio actualizado correctamente.',
      data: serializarProductor(productor)
    });
  } catch (error) {
    next(error);
  }
};

export const eliminarProductor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productor = await Productor.findByPk(id);
    if (!productor) {
      return res.status(404).json({
        ok: false,
        message: 'Comercio no encontrado.'
      });
    }

    if (Number(req.usuario.id) !== productor.id) {
      return res.status(403).json({
        ok: false,
        message: 'Solo puedes eliminar tu propio perfil.'
      });
    }

    await productor.destroy();

    return res.status(200).json({
      ok: true,
      message: 'Comercio eliminado correctamente (soft delete).'
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerEstadisticas = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.usuario.rol !== 'productor' || Number(req.usuario.id) !== Number(id)) {
      return res.status(403).json({
        ok: false,
        message: 'Solo podés consultar las estadísticas de tu propio comercio.'
      });
    }

    const productor = await Productor.findByPk(id);
    if (!productor) {
      return res.status(404).json({
        ok: false,
        message: 'Comercio no encontrado.'
      });
    }

    const [productos, transacciones, chats, resumen] = await Promise.all([
      Producto.count({ where: { productor_id: id } }),
      Transaccion.count({ where: { productor_id: id } }),
      Chat.count({ where: { productor_id: id } }),
      resumenComercios([Number(id)])
    ]);

    return res.status(200).json({
      ok: true,
      message: 'Estadísticas del comercio.',
      data: {
        productos,
        transacciones,
        chats,
        calificacion: resumen[id]?.promedio ?? null,
        calificaciones_total: resumen[id]?.total ?? 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const listaCompradoresVinculados = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.usuario.rol !== 'productor' || Number(req.usuario.id) !== Number(id)) {
      return res.status(403).json({
        ok: false,
        message: 'Solo podés consultar tus propios compradores vinculados.'
      });
    }

    const compradores = await Comprador.findAll({
      attributes: ['id', 'nombre', 'email', 'tipo', 'ubicacion'],
      include: [
        {
          model: Productor,
          as: 'productores',
          where: { id },
          attributes: []
        }
      ]
    });

    return res.status(200).json({
      ok: true,
      message: 'Compradores conectados al comercio por transacciones.',
      data: compradores
    });
  } catch (error) {
    next(error);
  }
};
