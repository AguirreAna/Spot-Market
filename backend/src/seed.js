// Script de carga inicial de datos (Seed) para SpotMarket Formosa Capital.
// Popula comercios barriales reales y productos con ofertas, cuotas y destacados para demostración oral.
import bcrypt from 'bcryptjs';
import { sequelize } from './config/db.js';
import { db } from './models/index.js';

const { Usuario, Comercio, FotoComercio, Producto, Oferta, Valoracion } = db;

const comerciosData = [
  {
    nombre_local: 'Almacén Don Pepe',
    tipo_comercio: 'Almacén de barrio',
    tipos_productos: 'Alimentos,Bebidas,Limpieza,Lácteos',
    direccion: 'Av. 25 de Mayo 450',
    latitud: -26.1851,
    longitud: -58.1753,
    tel: '3704-452100'
  },
  {
    nombre_local: 'Súper Sol (APA)',
    tipo_comercio: 'Supermercado local',
    tipos_productos: 'Alimentos,Bebidas,Limpieza,Lácteos,Hogar',
    direccion: 'Av. Gutnisky 1200',
    latitud: -26.1779,
    longitud: -58.1782,
    tel: '3704-430150'
  },
  {
    nombre_local: 'Frutería La Esquina',
    tipo_comercio: 'Frutería y Verdulería',
    tipos_productos: 'Frutas y Verduras,Alimentos',
    direccion: 'Calle Moreno 310',
    latitud: -26.1888,
    longitud: -58.1710,
    tel: '3704-428900'
  },
  {
    nombre_local: 'Deportes Norte',
    tipo_comercio: 'Artículos Deportivos',
    tipos_productos: 'Deportes,Calzado,Indumentaria',
    direccion: 'Calle Fontana 540',
    latitud: -26.1812,
    longitud: -58.1730,
    tel: '3704-411220'
  },
  {
    nombre_local: 'TechZone',
    tipo_comercio: 'Electrónica y Audio',
    tipos_productos: 'Otros,Hogar',
    direccion: 'Av. 9 de Julio 780',
    latitud: -26.1835,
    longitud: -58.1765,
    tel: '3704-490330'
  },
  {
    nombre_local: 'Tienda del Barrio',
    tipo_comercio: 'Bazar y Marroquinería',
    tipos_productos: 'Hogar,Otros',
    direccion: 'Calle Brandsen 220',
    latitud: -26.1825,
    longitud: -58.1688,
    tel: '3704-455660'
  },
  {
    nombre_local: 'Hogar & Deco',
    tipo_comercio: 'Decoración y Hogar',
    tipos_productos: 'Hogar',
    direccion: 'Av. Italia 890',
    latitud: -26.1905,
    longitud: -58.1655,
    tel: '3704-477880'
  }
];

