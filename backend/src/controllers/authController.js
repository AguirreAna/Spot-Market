// Controlador de autenticación de SpotMarket.
// Maneja registro (usuario/comerciante), login, logout y sesión actual.
// El JWT se guarda en una cookie httpOnly para máxima seguridad.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { matchedData } from 'express-validator';
import { db } from '../models/index.js';
import { env } from '../config/env.js';
import { cookieJwtOpciones, NOMBRE_COOKIE_JWT } from '../utils/cookie.js';
import { guardarImagen } from '../utils/imageStorage.js';

const { Usuario, Comercio, FotoComercio, sequelize } = db;

const generarToken = (usuario) =>
  jwt.sign({ id: usuario.id, rol: usuario.rol, email: usuario.email }, env.JWT_SECRET, {
    expiresIn: '8h'
  });

const datosUsuarioPublicos = (usuario) => ({
  id: usuario.id,
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol
});

export const registrar = async (req, res, next) => {
  try {
    const data = matchedData(req);
    const email = data.email.toLowerCase();

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(409).json({ ok: false, mensaje: 'El correo ya está registrado.' });
    }

    const hash = await bcrypt.hash(data.password, 10);
    const usuario = await Usuario.create({
      nombre: data.nombre,
      email,
      password: hash,
      rol: 'usuario'
    });

    const token = generarToken(usuario);
    res.cookie(NOMBRE_COOKIE_JWT, token, cookieJwtOpciones());

    return res.status(201).json({
      ok: true,
      mensaje: 'Cuenta creada correctamente.',
      usuario: datosUsuarioPublicos(usuario)
    });
  } catch (error) {
    next(error);
  }
};

export const registrarComercio = async (req, res, next) => {
  // Transacción Sequelize atómica: si algo falla, no queda creado el usuario huérfano.
  const t = await sequelize.transaction();

  try {
    const data = matchedData(req);
    const email = data.email.toLowerCase();

    const existe = await Usuario.findOne({ where: { email }, transaction: t });
    if (existe) {
      await t.rollback();
      return res.status(409).json({ ok: false, mensaje: 'El correo ya está registrado.' });
    }

    // 1. Crear el usuario con rol comerciante
    const hash = await bcrypt.hash(data.password, 10);
    const usuario = await Usuario.create(
      {
        nombre: data.nombre,
        email,
        password: hash,
        rol: 'comerciante'
      },
      { transaction: t }
    );

    // 2. Normalizar categorías de productos
    const rawCategorias = req.body.categoria_productos || req.body.tipos_productos || data.categoria_productos || data.tipos_productos;
    const categoriaProductos = Array.isArray(rawCategorias)
      ? rawCategorias.join(', ')
      : rawCategorias || null;

    // Normalizar tipo de comercio a minorista o mayorista
    const tipoComercio = (data.tipo_comercio || 'minorista').toString().toLowerCase().trim();

    // 3. Crear el comercio asociado
    const comercio = await Comercio.create(
      {
        nombre_local: data.nombre_local,
        tipo_comercio: tipoComercio,
        categoria_productos: categoriaProductos,
        tipos_productos: categoriaProductos,
        telefono: data.telefono || null,
        email,
        direccion: data.direccion || null,
        latitud: data.latitud || null,
        longitud: data.longitud || null,
        usuarioId: usuario.id
      },
      { transaction: t }
    );

    // 4. Guardar fotos de fachada/local (con fallback local automático para que se vean siempre)
    const archivos = req.files || [];
    for (const archivo of archivos) {
      const subida = await guardarImagen(archivo, 'comercios');
      if (subida && subida.url) {
        await FotoComercio.create(
          {
            url: subida.url,
            public_id: subida.public_id,
            comercioId: comercio.id
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    const token = generarToken(usuario);
    res.cookie(NOMBRE_COOKIE_JWT, token, cookieJwtOpciones());

    return res.status(201).json({
      ok: true,
      mensaje: 'Comercio registrado correctamente.',
      usuario: {
        ...datosUsuarioPublicos(usuario),
        comercioId: comercio.id,
        nombre_local: comercio.nombre_local,
        tipo_comercio: comercio.tipo_comercio
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Error en registrarComercio:', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = matchedData(req);
    const usuario = await Usuario.findOne({
      where: { email: email.toLowerCase() },
      include: [{ model: Comercio, as: 'comercio', attributes: ['id', 'nombre_local', 'tipo_comercio'] }]
    });

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas.' });
    }

    const token = generarToken(usuario);
    res.cookie(NOMBRE_COOKIE_JWT, token, cookieJwtOpciones());

    const payload = { ...datosUsuarioPublicos(usuario) };
    if (usuario.comercio) {
      payload.comercioId = usuario.comercio.id;
      payload.nombre_local = usuario.comercio.nombre_local;
      payload.tipo_comercio = usuario.comercio.tipo_comercio;
    }

    return res.status(200).json({ ok: true, mensaje: 'Inicio de sesión correcto.', usuario: payload });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie(NOMBRE_COOKIE_JWT, { ...cookieJwtOpciones(), maxAge: undefined });
  return res.status(200).json({ ok: true, mensaje: 'Sesión cerrada.' });
};

export const me = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: ['id', 'nombre', 'email', 'rol'],
      include: [
        {
          model: Comercio,
          as: 'comercio',
          attributes: ['id', 'nombre_local', 'tipo_comercio', 'categoria_productos', 'tipos_productos', 'direccion', 'telefono']
        }
      ]
    });
    if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    return res.json({ ok: true, usuario });
  } catch (error) {
    next(error);
  }
};
