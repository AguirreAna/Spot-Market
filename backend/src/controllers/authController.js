import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { matchedData } from 'express-validator';
import { Productor } from '../models/Productor.js';
import { Comprador } from '../models/Comprador.js';
import { env } from '../config/env.js';

const generarToken = (usuario, rol) => {
  return jwt.sign(
    { id: usuario.id, rol, email: usuario.email },
    env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

export const normalizarLista = (valor) => {
  if (Array.isArray(valor)) {
    return [...new Set(valor.map((v) => String(v).trim()).filter(Boolean))];
  }
  return [...new Set(String(valor || '').split(',').map((v) => v.trim()).filter(Boolean))];
};

export const serializarProductor = (productor) => ({
  id: productor.id,
  nombre: productor.nombre,
  nombre_local: productor.nombre_local,
  email: productor.email,
  telefono: productor.telefono,
  ubicacion: productor.ubicacion,
  latitud: productor.latitud,
  longitud: productor.longitud,
  categoria: productor.categoria,
  tipos_productos: productor.tipos_productos || [],
  fotos: productor.fotos || [],
  descripcion: productor.descripcion,
  suscripcion: productor.suscripcion
});

export const serializarComprador = (comprador) => ({
  id: comprador.id,
  nombre: comprador.nombre,
  email: comprador.email,
  telefono: comprador.telefono,
  tipo: comprador.tipo,
  ubicacion: comprador.ubicacion
});

export const registrarProductor = async (req, res, next) => {
  try {
    const data = matchedData(req);
    const email = data.email.toLowerCase();

    const [existeProductor, existeComprador] = await Promise.all([
      Productor.findOne({ where: { email } }),
      Comprador.findOne({ where: { email } })
    ]);

    if (existeProductor || existeComprador) {
      return res.status(409).json({
        ok: false,
        message: 'El email ya se encuentra registrado.'
      });
    }

    const hash = await bcrypt.hash(data.password, 10);
    const productor = await Productor.create({
      nombre: data.nombre,
      nombre_local: data.nombre_local,
      email,
      telefono: data.telefono,
      password: hash,
      ubicacion: data.ubicacion,
      latitud: data.latitud || null,
      longitud: data.longitud || null,
      categoria: data.categoria,
      tipos_productos: normalizarLista(data.tipos_productos),
      fotos: normalizarLista(data.fotos),
      descripcion: data.descripcion || null,
      suscripcion: data.suscripcion || 'estandar'
    });

    const token = generarToken(productor, 'productor');

    return res.status(201).json({
      ok: true,
      message: 'Comercio registrado correctamente.',
      token,
      rol: 'productor',
      usuario: serializarProductor(productor)
    });
  } catch (error) {
    next(error);
  }
};

export const registrarComprador = async (req, res, next) => {
  try {
    const data = matchedData(req);
    const email = data.email.toLowerCase();

    const [existeComprador, existeProductor] = await Promise.all([
      Comprador.findOne({ where: { email } }),
      Productor.findOne({ where: { email } })
    ]);

    if (existeComprador || existeProductor) {
      return res.status(409).json({
        ok: false,
        message: 'El email ya se encuentra registrado.'
      });
    }

    const hash = await bcrypt.hash(data.password, 10);
    const comprador = await Comprador.create({
      nombre: data.nombre,
      email,
      telefono: data.telefono || null,
      password: hash,
      tipo: data.tipo,
      ubicacion: data.ubicacion
    });

    const token = generarToken(comprador, 'comprador');

    return res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente.',
      token,
      rol: 'comprador',
      usuario: serializarComprador(comprador)
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = matchedData(req);
    const emailNormalizado = email.toLowerCase();

    const [productor, comprador] = await Promise.all([
      Productor.findOne({ where: { email: emailNormalizado } }),
      Comprador.findOne({ where: { email: emailNormalizado } })
    ]);

    if (productor && (await bcrypt.compare(password, productor.password))) {
      const token = generarToken(productor, 'productor');
      return res.status(200).json({
        ok: true,
        message: 'Inicio de sesión correcto.',
        token,
        rol: 'productor',
        usuario: serializarProductor(productor)
      });
    }

    if (comprador && (await bcrypt.compare(password, comprador.password))) {
      const token = generarToken(comprador, 'comprador');
      return res.status(200).json({
        ok: true,
        message: 'Inicio de sesión correcto.',
        token,
        rol: 'comprador',
        usuario: serializarComprador(comprador)
      });
    }

    return res.status(401).json({
      ok: false,
      message: 'Credenciales inválidas.'
    });
  } catch (error) {
    next(error);
  }
};