// Productos tomados directamente de las capturas de pantalla de SpotMarket
const productosData = [
  // Ofertas de la semana & cuotas
  {
    nombre: 'Zapatillas Urbanas',
    comercio: 'Deportes Norte',
    categoria: 'Deportes',
    precio: 54990,
    precio_oferta: 45990,
    cuotas: '12 cuotas de $3.833',
    destacado: true,
    likes: 124,
    descripcion: 'Zapatillas urbanas reforzadas con suela antideslizante, ideales para el uso diario.'
  },
  {
    nombre: 'Auriculares Inalámbricos',
    comercio: 'TechZone',
    categoria: 'Otros',
    precio: 32990,
    precio_oferta: null,
    cuotas: '6 cuotas de $5.498',
    destacado: true,
    likes: 31,
    descripcion: 'Auriculares Bluetooth con cancelación pasiva de ruido y hasta 20hs de batería.'
  },
  {
    nombre: 'Mochila Outdoor',
    comercio: 'Tienda del Barrio',
    categoria: 'Hogar',
    precio: 34990,
    precio_oferta: 28990,
    cuotas: '3 cuotas de $9.663',
    destacado: true,
    likes: 56,
    descripcion: 'Mochila técnica impermeable de 35L con compartimiento para notebook.'
  },
  // Novedades
  {
    nombre: 'Yerba Mate 1 kg',
    comercio: 'Almacén Don Pepe',
    categoria: 'Alimentos',
    precio: 4200,
    precio_oferta: null,
    cuotas: null,
    destacado: false,
    likes: 39,
    descripcion: 'Yerba mate tradicional con palo, estacionamiento natural de 12 meses.'
  },
  {
    nombre: 'Leche Entera 1 L',
    comercio: 'Súper Sol (APA)',
    categoria: 'Alimentos',
    precio: 1450,
    precio_oferta: null,
    cuotas: null,
    destacado: true,
    likes: 58,
    descripcion: 'Leche entera pasteurizada enriquecida con vitaminas A y D.'
  },
  {
    nombre: 'Café de Especialidad',
    comercio: 'Frutería La Esquina',
    categoria: 'Alimentos',
    precio: 8990,
    precio_oferta: null,
    cuotas: null,
    destacado: true,
    likes: 63,
    descripcion: 'Granos de café tostado artesanal 250g de origen seleccionado.'
  },
  {
    nombre: 'Detergente Lavavajillas 750 ml',
    comercio: 'Almacén Don Pepe',
    categoria: 'Limpieza',
    precio: 3490,
    precio_oferta: 2890,
    cuotas: null,
    destacado: true,
    likes: 48,
    descripcion: 'Detergente ultra desengrasante aroma limón con glicerina protectora.'
  },
  // Productos destacados adicionales
  {
    nombre: 'Parlante Portátil',
    comercio: 'TechZone',
    categoria: 'Otros',
    precio: 29990,
    precio_oferta: 24990,
    cuotas: '6 cuotas de $4.165',
    destacado: true,
    likes: 77,
    descripcion: 'Parlante portátil Bluetooth resistente a salpicaduras con sonido estéreo 10W.'
  },
  {
    nombre: 'Velas Aromáticas',
    comercio: 'Hogar & Deco',
    categoria: 'Hogar',
    precio: 12990,
    precio_oferta: null,
    cuotas: null,
    destacado: true,
    likes: 48,
    descripcion: 'Set de 3 velas de cera de soja con esencias naturales en frasco de vidrio.'
  },
  {
    nombre: 'Aceite de Girasol 900 ml',
    comercio: 'Súper Sol (APA)',
    categoria: 'Alimentos',
    precio: 2190,
    precio_oferta: 1890,
    cuotas: null,
    destacado: false,
    likes: 42,
    descripcion: 'Aceite 100% puro de girasol refinado.'
  },
  {
    nombre: 'Arroz Largo Fino 1 kg',
    comercio: 'Almacén Don Pepe',
    categoria: 'Alimentos',
    precio: 1650,
    precio_oferta: 1390,
    cuotas: null,
    destacado: false,
    likes: 35,
    descripcion: 'Arroz largo fino no se pasa, calidad premium bolsa 1kg.'
  },
  {
    nombre: 'Pan Francés 1 kg',
    comercio: 'Almacén Don Pepe',
    categoria: 'Panadería',
    precio: 1800,
    precio_oferta: null,
    cuotas: null,
    destacado: false,
    likes: 51,
    descripcion: 'Pan crocante horneado dos veces al día en panadería artesanal.'
  },
  {
    nombre: 'Tomate Redondo 1 kg',
    comercio: 'Frutería La Esquina',
    categoria: 'Frutas y Verduras',
    precio: 1600,
    precio_oferta: 1290,
    cuotas: null,
    destacado: false,
    likes: 29,
    descripcion: 'Tomate fresco seleccionado de chacras locales del interior formoseño.'
  },
  {
    nombre: 'Alimento para Perros 3 kg',
    comercio: 'Tienda del Barrio',
    categoria: 'Mascotas',
    precio: 7800,
    precio_oferta: null,
    cuotas: '3 cuotas de $2.600',
    destacado: false,
    likes: 22,
    descripcion: 'Alimento balanceado completo para perros adultos razas medianas y grandes.'
  },
  {
    nombre: 'Gaseosa Cola 2.25 L',
    comercio: 'Súper Sol (APA)',
    categoria: 'Bebidas',
    precio: 3200,
    precio_oferta: 2790,
    cuotas: null,
    destacado: false,
    likes: 67,
    descripcion: 'Gaseosa sabor cola primera marca en envase retornable/descartable.'
  }
];

