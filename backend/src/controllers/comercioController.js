// Controlador de comercios: listado, detalle, cercanos (Haversine), mi comercio y ranking de productos.
import { db } from '../models/index.js';
import { distanciaKm } from '../utils/haversine.js';

const { Comercio, FotoComercio, Producto, Oferta, Valoracion, Usuario } = db;

export const listarComercios = async (req, res, next) => {
  try {
    const comercios = await Comercio.findAll({
      include: [
        { model: FotoComercio, as: 'fotos', attributes: ['id', 'url'] },
        { model: Producto, as: 'productos', attributes: ['id', 'nombre', 'precio', 'precio_oferta', 'imagen_url', 'categoria'] }
      ],
      order: [['nombre_local', 'ASC']]
    });
    return res.json({ ok: true, comercios });
  } catch (error) {
    next(error);
  }
};

export const obtenerComercio = async (req, res, next) => {
  try {
    const comercio = await Comercio.findByPk(req.params.id, {
      include: [
        { model: FotoComercio, as: 'fotos', attributes: ['id', 'url'] },
        {
          model: Producto,
          as: 'productos',
          include: [
            { model: Oferta, as: 'ofertas' },
            { model: Valoracion, as: 'valoraciones', include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }] }
          ]
        }
      ]
    });
    if (!comercio) return res.status(404).json({ ok: false, mensaje: 'Comercio no encontrado.' });
    return res.json({ ok: true, comercio });
  } catch (error) {
    next(error);
  }
};

export const obtenerMiComercio = async (req, res, next) => {
  try {
    const comercio = await Comercio.findOne({
      where: { usuarioId: req.usuario.id },
      include: [
        { model: FotoComercio, as: 'fotos' },
        {
          model: Producto,
          as: 'productos',
          include: [
            { model: Oferta, as: 'ofertas' },
            { model: Valoracion, as: 'valoraciones', include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }] }
          ]
        }
      ]
    });
    if (!comercio) return res.status(404).json({ ok: false, mensaje: 'No tenés un comercio registrado.' });
    return res.json({ ok: true, comercio });
  } catch (error) {
    next(error);
  }
};

export const comerciosCercanos = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radio = parseFloat(req.query.radio) || 15;
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ ok: false, mensaje: 'Indicá lat y lng válidos.' });
    }
    const comercios = await Comercio.findAll({
      include: [{ model: FotoComercio, as: 'fotos', attributes: ['id', 'url'] }]
    });
    const cercanos = comercios
      .filter((c) => c.latitud != null && c.longitud != null)
      .map((c) => {
        const d = distanciaKm(lat, lng, parseFloat(c.latitud), parseFloat(c.longitud));
        return { ...c.toJSON(), distancia: Math.round(d * 100) / 100 };
      })
      .filter((c) => c.distancia <= radio)
      .sort((a, b) => a.distancia - b.distancia);
    return res.json({ ok: true, comercios: cercanos });
  } catch (error) {
    next(error);
  }
};

export const actualizarComercio = async (req, res, next) => {
  try {
    const comercio = await Comercio.findByPk(req.params.id);
    if (!comercio) return res.status(404).json({ ok: false, mensaje: 'Comercio no encontrado.' });
    if (comercio.usuarioId !== req.usuario.id) {
      return res.status(403).json({ ok: false, mensaje: 'No podés editar este comercio.' });
    }
    const campos = [
      'nombre_local', 'tipo_comercio', 'categoria_productos', 'tipos_productos',
      'telefono', 'whatsapp', 'horario_atencion', 'email', 'direccion', 'latitud', 'longitud'
    ];
    const datos = {};
    for (const c of campos) if (req.body[c] !== undefined) datos[c] = req.body[c];
    await comercio.update(datos);
    return res.json({ ok: true, mensaje: 'Comercio actualizado correctamente.', comercio });
  } catch (error) {
    next(error);
  }
};

export const masBuscados = async (req, res, next) => {
  try {
    const comercio = await Comercio.findOne({ where: { usuarioId: req.usuario.id } });
    if (!comercio) return res.status(403).json({ ok: false, mensaje: 'No tenés un comercio registrado.' });
    const productos = await Producto.findAll({
      where: { comercioId: comercio.id },
      order: [
        ['vistas', 'DESC'],
        ['likes', 'DESC']
      ],
      limit: 10,
      include: [
        {
          model: Valoracion,
          as: 'valoraciones',
          attributes: ['id', 'puntuacion', 'comentario'],
          include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }]
        }
      ]
    });
    return res.json({ ok: true, productos });
  } catch (error) {
    next(error);
  }
};
