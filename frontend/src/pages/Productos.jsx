// Catálogo público de SpotMarket: búsqueda, filtro por 27 categorías A-Z, orden por precio
// y sincronización bidireccional reactiva con la URL (?categoria=...&q=...).
import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { CATEGORIAS_PRODUCTOS } from '../constants/categorias.js';
import { resolverUrlImagen } from '../utils/imageUrl.js';

export default function Productos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategoria = searchParams.get('categoria') || '';
  const urlQ = searchParams.get('q') || '';
  const urlOrden = searchParams.get('orden') || '';

  const [q, setQ] = useState(urlQ);
  const [categoria, setCategoria] = useState(urlCategoria);
  const [orden, setOrden] = useState(urlOrden);

  // Sincronizar estado cuando cambie la URL (por ejemplo desde el menú Categorías de la Navbar)
  useEffect(() => {
    setCategoria(searchParams.get('categoria') || '');
    setQ(searchParams.get('q') || '');
    setOrden(searchParams.get('orden') || '');
  }, [searchParams]);

  // Actualizar la URL al cambiar los filtros para que sea compartible y persistente
  const actualizarFiltros = (nuevoQ, nuevaCat, nuevoOrd) => {
    const params = new URLSearchParams();
    if (nuevoQ) params.set('q', nuevoQ);
    if (nuevaCat && nuevaCat !== 'Todas') params.set('categoria', nuevaCat);
    if (nuevoOrd) params.set('orden', nuevoOrd);
    setSearchParams(params);
  };

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (categoria && categoria !== 'Todas') p.set('categoria', categoria);
    if (orden) p.set('orden', orden);
    const s = p.toString();
    return `/productos${s ? `?${s}` : ''}`;
  }, [q, categoria, orden]);

  const { data, cargando, error } = useFetch(query, [query]);
  const productos = data?.productos || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Catálogo de Productos</h1>
          <p className="text-gray-400 text-sm mt-1">
            Compará precios y descubrí ofertas en comercios barriales de Formosa Capital.
          </p>
        </div>

        {/* CONTROLES DE FILTRO */}
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              actualizarFiltros(e.target.value, categoria, orden);
            }}
            placeholder="Buscar por nombre..."
            className="rounded-xl bg-[#111A2E] border border-white/15 px-3.5 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#FFB800]"
          />

          <select
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              actualizarFiltros(q, e.target.value, orden);
            }}
            className="rounded-xl bg-[#111A2E] border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFB800] font-medium"
          >
            <option value="">Todas las categorías (27 A-Z)</option>
            {CATEGORIAS_PRODUCTOS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={orden}
            onChange={(e) => {
              setOrden(e.target.value);
              actualizarFiltros(q, categoria, e.target.value);
            }}
            className="rounded-xl bg-[#111A2E] border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFB800]"
          >
            <option value="">Más recientes</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="populares">Más solicitados y vistos</option>
            <option value="nombre">Nombre A-Z</option>
          </select>
        </div>
      </div>

      {categoria && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="text-gray-400">Filtrando por categoría:</span>
          <span className="bg-[#FFB800] text-black font-bold px-2.5 py-0.5 rounded-full">
            {categoria}
          </span>
          <button
            onClick={() => {
              setCategoria('');
              actualizarFiltros(q, '', orden);
            }}
            className="text-gray-400 hover:text-white underline ml-1"
          >
            Limpiar filtro
          </button>
        </div>
      )}

      {cargando && <p className="mt-10 text-center text-gray-400 text-sm">Cargando catálogo de Formosa…</p>}
      {error && <p className="mt-10 text-center text-red-400 text-sm">{error}</p>}

      {/* GRILLA DE PRODUCTOS */}
      {!cargando && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {productos.map((p) => (
            <Link
              to={`/productos/${p.id}`}
              key={p.id}
              className="group bg-[#111A2E] rounded-2xl overflow-hidden border border-white/10 hover:border-[#FFB800]/50 transition-all flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl shadow"
            >
              <div className="relative h-40 bg-black/30 flex items-center justify-center p-3 overflow-hidden">
                {p.precio_oferta && (
                  <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                    Oferta
                  </span>
                )}
                {p.imagen_url ? (
                  <img
                    src={resolverUrlImagen(p.imagen_url)}
                    alt={p.nombre}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <span className="text-4xl opacity-75">📦</span>
                )}
              </div>

              <div className="p-3.5 space-y-1">
                <p className="text-[11px] font-semibold text-gray-400 truncate">
                  {p.comercio?.nombre_local || 'Comercio local'}
                </p>
                <h3 className="text-xs font-bold text-white truncate group-hover:text-[#FFB800] transition-colors">
                  {p.nombre}
                </h3>
                {p.categoria && (
                  <span className="inline-block text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-300">
                    {p.categoria}
                  </span>
                )}
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-sm font-black text-white">
                    ${Number(p.precio_oferta || p.precio).toLocaleString('es-AR')}
                  </span>
                  {p.precio_oferta && (
                    <span className="text-[10px] line-through text-red-400">
                      ${Number(p.precio).toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
                {p.cuotas && <p className="text-[10px] text-emerald-400 font-semibold">{p.cuotas}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!cargando && productos.length === 0 && (
        <div className="mt-12 text-center py-12 rounded-2xl bg-[#111A2E]/50 border border-white/10 p-8">
          <p className="text-3xl mb-2">🔍</p>
          <h3 className="text-base font-bold text-white">No se encontraron productos</h3>
          <p className="text-xs text-gray-400 mt-1">Probá cambiando el término de búsqueda o la categoría seleccionada.</p>
        </div>
      )}
    </div>
  );
}
