import { productos as basicos } from "./productos.js";
import { menuCategorias } from "./menuCategorias.js";
import { tiendas } from "./tiendas.js";

const hoy = Date.now();
const fechaHace = (horas) => new Date(hoy - horas * 3600000).toISOString();

export const comerciosPorCategoria = {
  Deportes: ["Deportes Norte", "Tienda del Barrio", "Mayorista Centro"],
  Hogar: ["Hogar & Deco", "TechZone", "Tienda del Barrio"],
  Alimentos: ["Almacén Don Pepe", "Súper Sol", "Mayorista Centro", "Frutería La Esquina"],
  Mascotas: ["PetLove", "Tienda del Barrio", "Súper Sol"],
  Bebidas: ["Súper Sol", "Kiosco 24 hs López", "Mayorista Centro", "Almacén Don Pepe"],
  Panadería: ["Panadería San José", "Súper Sol", "Almacén Don Pepe"],
  "Frutas y Verduras": ["Frutería La Esquina", "Feria del Sol", "Súper Sol"],
  Limpieza: ["Súper Sol", "Mayorista Centro", "Almacén Don Pepe"],
  Ferretería: ["Ferretería El Tornillo", "Tienda del Barrio", "Mayorista Centro"],
  Librería: ["Librería Papel", "Tienda del Barrio", "Kiosco 24 hs López"],
  Farmacia: ["Farmacia Central", "Súper Sol", "Kiosco 24 hs López"],
  Otros: ["TechZone", "Tienda del Barrio", "Súper Sol"],
};

const marcasPorCategoria = {
  Deportes: ["Topper", "Norte", "Olympikus"],
  Hogar: ["Essen", "Cannon", "Liliana"],
  Alimentos: ["Arcor", "Marolio", "Ledesma"],
  Mascotas: ["Pedigree", "Sanicat", "Whiskas"],
  Bebidas: ["Coca-Cola", "Quilmes", "Villavicencio"],
  Panadería: ["Bimbo", "Artesanal", "Fargo"],
  "Frutas y Verduras": ["Regional", "Orgánica", "Del Valle"],
  Limpieza: ["Skip", "Procenex", "Verdeflor"],
  Ferretería: ["Stanley", "Black+Decker", "Alba"],
  Librería: ["Rivadavia", "Bic", "Faber-Castell"],
  Farmacia: ["Bayer", "Nivea", "Johnson's"],
  Otros: ["Xiaomi", "Sonora", "Philips"],
};

const distancias = ["300 m", "400 m", "600 m", "900 m", "1,1 km", "1,6 km", "2,4 km", "3,2 km"];
const distanciaDeTienda = {};
basicos.forEach((p) => {
  distanciaDeTienda[p.tienda.nombre] ??= p.distancia;
});
Object.keys(tiendas).forEach((nombre, i) => {
  distanciaDeTienda[nombre] ??= distancias[i % distancias.length];
});

const factoresPrecio = [1, 1.08, 0.94, 1.17, 1.26];
const descuentosPosibles = [10, 20, 30, 40, 50];
const ofertaDe = (precio, n) =>
  n % 4 === 0
    ? Math.round(precio / (1 - descuentosPosibles[(n / 4) % descuentosPosibles.length] / 100) / 10) * 10
    : null;
const cuotasDe = (precio, n) => (precio > 35000 && n % 2 === 0 ? [3, 6, 12][n % 3] : null);

function publicacion({ id, nombre, marca, categoria, tienda, precioBase, n, extra = {} }) {
  const precio = Math.round((precioBase * factoresPrecio[n % 5]) / 10) * 10;
  const anterior = ofertaDe(precio, n);
  const cuotas = cuotasDe(precio, n);
  return {
    id,
    nombre,
    marca,
    precio,
    precio_anterior: anterior,
    en_oferta: anterior !== null,
    me_gusta: (n * 13) % 120,
    imagen: null,
    imagen_url: null,
    distancia: distanciaDeTienda[tienda] || "1,5 km",
    createdAt: fechaHace((n * 37) % 400),
    updatedAt: fechaHace((n * 19) % 300),
    tienda: { nombre: tienda },
    comercio: { nombre_local: tienda, tipo_comercio: tiendas[tienda]?.tipo || 'Pyme' },
    categorias: [{ nombre: categoria }],
    categoria,
    ...(cuotas ? { cuotas: `${cuotas} cuotas sin interés` } : {}),
    ...extra,
  };
}

const replicas = basicos.flatMap((p, k) => {
  const categoria = p.categorias[0].nombre;
  const otros = (comerciosPorCategoria[categoria] || []).filter((t) => t !== p.tienda.nombre).slice(0, 2 + (k % 2));
  return otros.map((tienda, j) =>
    publicacion({ id: 1000 + k * 10 + j, nombre: p.nombre, marca: p.marca, categoria, tienda, precioBase: p.precio, n: k + j + 1 })
  );
});

const generados = menuCategorias
  .flatMap((cat) => cat.grupos.flatMap((grupo) => grupo.items.map((item) => ({ cat: cat.nombre, grupo: grupo.titulo, item }))))
  .flatMap(({ cat, grupo, item }, i) => {
    const marca = marcasPorCategoria[cat][i % 3];
    const comercios = comerciosPorCategoria[cat] || ["Tienda del Barrio"];
    const precioBase = Math.round((1500 + ((i * 7919) % 60000)) / 10) * 10;
    const cantidad = Math.min(comercios.length, 2 + (i % 3));
    return Array.from({ length: cantidad }, (_, j) =>
      publicacion({
        id: 2000 + i * 10 + j,
        nombre: `${item} ${marca}`,
        marca,
        categoria: cat,
        tienda: comercios[(i + j) % comercios.length],
        precioBase,
        n: i + j,
        extra: { grupo, subcategoria: item },
      })
    );
  });

export const productosCatalogo = [...basicos, ...replicas, ...generados];
