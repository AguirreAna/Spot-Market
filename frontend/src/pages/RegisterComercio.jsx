// Registro de comerciante (flujo completo, 1 página con 3 secciones):
// 1) Datos del local, 2) Ubicación (mini-mapa Leaflet clickeable), 3) Fotos (previews).
// Envía multipart/form-data a POST /api/auth/register-comercio (crea usuario+comercio+fotos).
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const icono = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const FORMOSA = [-26.1849, -58.1731];
const TIPOS_COMERCIO = ['Almacén','Carnicería','Panadería','Verdulería','Lácteos','Supermercado','Bebidas','Limpieza','Kiosco','Otros'];
const RUBROS = ['Alimentos','Bebidas','Lácteos','Panadería','Carnes','Frutas y Verduras','Limpieza','Higiene','Kiosco','Mascotas'];

// Captura el click en el mapa y reporta lat/lng al formulario.
function ClickMapa({ onPick }) {
  useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
  return null;
}

function Seccion({ n, titulo, children }) {
  return (
    <section className="rounded-2xl bg-[#0a1222]/80 backdrop-blur-xl border border-white/10 p-5 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="h-8 w-8 rounded-full bg-brand-yellow text-black font-bold flex items-center justify-center">{n}</span>
        <h2 className="text-lg font-semibold text-white">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

export default function RegisterComercio() {
  const nav = useNavigate();
  const { setUsuario } = useAuth();
  const [form, setForm] = useState({
    nombre: '', nombre_local: '', tipo_comercio: '', telefono: '', email: '', password: '', confirmar: '',
    direccion: '', latitud: '', longitud: ''
  });
  const [rubros, setRubros] = useState([]);
  const [fotos, setFotos] = useState([]); // {file, preview}
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [ok, setOk] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleRubro = (r) => setRubros((rs) => rs.includes(r) ? rs.filter(x=>x!==r) : [...rs, r]);

  const onFotos = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => ['image/jpeg','image/png','image/webp'].includes(f.type) && f.size <= 5*1024*1024);
    const nuevos = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setFotos((prev) => [...prev, ...nuevos].slice(0, 8));
  };
  const quitarFoto = (i) => setFotos((prev) => { URL.revokeObjectURL(prev[i].preview); return prev.filter((_,idx)=>idx!==i); });
  useEffect(() => () => fotos.forEach((f) => URL.revokeObjectURL(f.preview)), []); // limpieza

  const posicion = useMemo(() => (form.latitud && form.longitud ? [parseFloat(form.latitud), parseFloat(form.longitud)] : null), [form.latitud, form.longitud]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmar) return setError('Las contraseñas no coinciden.');
    setCargando(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => { if (k !== 'confirmar' && v !== '') fd.append(k, v); });
      fd.append('tipos_productos', rubros.join(','));
      fotos.forEach((f) => fd.append('fotos', f.file));
      const res = await api('/auth/register-comercio', { method: 'POST', body: fd });
      setUsuario(res.usuario);
      setOk(true);
    } catch (err) {
      setError(err.data?.mensaje || err.message || 'No se pudo registrar el comercio.');
    } finally {
      setCargando(false);
    }
  };

  if (ok) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#0B0F19]">
        <div className="max-w-md w-full rounded-2xl bg-[#0a1222]/80 backdrop-blur-xl border border-white/10 p-8 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold">¡Comercio registrado!</h1>
          <p className="text-gray-300 mt-2">Ya podés cargar productos y crear ofertas para aparecer en Spot Market.</p>
          <button onClick={() => nav('/panel')} className="mt-6 w-full rounded-lg bg-[#FFC700] text-black font-semibold py-2.5">Ir a mi panel</button>
        </div>
      </div>
    );
  }

  const input = "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-[#FFC700]";
  return (
    <div className="bg-[#0B0F19] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold">Registrá tu <span className="text-[#FFC700]">comercio</span></h1>
        <p className="text-gray-400 mt-1">Subí tus datos y empezá a aparecer en el mapa para los vecinos de Formosa Capital.</p>

        <form onSubmit={onSubmit} className="mt-8 grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Seccion n="1" titulo="Datos del local">
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-sm text-gray-300">Nombre del responsable</label><input className={input} value={form.nombre} onChange={set('nombre')} required /></div>
                <div><label className="text-sm text-gray-300">Nombre del local</label><input className={input} value={form.nombre_local} onChange={set('nombre_local')} required /></div>
                <div><label className="text-sm text-gray-300">Tipo de comercio</label>
                  <select className={input + ' bg-[#0a1222]'} value={form.tipo_comercio} onChange={set('tipo_comercio')} required>
                    <option value="">Seleccionar…</option>{TIPOS_COMERCIO.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="text-sm text-gray-300">Teléfono</label><input className={input} value={form.telefono} onChange={set('telefono')} /></div>
                <div><label className="text-sm text-gray-300">Correo</label><input type="email" className={input} value={form.email} onChange={set('email')} required /></div>
                <div><label className="text-sm text-gray-300">Contraseña</label><input type="password" className={input} value={form.password} onChange={set('password')} required minLength={6} /></div>
                <div className="sm:col-span-2"><label className="text-sm text-gray-300">Confirmar contraseña</label><input type="password" className={input} value={form.confirmar} onChange={set('confirmar')} required minLength={6} /></div>
              </div>
              <div className="mt-4">
                <label className="text-sm text-gray-300">Tipos de productos que vendés</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {RUBROS.map(r => (
                    <button type="button" key={r} onClick={()=>toggleRubro(r)}
                      className={`px-3 py-1 rounded-full text-sm border ${rubros.includes(r)?'bg-[#FFC700] text-black border-[#FFC700]':'border-white/15 text-gray-300 hover:border-white/30'}`}>{r}</button>
                  ))}
                </div>
              </div>
            </Seccion>
          </div>

          <div className="space-y-6">
            <Seccion n="2" titulo="Ubicación">
              <label className="text-sm text-gray-300">Dirección</label>
              <input className={input + ' mt-1'} value={form.direccion} onChange={set('direccion')} placeholder="Ej: Av. 25 de Mayo 123" />
              <p className="text-xs text-gray-400 mt-3 mb-2">Hacé click en el mapa para marcar la ubicación (se usan tus coordenadas para mostrarte a clientes cercanos).</p>
              <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: 240 }}>
                <MapContainer center={posicion || FORMOSA} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <ClickMapa onPick={(lat,lng)=>setForm(f=>({...f, latitud: lat.toFixed(7), longitud: lng.toFixed(7)}))} />
                  {posicion && <Marker position={posicion} icon={icono} />}
                </MapContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input className={input} value={form.latitud} readOnly placeholder="Latitud" />
                <input className={input} value={form.longitud} readOnly placeholder="Longitud" />
              </div>
            </Seccion>

            <Seccion n="3" titulo="Fotos del local">
              <label className="block rounded-xl border border-dashed border-white/20 p-4 text-center text-gray-300 hover:border-[#FFC700]/50 cursor-pointer">
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onFotos} />
                Subir fotos (jpg, png o webp · máx. 5 MB c/u)
              </label>
              {fotos.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {fotos.map((f,i)=>(
                    <div key={i} className="relative group">
                      <img src={f.preview} alt="" className="h-20 w-full object-cover rounded-lg" />
                      <button type="button" onClick={()=>quitarFoto(i)} className="absolute top-1 right-1 bg-black/70 text-white rounded-full h-6 w-6 text-xs opacity-0 group-hover:opacity-100">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </Seccion>
          </div>

          <div className="lg:col-span-2">
            {error && <p className="mb-3 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={cargando}
              className="w-full md:w-auto px-8 rounded-lg bg-[#FFC700] hover:bg-yellow-300 text-black font-semibold py-3 transition disabled:opacity-60">
              {cargando ? 'Registrando…' : 'Registrar mi comercio'}
            </button>
            <p className="text-sm text-gray-400 mt-3">¿Ya tenés cuenta? <Link to="/login" className="text-[#FFC700]">Ingresar</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}
