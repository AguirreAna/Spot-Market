import { matchedData } from 'express-validator';
import { Op } from 'sequelize';
import { Producto } from '../models/Producto.js';
import { Productor } from '../models/Productor.js';
import { resumenComercios, resumenProductos, adjuntarCalificacion } from '../utils/calificaciones.js';

const incluirProductor = {
  model: Productor,
  as: 'productor',
  attributes: [
    'id',
    'nombre',
    'nombre_local',
    'telefono',
    'ubicacion',
    'latitud',
    'longitud',
    'categoria',
    'tipos_productos',
    'fotos'
  ]
};

const categoriasEquivalentes = (categoria) => {
  if (categoria === 'mayorista') return ['mayorista', 'ambos'];
  if (categoria === 'minorista') return ['minorista', 'ambos'];
  return [categoria];
};

export const listarProductos = async (req, res, next) => {
  try {
    const {
      productor_id,
      en_stock,
      tipo,
      categoria,
      q,
      precio_min,
      precio_max,
      orden
    } = req.query;

    const where = {};
    if (productor_id) where.productor_id = productor_id;
    if (en_stock === 'true') where.stock = { [Op.gt]: 0 };
    if (tipo) where.tipo = tipo;

    if (precio_min !== undefined || precio_max !== undefined) {
      where.precio = {};
      if (precio_min !== undefined && precio_min !== '') where.precio[Op.gte] = Number(precio_min);
      if (precio_max !== undefined && precio_max !== '') where.precio[Op.lte] = Number(precio_max);
    }

    if (q) {
      const texto = `%${String(q).trim()}%`;
      where[Op.or] = [
        { nombre: { [Op.like]: texto } },
        { descripcion: { [Op.like]: texto } },
        { especificacion: { [Op.like]: texto } }
      ];
    }

    const incluir = { ...incluirProductor };
    if (categoria) {
      incluir.where = { categoria: { [Op.in]: categoriasEquivalentes(categoria) } };
      incluir.required = true;
    }

    let order = [['createdAt', 'DESC']];
    if (orden === 'precio_asc') order = [['precio', 'ASC']];
    if (orden === 'precio_desc') order = [['precio', 'DESC']];

    const productos = await Producto.findAll({ where, include: [incluir], order });

    const [resumenP, resumenC] = await Promise.all([
      resumenProductos(productos.map((p) => p.id)),
      resumenComercios([...new Set(productos.map((p) => p.productor_id))])
    ]);

    let data = productos.map((p) => {
      const json = adjuntarCalificacion(p.toJSON(), resumenP);
      if (json.productor) {
        json.productor = adjuntarCalificacion(json.productor, resumenC);
      }
      return json;
    });

    if (orden === 'calificacion') {
      data.sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0));
    }

    return res.status(200).json({
      ok: true,
      message: 'Listado de productos.',
      data,
      total: data.length
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerProducto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id, {
      include: [incluirProductor]
    });

    if (!producto) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado.'
      });
    }

    const [resumenP, resumenC] = await Promise.all([
      resumenProductos([producto.id]),
      resumenComercios([producto.productor_id])
    ]);

    const data = adjuntarCalificacion(producto.toJSON(), resumenP);
    if (data.productor) {
      data.productor = adjuntarCalificacion(data.productor, resumenC);
    }

    return res.status(200).json({
      ok: true,
      message: 'Producto obtenido.',
      data
    });
  } catch (error) {
    next(error);
  }
};

export const crearProducto = async (req, res, next) => {
  try {
    const data = matchedData(req);

    const productor = await Productor.findByPk(req.usuario.id);
    if (!productor) {
      return res.status(400).json({
        ok: false,
        message: 'No se puede publicar un producto sin un comercio asignado.'
      });
    }

    const producto = await Producto.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
      especificacion: data.especificacion || null,
      tipo: data.tipo || null,
      imagen: data.imagen || null,
      precio: data.precio,
      precio_oferta: data.precio_oferta || null,
      stock: data.stock,
      productor_id: productor.id
    });

    return res.status(201).json({
      ok: true,
      message: 'Producto publicado correctamente.',
      data: producto
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = matchedData(req);

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado.'
      });
    }

    if (Number(req.usuario.id) !== producto.productor_id) {
      return res.status(403).json({
        ok: false,
        message: 'Solo el comercio dueño del producto puede modificarlo.'
      });
    }

    const cambios = {};
    ['nombre', 'descripcion', 'especificacion', 'tipo', 'imagen', 'precio', 'precio_oferta', 'stock'].forEach(
      (campo) => {
        if (data[campo] !== undefined) cambios[campo] = data[campo];
      }
    );

    await producto.update(cambios);

    return res.status(200).json({
      ok: true,
      message: 'Producto actualizado correctamente.',
      data: producto
    });
  } catch (error) {
    next(error);
  }
};

export const eliminarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado.'
      });
    }

    if (Number(req.usuario.id) !== producto.productor_id) {
      return res.status(403).json({
        ok: false,
        message: 'Solo el comercio dueño del producto puede eliminarlo.'
      });
    }

    await producto.destroy();

    return res.status(200).json({
      ok: true,
      message: 'Producto eliminado correctamente (soft delete).'
    });
  } catch (error) {
    next(error);
  }
};
