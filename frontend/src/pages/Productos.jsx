// Catálogo público: búsqueda, filtro por categoría, orden por precio
// y comparación simple (mismo nombre en distintos comercios) ordenable.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { CATEGORIAS_PRODUCTOS } from '../constants/categorias.js';
import { resolverUrlImagen } from '../utils/imageUrl.js';

export default function Productos() {
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [orden, setOrden] = useState('');
  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (categoria) p.set('categoria', categoria);
    if (orden) p.set('orden', orden);
    const s = p.toString();
    return `/productos${s ? `?${s}` : ''}`;
  }, [q, categoria, orden]);
  const { data, cargando, error } = useFetch(query, [query]);
  const productos = data?.productos || [];

  const grupos = useMemo(() => {
    const map = {};
    for (const p of productos) {
      const k = (p.nombre || '').toLowerCase().trim();
      (map[k] ||= []).push(p);
    }
    return Object.values(map).filter((g) => g.length > 1);
  }, [productos]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Productos</h1>
      <p className="text-gray-400 mt-1">Buscá y compará precios entre comercios de Formosa.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre..."
          className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-lg bg-[#0a1222] border border-white/10 px-3 py-2 text-white"
        >
          <option value="">Todas las categorías (A-Z)</option>
          {CATEGORIAS_PRODUCTOS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="rounded-lg bg-[#0a1222] border border-white/10 px-3 py-2 text-white"
        >
          <option value="">Más recientes</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
          <option value="nombre">Nombre</option>
        </select>
      </div>

      {cargando && <p className="mt-6 text-gray-400">Cargando…</p>}
      {error && <p className="mt-6 text-red-400">{error}</p>}

      {grupos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-brand-yellow">Comparación (mismo producto, distintos comercios)</h2>
          {grupos.slice(0, 3).map((g, i) => (
            <div key={i} className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="font-medium">{g[0].nombre}</div>
              <div className="mt-1 text-sm text-gray-300 flex flex-wrap gap-3">
                {[...g].sort((a,b)=>Number(a.precio)-Number(b.precio)).map((p) => (
                  <span key={p.id}>{p.comercio?.nombre_local}: <b className="text-white">${Number(p.precio).toLocaleString('es-AR')}</b></span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {productos.map((p) => (
          <Link to={`/productos/${p.id}`} key={p.id} className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-brand-yellow/40 transition">
            {p.imagen_url && (
              <img
                src={resolverUrlImagen(p.imagen_url)}
                alt={p.nombre}
                className="h-36 w-full object-cover rounded-lg mb-3"
              />
            )}
            <div className="font-semibold">{p.nombre}</div>
            <div className="text-sm text-gray-400">{p.comercio?.nombre_local}</div>
            <div className="mt-2 text-brand-yellow font-bold">${Number(p.precio).toLocaleString('es-AR')} <span className="text-xs text-gray-400 font-normal">/ {p.tipo_precio === 'mensual' ? 'mes' : 'día'}</span></div>
          </Link>
        ))}
      </div>
      {!cargando && productos.length === 0 && <p className="mt-6 text-gray-400">No hay productos para mostrar.</p>}
    </div>
  );
}
