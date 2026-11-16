// Detalle de producto: info, precio, comercio, valoraciones y favorito (requiere login).
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { resolverUrlImagen } from '../utils/imageUrl.js';

export default function DetalleProducto() {
  const { id } = useParams();
  const { data, cargando, error, recargar } = useFetch(`/productos/${id}`, [id]);
  const { usuario } = useAuth();
  const p = data?.producto;
  const [msg, setMsg] = useState('');

  const toggleFav = async () => {
    if (!usuario) { setMsg('Iniciá sesión para guardar favoritos.'); return; }
    try { await api(`/favoritos/${id}`, { method: 'POST' }); setMsg('Favorito actualizado.'); }
    catch (e) { setMsg(e.message); }
  };

  if (cargando) return <div className="max-w-4xl mx-auto px-4 py-10 text-gray-400">Cargando…</div>;
  if (error || !p) return <div className="max-w-4xl mx-auto px-4 py-10 text-red-400">{error || 'No encontrado'}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {p.imagen_url ? (
            <img
              src={resolverUrlImagen(p.imagen_url)}
              alt={p.nombre}
              className="rounded-xl w-full object-cover max-h-96"
            />
          ) : (
            <div className="h-64 rounded-xl bg-white/5 flex items-center justify-center text-4xl">
              📦
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{p.nombre}</h1>
          <p className="text-gray-400 mt-1">{p.comercio?.nombre_local} · {p.comercio?.direccion}</p>
          <div className="mt-4 text-3xl text-brand-yellow font-bold">${Number(p.precio).toLocaleString('es-AR')} <span className="text-sm text-gray-400 font-normal">/ {p.tipo_precio==='mensual'?'mes':'día'}</span></div>
          {p.descripcion && <p className="mt-4 text-gray-300">{p.descripcion}</p>}
          {p.especificaciones && <p className="mt-2 text-sm text-gray-400"><b>Especificaciones:</b> {p.especificaciones}</p>}
          <div className="mt-6 flex gap-3">
            <button onClick={toggleFav} className="px-4 py-2 rounded-lg border border-brand-yellow text-brand-yellow hover:bg-brand-yellow/10">♥ Favorito</button>
            {!usuario && <Link to="/login" className="px-4 py-2 rounded-lg bg-brand-yellow text-black font-semibold">Ingresar para interactuar</Link>}
          </div>
          {msg && <p className="mt-2 text-sm text-gray-300">{msg}</p>}
        </div>
      </div>
      <div className="mt-10">
        <h2 className="text-xl font-semibold">Valoraciones</h2>
        {(p.valoraciones || []).length === 0 && <p className="text-gray-400 mt-2">Aún no hay valoraciones.</p>}
        <div className="mt-3 space-y-3">
          {(p.valoraciones || []).map((v) => (
            <div key={v.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-brand-yellow">{'★'.repeat(v.puntuacion)}{'☆'.repeat(5-v.puntuacion)}</div>
              {v.comentario && <p className="text-gray-300 text-sm mt-1">{v.comentario}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
