// Script de carga inicial de datos (Seed) para SpotMarket Formosa Capital.
// Popula comercios barriales (minoristas y mayoristas) y productos con las 27 categorías oficiales en orden alfabético.
import bcrypt from 'bcryptjs';
import { sequelize, testConnection } from './config/db.js';
import { db } from './models/index.js';

const { Usuario, Comercio, FotoComercio, Producto, Oferta, Valoracion } = db;

const comerciosData = [
  {
    nombre_local: 'Almacén Don Pepe',
    tipo_comercio: 'minorista',
    categoria_productos: 'Almacén, Bebidas, Fiambrería, Lácteos, Panadería',
    direccion: 'Av. 25 de Mayo 450',
    latitud: -26.1851,
    longitud: -58.1753,
    tel: '3704-452100'
  },
  {
    nombre_local: 'Mayorista Distribuidora Formosa',
    tipo_comercio: 'mayorista',
    categoria_productos: 'Almacén, Artículos de limpieza, Bebidas, Lácteos, Polirubro',
    direccion: 'Av. Gutnisky 2400',
    latitud: -26.1740,
    longitud: -58.1820,
    tel: '3704-430999'
  },
  {
    nombre_local: 'Súper Sol (APA)',
    tipo_comercio: 'minorista',
    categoria_productos: 'Almacén, Artículos de limpieza, Bebidas, Carnicería, Lácteos',
    direccion: 'Av. Gutnisky 1200',
    latitud: -26.1779,
    longitud: -58.1782,
    tel: '3704-430150'
  },
  {
    nombre_local: 'Frutería y Verdulería La Esquina',
    tipo_comercio: 'minorista',
    categoria_productos: 'Frutería, Verdulería',
    direccion: 'Calle Moreno 310',
    latitud: -26.1888,
    longitud: -58.1710,
    tel: '3704-428900'
  },
  {
    nombre_local: 'Deportes y Zapatería Norte',
    tipo_comercio: 'minorista',
    categoria_productos: 'Ropería, Zapatería',
    direccion: 'Calle Fontana 540',
    latitud: -26.1812,
    longitud: -58.1730,
    tel: '3704-411220'
  },
  {
    nombre_local: 'Ferretería & Bazar Central',
    tipo_comercio: 'minorista',
    categoria_productos: 'Bazar, Ferretería, Mueblería',
    direccion: 'Av. 9 de Julio 780',
    latitud: -26.1835,
    longitud: -58.1765,
    tel: '3704-490330'
  },
  {
    nombre_local: 'Forrajería & Pet Shop San Martín',
    tipo_comercio: 'minorista',
    categoria_productos: 'Forrajería / Pet Shop, Vivero',
    direccion: 'Calle Brandsen 220',
    latitud: -26.1825,
    longitud: -58.1688,
    tel: '3704-455660'
  }
];

