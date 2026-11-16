// Página de inicio (Landing Page) de SpotMarket - Formosa Capital.
// Diseño de alto contraste oscuro según capturas de pantalla, con catálogo dinámico,
// mapa de comercios interactivo, ofertas destacadas y productos más solicitados/vendidos.
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CATEGORIAS_PRODUCTOS } from '../constants/categorias.js';
import { resolverUrlImagen } from '../utils/imageUrl.js';
import LogoCompleto from '../assets/Logo.svg';

// Fix de iconos de Leaflet en Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const pinRojoIcon = L.divIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #EF4444; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #FFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);"><div style="width: 8px; height: 8px; background-color: #FFF; border-radius: 50%;"></div></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26]
});

const CATEGORIAS = CATEGORIAS_PRODUCTOS;

export default function Inicio() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [mapaExpandido, setMapaExpandido] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resP, resC] = await Promise.all([
          api('/productos'),
          api('/comercios')
        ]);
        setProductos(resP.productos || []);
        setComercios(resC.comercios || []);
      } catch (err) {
        console.warn('Error cargando catálogo en Inicio:', err.message);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  // Filtrado de productos por categoría si se selecciona una
  const productosFiltrados = categoriaActiva
    ? productos.filter((p) => p.categoria?.toLowerCase() === categoriaActiva.toLowerCase())
    : productos;

  // Secciones derivadas de la lista
  const ofertasSemana = productos.filter((p) => p.precio_oferta != null);
  const productosEnCuotas = productos.filter((p) => p.cuotas != null);
  const ultimasNovedades = [...productos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  // Productos más solicitados y vendidos (reemplaza a los comercios mejores calificados como pidió el usuario)
  const productosDestacados = [...productos].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 6);

  // Scroll arriba
  const irArriba = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#070C16] text-white">
      {/* ── 1. HERO SECTION: Explorá el mapa de SpotMarket ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B111E] to-[#070C16] pt-10 pb-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Lado izquierdo: Logo oficial, Título y bajada */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#0B1220] border border-white/15 p-1 flex items-center justify-center shadow-xl">
                <img src={LogoCompleto} alt="Spot Market Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#FFB800] bg-[#FFB800]/10 px-2.5 py-0.5 rounded-full border border-[#FFB800]/20">
                  Formosa Capital
                </span>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Comercios y Ofertas de Barrio</p>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
              Explorá el <span className="italic font-serif font-normal text-white">mapa</span>
              <br />
              de <span className="text-[#FFB800]">SpotMarket</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300 font-normal max-w-md">
              Informate de los mejores precios de tu zona, desde la comodidad de tu hogar.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/mapa"
                className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-bold px-6 py-3 rounded-full text-sm shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-2"
              >
                Ver comercios en el mapa
              </Link>
              <Link
                to="/productos"
                className="bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3 rounded-full text-sm border border-white/20 transition-colors"
              >
                Comparar precios
              </Link>
            </div>
          </div>

          {/* Lado derecho: Mini-Mapa interactivo de Formosa Capital */}
          <div className="lg:col-span-7">
            <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-white/15 shadow-2xl relative bg-[#0B1220]">
              <MapContainer
                center={[-26.185, -58.175]}
                zoom={14}
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {comercios.map((com) => {
                  const lat = parseFloat(com.latitud) || -26.185;
                  const lng = parseFloat(com.longitud) || -58.175;
                  return (
                    <Marker key={com.id} position={[lat, lng]} icon={pinRojoIcon}>
                      <Popup className="spot-popup">
                        <div className="p-1 text-black">
                          <p className="font-bold text-sm text-red-600">{com.nombre_local}</p>
                          <p className="text-xs text-gray-600">{com.tipo_comercio}</p>
                          <p className="text-xs text-gray-800 font-medium mt-1">{com.direccion}</p>
                          <Link
                            to={`/productos?comercio=${com.id}`}
                            className="mt-2 inline-block text-[11px] bg-red-600 text-white font-bold px-2 py-1 rounded"
                          >
                            Ver productos del local
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
              <div className="absolute top-3 right-3 z-[400] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMapaExpandido(true)}
                  className="bg-[#FFB800] hover:bg-yellow-400 text-black font-extrabold px-3 py-1.5 rounded-lg text-xs shadow-lg transition flex items-center gap-1.5 cursor-pointer"
                  title="Agrandar mapa en pantalla completa"
                >
                  <span>⛶</span> Agrandar mapa
                </button>
                <div className="bg-[#0B111E]/90 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-[#FFB800] shadow-md hidden sm:flex items-center gap-1.5">
                  Formosa Capital en vivo
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TICKER BAR ROTATIVO ── */}
      <div className="bg-[#050A14] border-y border-white/10 py-2.5 overflow-hidden">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee text-xs font-semibold text-gray-300">
          {[1, 2, 3].map((k) => (
            <div key={k} className="flex items-center gap-8">
              <span className="flex items-center gap-1.5 hover:text-[#FFB800] cursor-default">
                <span className="text-[#FFB800]">●</span> Subí tus productos
              </span>
              <span className="flex items-center gap-1.5 hover:text-[#FFB800] cursor-default">
                <span className="text-[#FFB800]">●</span> Decidí con información
              </span>
              <span className="flex items-center gap-1.5 hover:text-[#FFB800] cursor-default">
                <span className="text-[#FFB800]">●</span> Compará precios
              </span>
              <span className="flex items-center gap-1.5 hover:text-[#FFB800] cursor-default">
                <span className="text-[#FFB800]">●</span> Encontrá comercios cerca
              </span>
              <span className="flex items-center gap-1.5 hover:text-[#FFB800] cursor-default">
                <span className="text-[#FFB800]">●</span> Mirá todo en el mapa
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. EXPLORÁ NUESTRAS CATEGORÍAS ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-wider uppercase text-gray-200">
            Explorá nuestras <span className="text-white">categorías</span>
          </h2>
          <Link to="/productos" className="text-xs font-semibold text-gray-400 hover:text-[#FFB800] flex items-center gap-1">
            Ver más &rarr;
          </Link>
        </div>

        {/* Botones de categorías */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setCategoriaActiva(null)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              categoriaActiva === null
                ? 'bg-[#FFB800] text-black shadow-md'
                : 'bg-[#111A2E] text-gray-300 hover:text-white border border-white/10 hover:border-white/20'
            }`}
          >
            Todas
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(categoriaActiva === cat ? null : cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                categoriaActiva === cat
                  ? 'bg-[#FFB800] text-black shadow-md'
                  : 'bg-[#111A2E] text-gray-300 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── 4. OFERTAS DE LA SEMANA ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            Ofertas de la <span className="text-[#EF4444]">semana</span>
          </h2>
          <div className="flex items-center gap-3">
            <Link to="/ofertas" className="text-xs font-semibold text-gray-400 hover:text-[#FFB800]">
              Ver más &rarr;
            </Link>
          </div>
        </div>

        {cargando ? (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando ofertas de Formosa...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(ofertasSemana.length > 0 ? ofertasSemana : productosFiltrados).slice(0, 6).map((prod) => (
              <div
                key={prod.id}
                onClick={() => navigate(`/productos/${prod.id}`)}
                className="group bg-[#111A2E] rounded-xl overflow-hidden border border-white/10 hover:border-[#FFB800]/50 transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Imagen / Fondo con gradiente y badge */}
                <div className="relative h-36 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-3 overflow-hidden">
                  <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                    Oferta
                  </div>
                  {prod.imagen_url ? (
                    <img src={prod.imagen_url} alt={prod.nombre} className="h-full object-contain group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-4xl opacity-80 select-none">
                      {prod.categoria === 'Deportes' ? '👟' : prod.categoria === 'Hogar' ? '🎒' : prod.categoria === 'Limpieza' ? '🧼' : prod.categoria === 'Bebidas' ? '🥤' : '🛒'}
                    </span>
                  )}
                </div>

                {/* Info del producto */}
                <div className="p-3 space-y-1">
                  <p className="text-[11px] font-semibold text-gray-400 truncate">
                    {prod.comercio?.nombre_local || 'Comercio barrial'}
                  </p>
                  <h3 className="text-xs font-bold text-white truncate group-hover:text-[#FFB800] transition-colors">
                    {prod.nombre}
                  </h3>
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="text-sm font-black text-white">
                      ${Number(prod.precio_oferta || prod.precio).toLocaleString('es-AR')}
                    </span>
                    {prod.precio_oferta && (
                      <span className="text-[10px] line-through text-red-400">
                        ${Number(prod.precio).toLocaleString('es-AR')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                    <span className="text-blue-400 font-medium">1,2 km</span>
                    <span className="text-red-400 font-medium">♥ {prod.likes || 45}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 5. BANNER AMARILLO: Comprá más inteligente ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#FFB800] via-[#FFA500] to-[#E59800] text-black p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          {/* Lado izquierdo con ilustración estilizada de alimentos y almacén */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-black/10 border border-black/15 flex items-center justify-center p-3 text-4xl sm:text-5xl shadow-inner">
              🥫🧺
            </div>
            <div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-none text-slate-950">
                Comprá más inteligente
              </h3>
              <p className="mt-2 text-sm sm:text-base text-black/80 font-medium max-w-lg">
                Compará precios entre comercios cerca tuyo y elegí dónde te conviene cuidar el bolsillo familiar.
              </p>
            </div>
          </div>
          <Link
            to="/productos"
            className="bg-[#0B111E] hover:bg-black text-white font-black text-sm px-7 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105 whitespace-nowrap"
          >
            Comparar ahora
          </Link>
        </div>
      </section>

      {/* ── 6. PRODUCTOS EN CUOTAS ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#4A0E17] via-[#2A0C16] to-[#120B16] p-6 sm:p-8 border border-red-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Bloque izquierdo */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-white leading-tight">
                Productos en <br />
                <span className="text-[#FFB800]">cuotas</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Encontrá comercios de Formosa que ofrecen financiación accesible en cuotas fijas para tus compras.
              </p>
              <Link
                to="/productos"
                className="inline-block border border-white/20 hover:border-white text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                VER PRODUCTOS &rarr;
              </Link>
            </div>

            {/* Cards de productos en cuotas */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(productosEnCuotas.length > 0 ? productosEnCuotas : productos).slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/productos/${p.id}`)}
                  className="bg-[#111A2E]/80 backdrop-blur rounded-xl p-4 border border-white/10 hover:border-[#FFB800]/50 transition-all cursor-pointer space-y-2 hover:-translate-y-1"
                >
                  <div className="h-28 bg-black/20 rounded-lg flex items-center justify-center text-4xl">
                    {p.categoria === 'Deportes' ? '👟' : p.categoria === 'Hogar' ? '🎒' : '🎧'}
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{p.nombre}</h4>
                  <p className="text-[11px] text-gray-400">{p.comercio?.nombre_local || 'Local céntrico'}</p>
                  <div className="pt-1">
                    <p className="text-xs font-semibold text-[#FFB800]">{p.cuotas || '3 cuotas sin interés'}</p>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-sm font-black text-white">
                        ${Number(p.precio_oferta || p.precio).toLocaleString('es-AR')}
                      </span>
                      {p.precio_oferta && (
                        <span className="text-[11px] line-through text-red-400">
                          ${Number(p.precio).toLocaleString('es-AR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. ÚLTIMAS NOVEDADES ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            Últimas <span className="text-[#FFB800]">novedades</span>
          </h2>
          <Link to="/productos" className="text-xs font-semibold text-gray-400 hover:text-[#FFB800]">
            Ver más &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ultimasNovedades.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/productos/${p.id}`)}
              className="bg-[#111A2E] rounded-xl p-3 border border-white/10 hover:border-[#FFB800]/40 transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-1"
            >
              <div className="h-28 bg-gradient-to-br from-slate-900 to-[#16223B] rounded-lg flex items-center justify-center text-3xl relative">
                {p.precio_oferta && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                    Oferta
                  </span>
                )}
                {p.categoria === 'Alimentos' ? '🧉' : p.categoria === 'Limpieza' ? '🧼' : p.categoria === 'Bebidas' ? '☕' : '📦'}
              </div>
              <div className="mt-2 space-y-1">
                <h4 className="text-xs font-bold text-white truncate">{p.nombre}</h4>
                <p className="text-[11px] text-gray-400 truncate">{p.comercio?.nombre_local}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-black text-white">
                    ${Number(p.precio_oferta || p.precio).toLocaleString('es-AR')}
                  </span>
                  {p.precio_oferta && (
                    <span className="text-[10px] line-through text-red-400">
                      ${Number(p.precio).toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                  <span className="text-blue-400">400 m</span>
                  <span className="text-red-400">♥ {p.likes || 39}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8. BANNER AMARILLO: Los comercios de tu barrio ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-2xl bg-gradient-to-r from-[#FFB800] to-[#F59E0B] text-black p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-4 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Los comercios de tu barrio
            </h3>
            <p className="text-sm font-semibold text-black/85">
              Conocé los locales de la zona y mirá qué venden para no caminar de más.
            </p>
            {/* Pills de comercios locales */}
            <div className="flex flex-wrap gap-2 pt-1">
              {comercios.slice(0, 5).map((c) => (
                <span
                  key={c.id}
                  className="bg-black/90 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-sm"
                >
                  {c.nombre_local}
                </span>
              ))}
            </div>
            <div className="pt-2">
              <Link
                to="/mapa"
                className="inline-block border-2 border-black text-black font-black text-xs px-5 py-2.5 rounded-full hover:bg-black hover:text-white transition-colors"
              >
                VER EN EL MAPA &rarr;
              </Link>
            </div>
          </div>

          {/* Fachada / Foto local */}
          <div className="w-full md:w-80 h-44 rounded-xl bg-black/10 border border-black/15 overflow-hidden flex items-center justify-center shadow-inner relative">
            <div className="text-center p-4">
              <span className="text-5xl">🏪</span>
              <p className="font-extrabold text-sm text-black mt-2">APA Supermercados & Almacenes</p>
              <p className="text-xs text-black/75">Formosa Capital · Comercio barrial</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. PRODUCTOS DESTACADOS (Más solicitados y vendidos) ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            Productos <span className="text-[#FFB800]">destacados</span>
          </h2>
          <Link to="/productos" className="text-xs font-semibold text-gray-400 hover:text-[#FFB800]">
            Ver más &rarr;
          </Link>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Los productos más solicitados, vistos y vendidos en comercios de tu zona.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {productosDestacados.map((prod) => (
            <div
              key={prod.id}
              onClick={() => navigate(`/productos/${prod.id}`)}
              className="bg-[#111A2E] rounded-xl overflow-hidden border border-white/10 hover:border-[#FFB800]/50 transition-all cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-32 bg-slate-900 flex items-center justify-center p-2 relative">
                {prod.precio_oferta && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                    Oferta
                  </span>
                )}
                <span className="text-3xl select-none">
                  {prod.categoria === 'Alimentos' ? '☕' : prod.categoria === 'Hogar' ? '🕯️' : prod.categoria === 'Limpieza' ? '🧼' : prod.categoria === 'Deportes' ? '👟' : '🔊'}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <h4 className="text-xs font-bold text-white truncate">{prod.nombre}</h4>
                <p className="text-[11px] text-gray-400 truncate">{prod.comercio?.nombre_local}</p>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-xs font-black text-white">
                    ${Number(prod.precio_oferta || prod.precio).toLocaleString('es-AR')}
                  </span>
                  {prod.precio_oferta && (
                    <span className="text-[10px] line-through text-red-400">
                      ${Number(prod.precio).toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-white/5">
                  <span className="text-blue-400 font-medium">600 m</span>
                  <span className="text-red-400 font-medium">♥ {prod.likes || 63}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. BANNER ROJO / CORAL: ¿Tenés un comercio? ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-2xl bg-[#EF4444] text-white p-6 sm:p-10 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-lg">
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              ¿Tenés un comercio?
            </h3>
            <p className="text-sm sm:text-base text-red-100 font-medium">
              Sumalo a SpotMarket y que los vecinos de tu zona vean lo que vendés de forma gratuita y directa.
            </p>
            <div>
              <Link
                to="/registro-comercio"
                className="bg-[#FFB800] hover:bg-[#FFA500] text-black font-extrabold text-sm px-6 py-3 rounded-full shadow-lg transition-transform hover:scale-105 inline-block"
              >
                Registrar mi comercio &rarr;
              </Link>
            </div>
          </div>

          {/* Tres columnas explicativas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/15">
              <h4 className="font-bold text-sm text-yellow-300">Subí tus productos</h4>
              <p className="text-xs text-red-100 mt-1">Nombre, precio y foto, y listo en segundos.</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/15">
              <h4 className="font-bold text-sm text-yellow-300">Compará con otros</h4>
              <p className="text-xs text-red-100 mt-1">Tu precio al lado de otros comercios para ganar clientes.</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/15">
              <h4 className="font-bold text-sm text-yellow-300">Aparecé en el mapa</h4>
              <p className="text-xs text-red-100 mt-1">Te encuentran los clientes más cercanos a tu local.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. FOOTER ── */}
      <footer className="bg-[#050A14] border-t border-white/10 pt-12 pb-8 mt-12 text-sm text-gray-400">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Columna Marca & Redes */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2 font-black text-lg">
              <span className="text-white">Spot</span>
              <span className="text-[#FFB800]">Market</span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm">
              Plataforma de centralización y comparación de precios en Formosa Capital. Información confiable para proteger la economía familiar.
            </p>
            <div className="pt-2 flex items-center gap-3 text-base">
              <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#FFB800] hover:text-black cursor-pointer transition-colors">📷</span>
              <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#FFB800] hover:text-black cursor-pointer transition-colors">📘</span>
              <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#FFB800] hover:text-black cursor-pointer transition-colors">💬</span>
            </div>
          </div>

          {/* Categorías */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Categorías</h5>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/productos?categoria=Deportes" className="hover:text-white">Deportes</Link></li>
              <li><Link to="/productos?categoria=Hogar" className="hover:text-white">Hogar</Link></li>
              <li><Link to="/productos?categoria=Alimentos" className="hover:text-white">Alimentos</Link></li>
              <li><Link to="/productos?categoria=Mascotas" className="hover:text-white">Mascotas</Link></li>
              <li><Link to="/productos?categoria=Bebidas" className="hover:text-white">Bebidas</Link></li>
            </ul>
          </div>

          {/* Para comercios */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Para comercios</h5>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/registro-comercio" className="hover:text-white">Registrá tu comercio</Link></li>
              <li><Link to="/panel" className="hover:text-white">Subí tus productos</Link></li>
              <li><Link to="/login" className="hover:text-white">Iniciá sesión</Link></li>
            </ul>
          </div>

          {/* Ayuda y Sobre SpotMarket */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Sobre SpotMarket</h5>
            <ul className="space-y-1.5 text-xs">
              <li><span className="hover:text-white cursor-pointer">Quiénes somos</span></li>
              <li><span className="hover:text-white cursor-pointer">Preguntas frecuentes</span></li>
              <li><span className="hover:text-white cursor-pointer">Contacto directo</span></li>
              <li><span className="hover:text-white cursor-pointer">Política de privacidad</span></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer y Copyright */}
        <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
          <p>© 2026 SpotMarket. Todos los derechos reservados. Los precios y la disponibilidad los informa cada comercio y pueden cambiar sin aviso.</p>
          <button
            onClick={irArriba}
            className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            title="Volver arriba"
          >
            &uarr;
          </button>
        </div>
      </footer>

      {/* ── MODAL FULL-SCREEN: MAPA EXPANDIDO EN PANTALLA COMPLETA ── */}
      {mapaExpandido && (
        <div className="fixed inset-0 z-[1000] bg-[#070C16]/95 backdrop-blur-md flex flex-col p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Mapa en vivo de Formosa Capital — Comercios de Barrio
              </h2>
              <p className="text-xs text-gray-400">
                Mostrando {comercios.length} comercios de cercanía geolocalizados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMapaExpandido(false)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <span>✕</span> Reducir Mapa
            </button>
          </div>
          <div className="flex-1 mt-3 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <MapContainer
              center={[-26.185, -58.175]}
              zoom={14}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {comercios.map((com) => {
                const lat = parseFloat(com.latitud) || -26.185;
                const lng = parseFloat(com.longitud) || -58.175;
                return (
                  <Marker key={com.id} position={[lat, lng]} icon={pinRojoIcon}>
                    <Popup className="spot-popup">
                      <div className="p-1 text-black">
                        <p className="font-bold text-sm text-red-600">{com.nombre_local}</p>
                        <p className="text-xs text-gray-600 uppercase font-semibold">{com.tipo_comercio || 'Minorista'}</p>
                        <p className="text-xs text-gray-800 font-medium mt-1">{com.direccion}</p>
                        <Link
                          to={`/productos?comercio=${com.id}`}
                          className="mt-2 inline-block text-[11px] bg-red-600 text-white font-bold px-2 py-1 rounded"
                        >
                          Ver catálogo del local
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}
