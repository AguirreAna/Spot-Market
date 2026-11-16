// Controlador de autenticación de SpotMarket.
// Maneja registro (usuario/comerciante), login, logout y sesión actual (/me).
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
    const data = { ...req.body, ...matchedData(req) };
    const email = (data.email || '').toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ ok: false, mensaje: 'El correo electrónico es obligatorio.' });
    }

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
  // Transacción atómica: si cualquier paso falla, se revierte y no queda correo bloqueado
  const t = await sequelize.transaction();

  try {
    const data = { ...req.body, ...matchedData(req) };
    const email = (data.email || '').toLowerCase().trim();

    if (!email) {
      await t.rollback();
      return res.status(400).json({ ok: false, mensaje: 'El correo electrónico es obligatorio.' });
    }

    if (!data.password || data.password.length < 6) {
      await t.rollback();
      return res.status(400).json({ ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    if (!data.nombre_local) {
      await t.rollback();
      return res.status(400).json({ ok: false, mensaje: 'El nombre del local comercial es obligatorio.' });
    }

    const existe = await Usuario.findOne({ where: { email }, transaction: t });
    if (existe) {
      await t.rollback();
      return res.status(409).json({ ok: false, mensaje: 'El correo ya está registrado.' });
    }

    // 1. Crear el usuario
    const hash = await bcrypt.hash(data.password, 10);
    const usuario = await Usuario.create(
      {
        nombre: data.nombre || data.nombre_local,
        email,
        password: hash,
        rol: 'comerciante'
      },
      { transaction: t }
    );

    // 2. Normalizar categorías
    const rawCategorias = data.categoria_productos || data.tipos_productos || req.body.categoria_productos || req.body.tipos_productos;
    const categoriaProductos = Array.isArray(rawCategorias)
      ? rawCategorias.join(', ')
      : (rawCategorias ? String(rawCategorias) : 'Almacén');

    // 3. Normalizar tipo de comercio
    const rawTipo = data.tipo_comercio || req.body.tipo_comercio || 'Minorista';
    const tipoComercio = String(rawTipo).trim();

    // 4. Crear el comercio
    const comercio = await Comercio.create(
      {
        nombre_local: data.nombre_local,
        tipo_comercio: tipoComercio,
        categoria_productos: categoriaProductos,
        tipos_productos: categoriaProductos,
        telefono: data.telefono || null,
        whatsapp: data.whatsapp || data.telefono || null,
        horario_atencion: data.horario_atencion || 'Lunes a Sábado 8:00 - 21:00',
        email,
        direccion: data.direccion || 'Formosa Capital',
        latitud: data.latitud ? parseFloat(data.latitud) : -26.1849,
        longitud: data.longitud ? parseFloat(data.longitud) : -58.1731,
        usuarioId: usuario.id
      },
      { transaction: t }
    );

    // 5. Guardar fotos de fachada si se adjuntaron
    const archivos = req.files || [];
    for (const archivo of archivos) {
      const guardada = await guardarImagen(archivo, 'comercios');
      if (guardada && guardada.url) {
        await FotoComercio.create(
          {
            url: guardada.url,
            public_id: guardada.public_id,
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
        tipo_comercio: comercio.tipo_comercio,
        comercio
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
    const data = { ...req.body, ...matchedData(req) };
    const email = (data.email || '').toLowerCase().trim();
    const password = data.password;

    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ model: Comercio, as: 'comercio' }]
    });

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas.' });
    }

    const token = generarToken(usuario);
    res.cookie(NOMBRE_COOKIE_JWT, token, cookieJwtOpciones());

    const payload = {
      ...datosUsuarioPublicos(usuario),
      comercioId: usuario.comercio ? usuario.comercio.id : null,
      nombre_local: usuario.comercio ? usuario.comercio.nombre_local : null,
      tipo_comercio: usuario.comercio ? usuario.comercio.tipo_comercio : null,
      comercio: usuario.comercio
    };

    return res.status(200).json({ ok: true, mensaje: 'Inicio de sesión correcto.', usuario: payload });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie(NOMBRE_COOKIE_JWT, { ...cookieJwtOpciones(), maxAge: undefined });
  return res.status(200).json({ ok: true, mensaje: 'Sesión cerrada.' });
};

export const recuperarPassword = async (req, res, next) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ ok: false, mensaje: 'Por favor ingresá tu correo electrónico.' });
    }
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ ok: false, mensaje: 'No encontramos ninguna cuenta registrada con ese correo.' });
    }
    // Si envían una nueva contraseña, la actualizamos directamente (recuperación asistida)
    if (req.body.nuevaPassword && req.body.nuevaPassword.length >= 6) {
      const hash = await bcrypt.hash(req.body.nuevaPassword, 10);
      await usuario.update({ password: hash });
      return res.json({
        ok: true,
        mensaje: 'Tu contraseña fue restablecida con éxito. Ya podés iniciar sesión.'
      });
    }
    return res.json({
      ok: true,
      mensaje: `Te enviamos las instrucciones de recuperación al correo ${email}. También podés definir una nueva contraseña aquí mismo.`
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: ['id', 'nombre', 'email', 'rol'],
      include: [
        {
          model: Comercio,
          as: 'comercio',
          include: [{ model: FotoComercio, as: 'fotos' }]
        }
      ]
    });
    if (!usuario) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });

    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      comercioId: usuario.comercio ? usuario.comercio.id : null,
      nombre_local: usuario.comercio ? usuario.comercio.nombre_local : null,
      tipo_comercio: usuario.comercio ? usuario.comercio.tipo_comercio : null,
      comercio: usuario.comercio
    };

    return res.json({ ok: true, usuario: payload });
  } catch (error) {
    next(error);
  }
};