const productosData = [
  {
    nombre: 'Zapatillas Urbanas Clásicas',
    comercio: 'Deportes y Zapatería Norte',
    categoria: 'Zapatería',
    precio: 54990,
    precio_oferta: 45990,
    cuotas: '12 cuotas de $3.833',
    destacado: true,
    likes: 124,
    descripcion: 'Zapatillas urbanas de lona reforzada con suela antideslizante.'
  },
  {
    nombre: 'Juego de Vasos y Bazar 6 Piezas',
    comercio: 'Ferretería & Bazar Central',
    categoria: 'Bazar',
    precio: 18990,
    precio_oferta: 14990,
    cuotas: '3 cuotas sin interés',
    destacado: true,
    likes: 45,
    descripcion: 'Set de vasos de vidrio templado aptos para lavavajillas.'
  },
  {
    nombre: 'Remera Deportiva Algodón',
    comercio: 'Deportes y Zapatería Norte',
    categoria: 'Ropería',
    precio: 22500,
    precio_oferta: 18900,
    cuotas: '6 cuotas de $3.150',
    destacado: true,
    likes: 78,
    descripcion: 'Remera deportiva respirable de algodón peinado.'
  },
  {
    nombre: 'Yerba Mate Especial 1 kg',
    comercio: 'Almacén Don Pepe',
    categoria: 'Almacén',
    precio: 4200,
    precio_oferta: 3499,
    cuotas: null,
    destacado: true,
    likes: 92,
    descripcion: 'Yerba mate estacionamiento natural 12 meses.'
  },
  {
    nombre: 'Queso Cremoso Primera Marca 1 kg',
    comercio: 'Almacén Don Pepe',
    categoria: 'Lácteos',
    precio: 7800,
    precio_oferta: 6499,
    cuotas: null,
    destacado: true,
    likes: 110,
    descripcion: 'Queso cremoso sin TACC con excelente consistencia.'
  },
  {
    nombre: 'Pan Francés Fresco 1 kg',
    comercio: 'Almacén Don Pepe',
    categoria: 'Panadería',
    precio: 2400,
    precio_oferta: null,
    cuotas: null,
    destacado: false,
    likes: 31,
    descripcion: 'Pan del día recién horneado con masa crocante.'
  },
  {
    nombre: 'Asado de Novillo Especial 1 kg',
    comercio: 'Súper Sol (APA)',
    categoria: 'Carnicería',
    precio: 8900,
    precio_oferta: 7590,
    cuotas: null,
    destacado: true,
    likes: 85,
    descripcion: 'Corte de asado vacuno seleccionado de primera calidad.'
  },
  {
    nombre: 'Manzana Roja Seleccionada 1 kg',
    comercio: 'Frutería y Verdulería La Esquina',
    categoria: 'Frutería',
    precio: 2800,
    precio_oferta: null,
    cuotas: null,
    destacado: false,
    likes: 19,
    descripcion: 'Manzanas rojas dulces y crujientes de estación.'
  },
  {
    nombre: 'Tomate Redondo de Huerta 1 kg',
    comercio: 'Frutería y Verdulería La Esquina',
    categoria: 'Verdulería',
    precio: 2500,
    precio_oferta: 1990,
    cuotas: null,
    destacado: true,
    likes: 64,
    descripcion: 'Tomates frescos ideales para ensaladas.'
  },
  {
    nombre: 'Lavandina Concentrada 2 Litros',
    comercio: 'Mayorista Distribuidora Formosa',
    categoria: 'Artículos de limpieza',
    precio: 2100,
    precio_oferta: 1650,
    cuotas: null,
    destacado: false,
    likes: 42,
    descripcion: 'Lavandina desinfectante de máxima potencia para el hogar.'
  },
  {
    nombre: 'Taladro Percutor 650W',
    comercio: 'Ferretería & Bazar Central',
    categoria: 'Ferretería',
    precio: 68900,
    precio_oferta: 57900,
    cuotas: '12 cuotas de $4.825',
    destacado: true,
    likes: 112,
    descripcion: 'Taladro percutor reversible con mandril de 13mm y velocidad variable.'
  },
  {
    nombre: 'Alimento para Perros Adultos 3 kg',
    comercio: 'Forrajería & Pet Shop San Martín',
    categoria: 'Forrajería / Pet Shop',
    precio: 9500,
    precio_oferta: 7990,
    cuotas: '3 cuotas de $2.663',
    destacado: true,
    likes: 54,
    descripcion: 'Nutrición balanceada con proteínas y omega 3 y 6.'
  },
  {
    nombre: 'Gaseosa Cola 2.25 L',
    comercio: 'Almacén Don Pepe',
    categoria: 'Bebidas',
    precio: 3200,
    precio_oferta: 2790,
    cuotas: null,
    destacado: false,
    likes: 27,
    descripcion: 'Bebida gaseosa sabor cola tamaño familiar.'
  },
  {
    nombre: 'Jamón Cocido Feteado 200g',
    comercio: 'Almacén Don Pepe',
    categoria: 'Fiambrería',
    precio: 3600,
    precio_oferta: null,
    cuotas: null,
    destacado: false,
    likes: 15,
    descripcion: 'Fetas finas de jamón cocido seleccionado.'
  },
  {
    nombre: 'Salame Milán Especial 200g',
    comercio: 'Almacén Don Pepe',
    categoria: 'Embutidos',
    precio: 3900,
    precio_oferta: 3200,
    cuotas: null,
    destacado: false,
    likes: 33,
    descripcion: 'Embutido artesanal de receta tradicional.'
  },
  {
    nombre: 'Planta Suculenta en Maceta',
    comercio: 'Forrajería & Pet Shop San Martín',
    categoria: 'Vivero',
    precio: 4500,
    precio_oferta: 3800,
    cuotas: null,
    destacado: false,
    likes: 29,
    descripcion: 'Variedad de suculentas ornamentales de bajo mantenimiento.'
  },
  {
    nombre: 'Mesa de Pino Rústica 1.40m',
    comercio: 'Ferretería & Bazar Central',
    categoria: 'Mueblería',
    precio: 98000,
    precio_oferta: 84000,
    cuotas: '12 cuotas de $7.000',
    destacado: true,
    likes: 72,
    descripcion: 'Mesa de madera de pino macizo secada al horno.'
  }
];

