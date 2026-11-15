// Ofertas vigentes (filtradas por fecha en el backend).
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';

export default function Ofertas() {
  const { data, cargando, error } = useFetch('/ofertas');
  const ofertas = data?.ofertas || [];
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Ofertas</h1>
      <p className="text-gray-400 mt-1">Solo promociones vigentes de comercios locales.</p>
      {cargando && <p className="mt-6 text-gray-400">Cargando…</p>}
      {error && <p className="mt-6 text-red-400">{error}</p>}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ofertas.map((o) => (
          <Link to={`/productos/${o.producto?.id}`} key={o.id} className="rounded-xl bg-white/5 border border-white/10 p-4">
            <span className="text-xs bg-brand-red text-white px-2 py-0.5 rounded">Oferta</span>
            <div className="mt-2 font-semibold">{o.producto?.nombre}</div>
            <div className="text-sm text-gray-400">{o.producto?.comercio?.nombre_local}</div>
            <div className="mt-2">
              <span className="text-gray-500 line-through mr-2">${Number(o.producto?.precio || 0).toLocaleString('es-AR')}</span>
              <span className="text-brand-yellow font-bold">${Number(o.precio_oferta).toLocaleString('es-AR')}</span>
            </div>
          </Link>
        ))}
      </div>
      {!cargando && ofertas.length === 0 && <p className="mt-6 text-gray-400">No hay ofertas vigentes.</p>}
    </div>
  );
}
