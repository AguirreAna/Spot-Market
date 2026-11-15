// Panel del comerciante: Inicio (resumen), Productos (CRUD), Ofertas y Perfil
// (datos editables + valoraciones recibidas + productos más buscados).
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const tabs = ['Inicio', 'Productos', 'Ofertas', 'Perfil'];

export default function PanelComercio() {
  const nav = useNavigate();
  const { usuario, cargando } = useAuth();
  const [tab, setTab] = useState('Inicio');
  const [comercio, setComercio] = useState(null);
  const [resumenVal, setResumenVal] = useState(null);
  const [masBuscados, setMasBuscados] = useState([]);
  const [msg, setMsg] = useState('');

  const cargar = async () => {
    if (!usuario?.comercioId) return;
    const [c, v, m] = await Promise.all([
      api(`/comercios/${usuario.comercioId}`),
      api('/valoraciones/mi-comercio').catch(() => null),
      api('/comercio/mas-buscados').catch(() => null)
    ]);
    setComercio(c.comercio);
    setResumenVal(v?.resumen || null);
    setMasBuscados(m?.productos || []);
  };

  useEffect(() => {
    if (!cargando && (!usuario || usuario.rol !== 'comerciante')) nav('/login');
  }, [usuario, cargando, nav]);
  useEffect(() => { cargar(); }, [usuario?.comercioId]);

  const productos = comercio?.productos || [];
  const ofertasActivas = productos.flatMap(p => p.ofertas || []).filter(o => new Date(o.fecha_fin) >= new Date()).length;

  if (cargando) return <div className="p-10 text-gray-400">Cargando…</div>;
  if (!usuario || usuario.rol !== 'comerciante') return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Panel de <span className="text-[#FFC700]">{usuario.nombre_local || 'mi comercio'}</span></h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full text-sm font-medium ${tab===t?'bg-[#FFC700] text-black':'bg-white/5 text-gray-200 border border-white/10'}`}>{t}</button>
        ))}
      </div>
      {msg && <p className="mt-4 text-sm text-emerald-300">{msg}</p>}

      {tab === 'Inicio' && (
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <Card titulo="Productos" valor={productos.length} />
          <Card titulo="Ofertas activas" valor={ofertasActivas} />
          <Card titulo="Valoración promedio" valor={resumenVal?.promedio != null ? `${resumenVal.promedio} ★` : '—'} />
        </div>
      )}

      {tab === 'Productos' && <ProductosPanel productos={productos} onDone={(m)=>{setMsg(m); cargar();}} />}
      {tab === 'Ofertas' && <OfertasPanel productos={productos} onDone={(m)=>{setMsg(m); cargar();}} />}
      {tab === 'Perfil' && <PerfilPanel comercio={comercio} resumen={resumenVal} masBuscados={masBuscados} onDone={(m)=>{setMsg(m); cargar();}} />}
    </div>
  );
}

function Card({ titulo, valor }) {
  return <div className="rounded-xl bg-white/5 border border-white/10 p-5"><div className="text-gray-400 text-sm">{titulo}</div><div className="text-2xl font-bold mt-1">{valor}</div></div>;
}

function ProductosPanel({ productos, onDone }) {
  const [form, setForm] = useState({ nombre:'', descripcion:'', especificaciones:'', precio:'', tipo_precio:'diario', categoria:'' });
  const [imagen, setImagen] = useState(null);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');
  const inp = "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2";
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v])=> v!=='' && fd.append(k,v));
      if (imagen) fd.append('imagen', imagen);
      if (editId) await api(`/productos/${editId}`, { method:'PUT', body: fd });
      else await api('/productos', { method:'POST', body: fd });
      setForm({ nombre:'', descripcion:'', especificaciones:'', precio:'', tipo_precio:'diario', categoria:'' }); setImagen(null); setEditId(null);
      onDone(editId ? 'Producto actualizado.' : 'Producto creado.');
    } catch (e2) { setErr(e2.message); }
  };
  const del = async (id) => { if(!confirm('¿Eliminar producto?')) return; await api(`/productos/${id}`,{method:'DELETE'}); onDone('Producto eliminado.'); };
  const edit = (p) => { setEditId(p.id); setForm({ nombre:p.nombre, descripcion:p.descripcion||'', especificaciones:p.especificaciones||'', precio:p.precio, tipo_precio:p.tipo_precio, categoria:p.categoria||'' }); };
  return (
    <div className="mt-6 grid lg:grid-cols-2 gap-6">
      <form onSubmit={submit} className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-3">
        <h3 className="font-semibold">{editId?'Editar':'Nuevo'} producto</h3>
        <input className={inp} placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required />
        <input className={inp} placeholder="Precio" type="number" step="0.01" value={form.precio} onChange={e=>setForm({...form,precio:e.target.value})} required />
        <select className={inp+' bg-[#0a1222]'} value={form.tipo_precio} onChange={e=>setForm({...form,tipo_precio:e.target.value})}>
          <option value="diario">Precio por día</option><option value="mensual">Precio por mes</option>
        </select>
        <input className={inp} placeholder="Categoría" value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})} />
        <textarea className={inp} placeholder="Descripción" value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} />
        <textarea className={inp} placeholder="Especificaciones" value={form.especificaciones} onChange={e=>setForm({...form,especificaciones:e.target.value})} />
        <input type="file" accept="image/*" onChange={e=>setImagen(e.target.files[0])} className="text-sm text-gray-300" />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <div className="flex gap-2"><button className="bg-[#FFC700] text-black font-semibold px-4 py-2 rounded-lg">{editId?'Guardar':'Crear'}</button>{editId && <button type="button" onClick={()=>{setEditId(null);}} className="px-4 py-2 border border-white/10 rounded-lg">Cancelar</button>}</div>
      </form>
      <div className="space-y-2">
        {productos.map(p => (
          <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/10 p-3">
            <div><div className="font-medium">{p.nombre}</div><div className="text-sm text-gray-400">${Number(p.precio).toLocaleString('es-AR')} / {p.tipo_precio} · {p.vistas||0} vistas</div></div>
            <div className="flex gap-2 text-sm"><button onClick={()=>edit(p)} className="text-[#FFC700]">Editar</button><button onClick={()=>del(p.id)} className="text-red-400">Borrar</button></div>
          </div>
        ))}
        {productos.length===0 && <p className="text-gray-400">Aún no cargaste productos.</p>}
      </div>
    </div>
  );
}

function OfertasPanel({ productos, onDone }) {
  const [form, setForm] = useState({ productoId:'', precio_oferta:'', fecha_inicio:'', fecha_fin:'' });
  const [err, setErr] = useState('');
  const inp = "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2";
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try {
      await api('/ofertas', { method:'POST', body: JSON.stringify(form) });
      setForm({ productoId:'', precio_oferta:'', fecha_inicio:'', fecha_fin:'' }); onDone('Oferta creada.');
    } catch (e2) { setErr(e2.message); }
  };
  return (
    <div className="mt-6 grid lg:grid-cols-2 gap-6">
      <form onSubmit={submit} className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-3">
        <h3 className="font-semibold">Nueva oferta</h3>
        <select className={inp+' bg-[#0a1222]'} value={form.productoId} onChange={e=>setForm({...form,productoId:e.target.value})} required>
          <option value="">Producto…</option>{productos.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <input className={inp} type="number" step="0.01" placeholder="Precio promocional" value={form.precio_oferta} onChange={e=>setForm({...form,precio_oferta:e.target.value})} required />
        <input className={inp} type="datetime-local" value={form.fecha_inicio} onChange={e=>setForm({...form,fecha_inicio:e.target.value})} required />
        <input className={inp} type="datetime-local" value={form.fecha_fin} onChange={e=>setForm({...form,fecha_fin:e.target.value})} required />
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button className="bg-[#FFC700] text-black font-semibold px-4 py-2 rounded-lg">Crear oferta</button>
      </form>
      <div className="text-sm text-gray-300 rounded-xl bg-white/5 border border-white/10 p-5">
        <p>Las ofertas vencidas se ocultan automáticamente (filtro por fecha en la consulta). Definí inicio y fin para controlar la duración.</p>
      </div>
    </div>
  );
}

function PerfilPanel({ comercio, resumen, masBuscados, onDone }) {
  if (!comercio) return <p className="mt-6 text-gray-400">Cargando perfil…</p>;
  return (
    <div className="mt-6 grid lg:grid-cols-2 gap-6">
      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
        <h3 className="font-semibold">Datos del local</h3>
        <ul className="mt-3 text-sm text-gray-300 space-y-1">
          <li><b>Local:</b> {comercio.nombre_local}</li>
          <li><b>Tipo:</b> {comercio.tipo_comercio}</li>
          <li><b>Teléfono:</b> {comercio.telefono || '—'}</li>
          <li><b>Dirección:</b> {comercio.direccion || '—'}</li>
          <li><b>Rubro:</b> {comercio.tipos_productos || '—'}</li>
        </ul>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
        <h3 className="font-semibold">Valoraciones recibidas</h3>
        <p className="mt-2 text-gray-300">Promedio: <b className="text-[#FFC700]">{resumen?.promedio ?? '—'}</b> ({resumen?.total || 0} valoraciones)</p>
        <div className="mt-3 space-y-2 max-h-48 overflow-auto">
          {(resumen?.valoraciones || []).slice(0,8).map(v => (
            <div key={v.id} className="text-sm border-t border-white/5 pt-2"><span className="text-[#FFC700]">{'★'.repeat(v.puntuacion)}</span> {v.comentario && <span className="text-gray-400">— {v.comentario}</span>}</div>
          ))}
        </div>
      </div>
      <div className="rounded-xl bg-white/5 border border-white/10 p-5 lg:col-span-2">
        <h3 className="font-semibold">Productos más buscados (por vistas)</h3>
        <div className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 gap-2">
          {masBuscados.map(p => (
            <div key={p.id} className="p-3 rounded-lg bg-white/5 text-sm"><div className="font-medium">{p.nombre}</div><div className="text-gray-400">{p.vistas} vistas</div></div>
          ))}
          {masBuscados.length===0 && <p className="text-gray-400">Sin datos aún.</p>}
        </div>
      </div>
    </div>
  );
}
