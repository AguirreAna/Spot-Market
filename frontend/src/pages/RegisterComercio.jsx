// Registro de comerciante para SpotMarket (Formosa Capital).
// Sección 1: Datos (Tipo de comercio: Minorista o Mayorista; Categoría de productos: 27 opciones en orden alfabético).
// Sección 2: Ubicación en mapa Leaflet con opción de Agrandar Pantalla Completa.
// Sección 3: Fotografías del local con previsualización inmediata.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { TIPOS_COMERCIO, CATEGORIAS_PRODUCTOS } from '../constants/categorias.js';
import LogoCompleto from '../assets/Logo.svg';

const icono = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const FORMOSA = [-26.1849, -58.1731];

// Captura el click en el mapa y actualiza lat/lng
function ClickMapa({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function Seccion({ n, titulo, children }) {
  return (
    <section className="rounded-2xl bg-[#0a1222]/80 backdrop-blur-xl border border-white/10 p-5 md:p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <span className="h-8 w-8 rounded-full bg-[#FFB800] text-black font-bold flex items-center justify-center">
          {n}
        </span>
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
    nombre: '',
    nombre_local: '',
    tipo_comercio: 'Minorista',
    telefono: '',
    email: '',
    password: '',
    confirmar: '',
    direccion: '',
    latitud: '-26.1849',
    longitud: '-58.1731'
  });
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState(['Almacén']);
  const [fotos, setFotos] = useState([]); // { file, preview }
  const [mapaAgrandado, setMapaAgrandado] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [ok, setOk] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toggleCategoria = (cat) => {
    setCategoriasSeleccionadas((prev) =>
      prev.includes(cat) ? prev.filter((x) => x !== cat) : [...prev, cat]
    );
  };

  const onFotos = (e) => {
    const files = Array.from(e.target.files || []).filter(
      (f) =>
        ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type) &&
        f.size <= 5 * 1024 * 1024
    );
    const nuevos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setFotos((prev) => [...prev, ...nuevos].slice(0, 8));
  };

  const quitarFoto = (i) => {
    setFotos((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  useEffect(() => () => fotos.forEach((f) => URL.revokeObjectURL(f.preview)), []);

  const posicion = useMemo(() => {
    if (form.latitud && form.longitud) {
      return [parseFloat(form.latitud), parseFloat(form.longitud)];
    }
    return FORMOSA;
  }, [form.latitud, form.longitud]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmar) {
      return setError('Las contraseñas no coinciden.');
    }
    if (form.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }
    if (categoriasSeleccionadas.length === 0) {
      return setError('Seleccioná al menos una categoría de productos.');
    }

    setCargando(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'confirmar' && v !== '') fd.append(k, v);
      });
      fd.append('categoria_productos', categoriasSeleccionadas.join(', '));
      fd.append('tipos_productos', categoriasSeleccionadas.join(', '));
      fotos.forEach((f) => fd.append('fotos', f.file));

      const res = await api('/auth/register-comercio', { method: 'POST', body: fd });
      if (setUsuario) setUsuario(res.usuario);
      setOk(true);
    } catch (err) {
      setError(err.data?.mensaje || err.message || 'Error interno del servidor al registrar el comercio.');
    } finally {
      setCargando(false);
    }
  };

  if (ok) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#070C16]">
        <div className="max-w-md w-full rounded-2xl bg-[#111A2E] border border-white/10 p-8 text-center shadow-2xl">
          <div className="text-4xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-white">¡Comercio registrado con éxito!</h1>
          <p className="text-gray-300 mt-2">
            Tu local ya forma parte de Spot Market Formosa. Podés ingresar a tu panel para publicar productos y ofertas.
          </p>
          <button
            onClick={() => nav('/panel')}
            className="mt-6 w-full rounded-xl bg-[#FFB800] hover:bg-yellow-400 text-black font-bold py-3 transition shadow-lg"
          >
            Ir a mi panel de comerciante
          </button>
        </div>
      </div>
    );
  }

  const input =
    'w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white focus:outline-none focus:border-[#FFB800] transition';

  return (
    <div className="bg-[#070C16] min-h-screen text-white pb-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0B1220] border border-white/15 p-1 flex items-center justify-center shadow-xl flex-shrink-0">
            <img src={LogoCompleto} alt="Spot Market Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Registrá tu <span className="text-[#FFB800]">comercio</span> en Spot Market
            </h1>
            <p className="text-gray-400 mt-1">
              Sumá tu negocio local de Formosa Capital para que los vecinos encuentren tus productos, precios y promociones.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid lg:grid-cols-2 gap-8">
          {/* COLUMNA IZQUIERDA: DATOS Y CATEGORÍAS */}
          <div className="space-y-6">
            <Seccion n="1" titulo="Datos del local">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Nombre del responsable
                  </label>
                  <input className={input} value={form.nombre} onChange={set('nombre')} required />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Nombre del local comercial
                  </label>
                  <input className={input} value={form.nombre_local} onChange={set('nombre_local')} required />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#FFB800]">
                    Tipo de comercio
                  </label>
                  <select
                    className={input + ' bg-[#111A2E] text-white font-medium'}
                    value={form.tipo_comercio}
                    onChange={set('tipo_comercio')}
                    required
                  >
                    {TIPOS_COMERCIO.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Teléfono / WhatsApp
                  </label>
                  <input className={input} placeholder="Ej: 3704123456" value={form.telefono} onChange={set('telefono')} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Correo electrónico
                  </label>
                  <input type="email" className={input} value={form.email} onChange={set('email')} required />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Contraseña
                  </label>
                  <input type="password" className={input} value={form.password} onChange={set('password')} required minLength={6} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Confirmar contraseña
                  </label>
                  <input type="password" className={input} value={form.confirmar} onChange={set('confirmar')} required minLength={6} />
                </div>
              </div>

              {/* CATEGORÍA DE PRODUCTOS (27 OPCIONES EN ORDEN ALFABÉTICO) */}
              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FFB800]">
                    Categoría de productos ({categoriasSeleccionadas.length} seleccionadas)
                  </label>
                  <span className="text-[11px] text-gray-400">Orden alfabético A-Z</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Hacé click sobre los rubros que comercializás en tu negocio:
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-1.5 rounded-xl bg-black/20 border border-white/5">
                  {CATEGORIAS_PRODUCTOS.map((cat) => {
                    const sel = categoriasSeleccionadas.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategoria(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          sel
                            ? 'bg-[#FFB800] text-black font-bold shadow'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {sel ? '✓ ' : '+ '} {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Seccion>
          </div>

          {/* COLUMNA DERECHA: UBICACIÓN Y FOTOS */}
          <div className="space-y-6">
            <Seccion n="2" titulo="Ubicación en Formosa Capital">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Dirección del local
              </label>
              <input
                className={input + ' mt-1'}
                value={form.direccion}
                onChange={set('direccion')}
                placeholder="Ej: Av. 25 de Mayo 450, Formosa"
              />

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Hacé click en el mapa para marcar el punto exacto:
                </p>
                {/* BOTÓN PARA AGRANDAR PANTALLA DEL MAPA */}
                <button
                  type="button"
                  onClick={() => setMapaAgrandado(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFB800] bg-[#FFB800]/10 border border-[#FFB800]/30 px-3 py-1 rounded-lg hover:bg-[#FFB800]/20 transition"
                >
                  <span>⛶</span> Agrandar mapa
                </button>
              </div>

              {/* VISTA NORMAL DEL MAPA */}
              <div className="mt-2 rounded-xl overflow-hidden border border-white/15 shadow-inner" style={{ height: 260 }}>
                <MapContainer center={posicion} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ClickMapa
                    onPick={(lat, lng) =>
                      setForm((f) => ({
                        ...f,
                        latitud: lat.toFixed(7),
                        longitud: lng.toFixed(7)
                      }))
                    }
                  />
                  {posicion && <Marker position={posicion} icon={icono} />}
                </MapContainer>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Latitud:</span> {form.latitud}
                </div>
                <div>
                  <span className="text-gray-400">Longitud:</span> {form.longitud}
                </div>
              </div>
            </Seccion>

            <Seccion n="3" titulo="Fotos del local comercial">
              <p className="text-xs text-gray-400 mb-3">
                Subí fotos de la fachada o mostrador para que los vecinos reconozcan tu negocio (formato JPG, PNG o WebP):
              </p>
              <label className="block rounded-xl border-2 border-dashed border-white/20 p-5 text-center text-gray-300 hover:border-[#FFB800]/70 cursor-pointer bg-white/5 transition">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  className="hidden"
                  onChange={onFotos}
                />
                <span className="text-2xl block mb-1">📷</span>
                <span className="text-sm font-semibold text-white">Click para seleccionar fotos</span>
                <span className="text-xs text-gray-400 block mt-1">Podés subir hasta 8 imágenes</span>
              </label>

              {/* PREVISUALIZACIÓN DE FOTOS SUBIDAS */}
              {fotos.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-[#FFB800] mb-2">
                    Fotos cargadas ({fotos.length}):
                  </p>
                  <div className="grid grid-cols-4 gap-2.5">
                    {fotos.map((f, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-white/20 aspect-square">
                        <img src={f.preview} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => quitarFoto(i)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow"
                          title="Eliminar foto"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Seccion>
          </div>

          {/* BOTÓN SUBMIT Y ERRORES */}
          <div className="lg:col-span-2 mt-4 pt-4 border-t border-white/10">
            {error && (
              <div className="mb-4 text-sm text-red-200 bg-red-900/40 border border-red-500/50 rounded-xl px-4 py-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                type="submit"
                disabled={cargando}
                className="w-full sm:w-auto px-10 rounded-xl bg-[#FFB800] hover:bg-yellow-400 text-black font-extrabold py-3.5 transition shadow-lg text-base disabled:opacity-60"
              >
                {cargando ? 'Registrando comercio…' : 'Registrar mi comercio en Spot Market'}
              </button>
              <p className="text-sm text-gray-400">
                ¿Ya tenés cuenta?{' '}
                <Link to="/login" className="text-[#FFB800] font-semibold hover:underline">
                  Iniciá sesión aquí
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* MODAL FULL-SCREEN: MAPA EN PANTALLA COMPLETA */}
      {mapaAgrandado && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur flex flex-col p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📍</span> Elegí la ubicación de tu local en Formosa Capital
              </h2>
              <p className="text-xs text-gray-400">
                Hacé click en cualquier calle o barrio para marcar la coordenada exacta.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMapaAgrandado(false)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-1.5 shadow"
            >
              <span>✕</span> Reducir y Guardar Punto
            </button>
          </div>
          <div className="flex-1 mt-3 rounded-2xl overflow-hidden border border-white/20">
            <MapContainer center={posicion} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickMapa
                onPick={(lat, lng) =>
                  setForm((f) => ({
                    ...f,
                    latitud: lat.toFixed(7),
                    longitud: lng.toFixed(7)
                  }))
                }
              />
              {posicion && <Marker position={posicion} icon={icono} />}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}