export const seedDatabase = async () => {
  try {
    await testConnection();
    await sequelize.sync({ alter: true });

    // 1. Crear usuario comprador de prueba
    const hashComprador = await bcrypt.hash('123456', 10);
    const [comprador] = await Usuario.findOrCreate({
      where: { email: 'vecino@spotmarket.com' },
      defaults: {
        nombre: 'Vecino Formoseño',
        email: 'vecino@spotmarket.com',
        password: hashComprador,
        rol: 'usuario'
      }
    });

    const hashPassword = await bcrypt.hash('123456', 10);
    const comerciosCreados = {};

    // 2. Crear los comercios
    for (let i = 0; i < comerciosData.length; i++) {
      const c = comerciosData[i];
      const email = `comercio${i + 1}@spotmarket.com`;

      const [usuarioComercio] = await Usuario.findOrCreate({
        where: { email },
        defaults: {
          nombre: `Responsable ${c.nombre_local}`,
          email,
          password: hashPassword,
          rol: 'comerciante'
        }
      });

      const [comercio] = await Comercio.findOrCreate({
        where: { usuarioId: usuarioComercio.id },
        defaults: {
          nombre_local: c.nombre_local,
          tipo_comercio: c.tipo_comercio,
          categoria_productos: c.categoria_productos,
          tipos_productos: c.categoria_productos,
          direccion: c.direccion,
          telefono: c.tel,
          email,
          latitud: c.latitud,
          longitud: c.longitud,
          usuarioId: usuarioComercio.id
        }
      });

      // Actualizar por si ya existía
      await comercio.update({
        tipo_comercio: c.tipo_comercio,
        categoria_productos: c.categoria_productos,
        tipos_productos: c.categoria_productos
      });

      comerciosCreados[c.nombre_local] = comercio;
    }

    // 3. Crear productos
    for (const p of productosData) {
      const comercioObj = comerciosCreados[p.comercio];
      if (!comercioObj) continue;

      const [producto] = await Producto.findOrCreate({
        where: { nombre: p.nombre, comercioId: comercioObj.id },
        defaults: {
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          precio_oferta: p.precio_oferta || null,
          tipo_precio: 'diario',
          cuotas: p.cuotas || null,
          destacado: p.destacado || false,
          likes: p.likes || 0,
          vistas: (p.likes || 0) * 3 + 10,
          categoria: p.categoria,
          comercioId: comercioObj.id
        }
      });

      await producto.update({
        categoria: p.categoria,
        precio_oferta: p.precio_oferta || null,
        cuotas: p.cuotas || null,
        destacado: p.destacado || false
      });

      // Si tiene oferta, registrar en tabla ofertas
      if (p.precio_oferta) {
        const hoy = new Date();
        const fin = new Date();
        fin.setDate(fin.getDate() + 15);

        await Oferta.findOrCreate({
          where: { productoId: producto.id },
          defaults: {
            precio_oferta: p.precio_oferta,
            fecha_inicio: hoy,
            fecha_fin: fin,
            productoId: producto.id
          }
        });
      }

      // Valoración inicial de prueba
      await Valoracion.findOrCreate({
        where: { usuarioId: comprador.id, productoId: producto.id },
        defaults: {
          puntuacion: 5,
          comentario: 'Excelente calidad y precio conveniente en el barrio.',
          usuarioId: comprador.id,
          productoId: producto.id
        }
      });
    }

    console.log('Seed completado: Comercios minoristas/mayoristas y categorías en orden alfabético cargados.');
  } catch (error) {
    console.error('Error al ejecutar el seed:', error);
  }
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().then(() => {
    console.log('Proceso de seed finalizado.');
    process.exit(0);
  });
}
