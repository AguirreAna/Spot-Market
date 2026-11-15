import bcrypt from 'bcryptjs';
import { sequelize } from './config/db.js';
import { Productor } from './models/Productor.js';
import { Producto } from './models/Producto.js';
import { Comprador } from './models/Comprador.js';
import { Transaccion } from './models/Transaccion.js';
import { Chat } from './models/Chat.js';
import { Calificacion } from './models/Calificacion.js';
import './models/index.js';

const limpiar = async () => {
  await Calificacion.destroy({ where: {}, force: true });
  await Transaccion.destroy({ where: {}, force: true });
  await Chat.destroy({ where: {}, force: true });
  await Producto.destroy({ where: {}, force: true });
  await Productor.destroy({ where: {}, force: true });
  await Comprador.destroy({ where: {}, force: true });
};

const foto = (seed) => `https://picsum.photos/seed/spotmarket-${seed}/640/420`;

const crearDatos = async () => {
  const hash = await bcrypt.hash('123456', 10);

  const comercio1 = await Productor.create({
    nombre: 'Juan Pérez',
    nombre_local: 'Almacén Don Juan',
    email: 'juan@spotmarket.com',
    telefono: '+54 370 412-3456',
    password: hash,
    ubicacion: 'Av. 25 de Mayo 540, Formosa Capital',
    latitud: -26.1775,
    longitud: -58.1781,
    categoria: 'minorista',
    tipos_productos: ['almacen', 'fiambreria', 'lacteos', 'bebidas'],
    fotos: [foto('almacen')],
    descripcion: 'Almacén de barrio con atención personalizada y productos frescos todos los días.',
    suscripcion: 'premium'
  });

  const comercio2 = await Productor.create({
    nombre: 'María López',
    nombre_local: 'Distribuidora María',
    email: 'maria@spotmarket.com',
    telefono: '+54 370 455-9087',
    password: hash,
    ubicacion: 'Ruta 11 Km 3, Formosa Capital',
    latitud: -26.1902,
    longitud: -58.1895,
    categoria: 'mayorista',
    tipos_productos: ['fruteria', 'verduleria', 'almacen', 'bebidas'],
    fotos: [foto('distribuidora')],
    descripcion: 'Venta mayorista de frutas y verduras para comercios y ferias.',
    suscripcion: 'premium'
  });

  const comercio3 = await Productor.create({
    nombre: 'Pedro Gómez',
    nombre_local: 'Kiosco El Sol',
    email: 'pedro@spotmarket.com',
    telefono: '+54 370 488-1122',
    password: hash,
    ubicacion: 'Calle Brandsen 120, Formosa Capital',
    latitud: -26.181,
    longitud: -58.1725,
    categoria: 'minorista',
    tipos_productos: ['kiosco', 'maxikiosco', 'libreria', 'dulceria'],
    fotos: [foto('kiosco')],
    descripcion: 'Kiosco y librería con golosinas, útiles y bebidas frías.',
    suscripcion: 'estandar'
  });

  const comercio4 = await Productor.create({
    nombre: 'Carla Benítez',
    nombre_local: 'Panadería La Espiga',
    email: 'carla@spotmarket.com',
    telefono: '+54 370 499-7788',
    password: hash,
    ubicacion: 'Calle Sarmiento 875, Formosa Capital',
    latitud: -26.1712,
    longitud: -58.183,
    categoria: 'minorista',
    tipos_productos: ['panaderia', 'dulceria', 'lacteos'],
    fotos: [foto('panaderia')],
    descripcion: 'Pan casero, facturas y tortas artesanales.',
    suscripcion: 'estandar'
  });

  const usuario1 = await Comprador.create({
    nombre: 'Sofía Ramírez',
    email: 'vecino@spotmarket.com',
    telefono: '+54 370 400-1000',
    password: hash,
    tipo: 'vecino',
    ubicacion: 'Formosa Capital'
  });

  const usuario2 = await Comprador.create({
    nombre: 'Restaurante Sabores',
    email: 'resto@spotmarket.com',
    telefono: '+54 370 400-2000',
    password: hash,
    tipo: 'restaurante',
    ubicacion: 'Formosa Capital'
  });

  const producto1 = await Producto.create({
    nombre: 'Tomate perita',
    descripcion: 'Tomate perita fresco de estación, ideal para salsas y ensaladas.',
    especificacion: 'Cajón de 10 kg. Origen Formosa. Calibre medio. Sin agroquímicos.',
    tipo: 'verduleria',
    imagen: foto('tomate'),
    precio: 1800,
    precio_oferta: 1500,
    stock: 120,
    productor_id: comercio2.id
  });

  const producto2 = await Producto.create({
    nombre: 'Mango criollo',
    descripcion: 'Mango dulce cosechado en Clorinda, punto justo de maduración.',
    especificacion: 'Caja de 8 kg. Fruta seleccionada. Disponible por temporada.',
    tipo: 'fruteria',
    imagen: foto('mango'),
    precio: 3200,
    precio_oferta: 2800,
    stock: 60,
    productor_id: comercio2.id
  });

  const producto3 = await Producto.create({
    nombre: 'Pan casero',
    descripcion: 'Pan de campo recién horneado, elaborado con masa madre.',
    especificacion: 'Unidad de 800 g. Horneado diario. Sin conservantes.',
    tipo: 'panaderia',
    imagen: foto('pan'),
    precio: 1200,
    precio_oferta: null,
    stock: 40,
    productor_id: comercio4.id
  });

  const producto4 = await Producto.create({
    nombre: 'Combo golosinas',
    descripcion: 'Pack surtido de golosinas y chocolates para cumpleaños.',
    especificacion: 'Bolsa de 1 kg con 25 unidades surtidas.',
    tipo: 'kiosco',
    imagen: foto('golosinas'),
    precio: 4500,
    precio_oferta: 3900,
    stock: 30,
    productor_id: comercio3.id
  });

  const producto5 = await Producto.create({
    nombre: 'Yerba mate compuesta',
    descripcion: 'Yerba mate de elaboración propia con hierbas serranas.',
    especificacion: 'Paquete de 1 kg. Ideal para comercios y revendedores.',
    tipo: 'almacen',
    imagen: foto('yerba'),
    precio: 2600,
    precio_oferta: 2200,
    stock: 200,
    productor_id: comercio1.id
  });

  await Calificacion.bulkCreate([
    { usuario_id: usuario1.id, productor_id: comercio1.id, puntaje: 5, comentario: 'Muy buena atención y precios justos.' },
    { usuario_id: usuario2.id, productor_id: comercio1.id, puntaje: 4, comentario: 'Siempre tienen lo que necesito.' },
    { usuario_id: usuario1.id, productor_id: comercio2.id, puntaje: 4, comentario: 'La fruta llega fresca y en buen estado.' },
    { usuario_id: usuario1.id, productor_id: comercio4.id, puntaje: 5, comentario: 'El pan casero es espectacular.' },
    { usuario_id: usuario2.id, producto_id: producto1.id, puntaje: 5, comentario: 'Excelente calidad para el restaurante.' },
    { usuario_id: usuario1.id, producto_id: producto1.id, puntaje: 4, comentario: 'Muy rico y a buen precio.' },
    { usuario_id: usuario1.id, producto_id: producto3.id, puntaje: 5, comentario: 'Recién horneado, se nota la diferencia.' },
    { usuario_id: usuario1.id, producto_id: producto4.id, puntaje: 4, comentario: 'Buen surtido para el cumpleaños.' }
  ]);

  await Chat.create({
    productor_id: comercio2.id,
    comprador_id: usuario2.id,
    mensaje: 'Hola, necesito 50 kg de tomate para el restaurante. ¿Me hacés precio?',
    precio_oferta: 1500
  });

  await Chat.create({
    productor_id: comercio2.id,
    comprador_id: usuario2.id,
    mensaje: 'Te lo dejo en $1.500 el kilo si retirás hoy.',
    precio_oferta: 1500
  });

  await Transaccion.create({
    producto_id: producto1.id,
    productor_id: comercio2.id,
    comprador_id: usuario2.id,
    cantidad: 10,
    precio_negociado: 1500,
    estado: 'pendiente'
  });

  await Transaccion.create({
    producto_id: producto5.id,
    productor_id: comercio1.id,
    comprador_id: usuario1.id,
    cantidad: 2,
    precio_negociado: 2200,
    estado: 'confirmado'
  });

  console.log('Spot Market: base de datos sembrada correctamente.');
  console.log('Usuarios de prueba (password: 123456):');
  console.log('  Comercios: juan@spotmarket.com · maria@spotmarket.com · pedro@spotmarket.com · carla@spotmarket.com');
  console.log('  Usuarios:  vecino@spotmarket.com · resto@spotmarket.com');
};

const ejecutar = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    await limpiar();
    await crearDatos();
  } catch (error) {
    console.error('Error al sembrar la base de datos:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

ejecutar();