export async function poblarBaseDeDatos() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('Conexión con la BD establecida y sincronizada.');

    const hash = await bcrypt.hash('123456', 10);

    // 1. Usuario consumidor de prueba
    const [consumidor] = await Usuario.findOrCreate({
      where: { email: 'consumidor@spotmarket.com' },
      defaults: {
        nombre: 'Vecino Formoseño',
        password: hash,
        rol: 'usuario'
      }
    });

    // 2. Crear los comercios
    const comerciosMap = {};
    for (let i = 0; i < comerciosData.length; i++) {
      const c = comerciosData[i];
      const email = `comercio${i + 1}@spotmarket.com`;

      const [usuarioComerciante] = await Usuario.findOrCreate({
        where: { email },
        defaults: {
          nombre: `Responsable ${c.nombre_local}`,
          password: hash,
          rol: 'comerciante'
        }
      });

      const [comercio] = await Comercio.findOrCreate({
        where: { usuarioId: usuarioComerciante.id },
        defaults: {
          nombre_local: c.nombre_local,
          tipo_comercio: c.tipo_comercio,
          tipos_productos: c.tipos_productos,
          telefono: c.tel,
          email,
          direccion: c.direccion,
          latitud: c.latitud,
          longitud: c.longitud,
          usuarioId: usuarioComerciante.id
        }
      });

      comerciosMap[c.nombre_local] = comercio;
    }

    // 3. Crear los productos
    for (const p of productosData) {
      const comercioAsignado = comerciosMap[p.comercio] || Object.values(comerciosMap)[0];

      const [producto] = await Producto.findOrCreate({
        where: {
          nombre: p.nombre,
          comercioId: comercioAsignado.id
        },
        defaults: {
          nombre: p.nombre,
          descripcion: p.descripcion,
          precio: p.precio,
          precio_oferta: p.precio_oferta,
          tipo_precio: 'diario',
          cuotas: p.cuotas,
          destacado: p.destacado,
          likes: p.likes,
          vistas: p.likes * 3 + Math.floor(Math.random() * 20),
          categoria: p.categoria,
          comercioId: comercioAsignado.id
        }
      });

      // Si tiene precio oferta, registrar también en tabla Ofertas
      if (p.precio_oferta) {
        const ahorro = Math.round(((p.precio - p.precio_oferta) / p.precio) * 100);
        await Oferta.findOrCreate({
          where: { productoId: producto.id },
          defaults: {
            titulo: `Super Oferta en ${p.nombre}`,
            descripcion: `Ahorrá un ${ahorro}% comprando en ${comercioAsignado.nombre_local}`,
            precio_oferta: p.precio_oferta,
            porcentaje_descuento: ahorro,
            fecha_inicio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            fecha_fin: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            productoId: producto.id
          }
        });
      }

      // Valoración comunitaria sobre el producto (1 a 5)
      await Valoracion.findOrCreate({
        where: {
          usuarioId: consumidor.id,
          productoId: producto.id
        },
        defaults: {
          puntuacion: 5,
          comentario: `Excelente precio en ${comercioAsignado.nombre_local}, conviene comprar acá en vez de ir al centro.`,
          usuarioId: consumidor.id,
          productoId: producto.id
        }
      });
    }

    console.log(`Seed completado: ${comerciosData.length} comercios y ${productosData.length} productos listos para la exposición.`);
  } catch (error) {
    console.error('Error durante la ejecución del seed:', error);
  }
}

// Ejecutar si se invoca directamente desde CLI
if (process.argv[1]?.endsWith('seed.js')) {
  poblarBaseDeDatos().then(() => process.exit(0));
}
