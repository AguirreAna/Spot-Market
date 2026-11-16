// Registro dual para SpotMarket (Formosa Capital):
// Permite registrar tanto a Usuarios (Consumidores) como a Comerciantes (Locales Comerciales).
// - Si es Comerciante: Sección 1 (Datos + Tipo Minorista/Mayorista + 27 Rubros A-Z), Sección 2 (Mapa con Pantalla Completa), Sección 3 (Fotos de Fachada).
// - Si es Usuario: Registro rápido con nombre, email, teléfono (opcional) y contraseña.
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { TIPOS_COMERCIO, CATEGORIAS_PRODUCTOS } from '../constants/categorias.js';
import LogoNavbar from '../assets/LogoNavbar.svg';

const icono = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const FORMOSA = [-26.1849, -58.1731];

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
    <section className="rounded-2xl bg-gris-oscuro border border-borde p-5 md:p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <span className="h-8 w-8 rounded-full fondo-dorado text-negro font-extrabold flex items-center justify-center text-sm shadow">
          {n}
        </span>
        <h2 className="text-lg font-bold text-blanco">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

export default function RegisterComercio() {
  const nav = useNavigate();
  const { setUsuario } = useAuth();

  // Tipo de registro: 'comerciante' | 'usuario'
  const [rolRegistro, setRolRegistro] = useState('comerciante');

  // Formulario Comerciante
  const [form, setForm] = useState({
    nombre: '',
    nombre_local: '',
    tipo_comercio: TIPOS_COMERCIO[4] || 'Pymes y comercios de barrio',
    telefono: '',
    email: '',
    password: '',
    confirmar: '',
    direccion: '',
    latitud: '-26.1849',
    longitud: '-58.1731'
  });
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState(['Almacén']);
  const [fotos, setFotos] = useState([]);
  const [mapaAgrandado, setMapaAgrandado] = useState(false);

  // Formulario Usuario (con teléfono opcional)
  const [formUsuario, setFormUsuario] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    confirmar: ''
  });

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [ok, setOk] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setU = (k) => (e) => setFormUsuario((f) => ({ ...f, [k]: e.target.value }));

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

  useEffect(() => () => fotos.forEach((f) => URL.revokeObjectURL(f.preview)), [fotos]);

  const posicion = useMemo(() => {
    if (form.latitud && form.longitud) {
      return [parseFloat(form.latitud), parseFloat(form.longitud)];
    }
    return FORMOSA;
  }, [form.latitud, form.longitud]);

  // Submit Registro Usuario
  const onSubmitUsuario = async (e) => {
    e.preventDefault();
    setError('');

    if (formUsuario.password !== formUsuario.confirmar) {
      return setError('Las contraseñas no coinciden.');
    }
    if (formUsuario.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.');
    }

    setCargando(true);
    try {
      const res = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nombre: formUsuario.nombre.trim(),
          email: formUsuario.email.trim(),
          telefono: formUsuario.telefono ? formUsuario.telefono.trim() : null,
          password: formUsuario.password
        })
      });
      if (setUsuario) setUsuario(res.usuario);
      setOk(true);
    } catch (err) {
      setError(err.message || 'Error al registrar tu cuenta de usuario.');
    } finally {
      setCargando(false);
    }
  };

  // Submit Registro Comerciante
  const onSubmitComercio = async (e) => {
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
      setError(err.data?.mensaje || err.message || 'Error al registrar el comercio.');
    } finally {
      setCargando(false);
    }
  };

  if (ok) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-negro">
        <div className="max-w-md w-full rounded-2xl bg-gris-oscuro border border-borde p-8 text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-blanco mb-2">
            {rolRegistro === 'comerciante' ? 'Comercio registrado con éxito' : 'Bienvenido a SpotMarket'}
          </h1>
          <p className="text-gris-azulado mt-2 text-sm">
            {rolRegistro === 'comerciante'
              ? 'Tu local ya forma parte de Spot Market Formosa. Podés ingresar a tu panel para publicar productos y ofertas.'
              : 'Tu cuenta de usuario fue creada correctamente. Ya podés descubrir comercios, ofertas y consultar promociones.'}
          </p>
          <button
            onClick={() => nav(rolRegistro === 'comerciante' ? '/panel' : '/')}
            className="mt-6 w-full rounded-xl fondo-dorado text-negro font-extrabold py-3 text-sm transition shadow-lg hover:brightness-110 cursor-pointer"
          >
            {rolRegistro === 'comerciante' ? 'Ir a mi panel de comerciante' : 'Explorar ofertas en Formosa'}
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-xl bg-negro/70 border border-borde px-3.5 py-2.5 text-xs text-blanco placeholder:text-gris-azulado/60 focus:outline-none focus:border-amarillo transition';

  return (
    <div className="bg-negro min-h-screen text-blanco pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cabecera con Logo */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={LogoNavbar} alt="SpotMarket" className="h-10 w-10 object-contain" />
            <span className="font-marca text-2xl text-blanco">
              Spot<span className="text-amarillo">Market</span>
            </span>
          </Link>
          <Link to="/login" className="text-xs text-gris-azulado hover:text-amarillo transition">
            ¿Ya tenés cuenta? <strong className="text-amarillo">Iniciar sesión</strong>
          </Link>
        </div>

        {/* SELECTOR DUAL DE REGISTRO (SIN ICONOS, SOLO TEXTO) */}
        <div className="mb-8 rounded-2xl bg-gris-oscuro border border-borde p-1.5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              setRolRegistro('comerciante');
              setError('');
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition cursor-pointer ${
              rolRegistro === 'comerciante'
                ? 'fondo-dorado text-negro shadow-md'
                : 'text-gris-azulado hover:text-blanco hover:bg-white/5'
            }`}
          >
            Soy Comerciante
          </button>
          <button
            type="button"
            onClick={() => {
              setRolRegistro('usuario');
              setError('');
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition cursor-pointer ${
              rolRegistro === 'usuario'
                ? 'fondo-dorado text-negro shadow-md'
                : 'text-gris-azulado hover:text-blanco hover:bg-white/5'
            }`}
          >
            Soy Usuario
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-rojo/15 border border-rojo/40 text-rojo text-xs p-3.5">
            {error}
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            FORMULARIO 1: REGISTRO DE USUARIO (CON TELÉFONO OPCIONAL)
           ═══════════════════════════════════════════════ */}
        {rolRegistro === 'usuario' ? (
          <form onSubmit={onSubmitUsuario} className="space-y-6">
            <Seccion n="1" titulo="Datos de la Cuenta de Usuario">
              <p className="text-xs text-gris-azulado mb-4">
                Creá tu cuenta de usuario para seguir comercios de Formosa Capital y recibir promociones.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1.5">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={formUsuario.nombre}
                    onChange={setU('nombre')}
                    placeholder="Ej: Laura Benítez"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={formUsuario.email}
                    onChange={setU('email')}
                    placeholder="laura@ejemplo.com"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1.5">
                    Número de teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={formUsuario.telefono}
                    onChange={setU('telefono')}
                    placeholder="Ej: 3704-123456 (opcional)"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1.5">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={formUsuario.password}
                      onChange={setU('password')}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1.5">
                      Confirmar contraseña
                    </label>
                    <input
                      type="password"
                      value={formUsuario.confirmar}
                      onChange={setU('confirmar')}
                      placeholder="Repetí la contraseña"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </Seccion>

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-xl fondo-dorado text-negro font-extrabold py-3.5 text-sm transition shadow-lg hover:brightness-110 disabled:opacity-50 cursor-pointer"
            >
              {cargando ? 'Creando tu cuenta de usuario...' : 'Completar Registro de Usuario'}
            </button>
          </form>
        ) : (
          /* ═══════════════════════════════════════════════
              FORMULARIO 2: REGISTRO DE COMERCIANTE
             ═══════════════════════════════════════════════ */
          <form onSubmit={onSubmitComercio} className="space-y-6">
            {/* SECCIÓN 1: DATOS COMERCIALES */}
            <Seccion n="1" titulo="Datos Comerciales y Acceso">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1.5">
                    Nombre del titular o responsable
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={set('nombre')}
                    placeholder="Juan Pérez"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-amarillo mb-1.5">
                    Nombre del local comercial
                  </label>
                  <input
                    type="text"
                    value={form.nombre_local}
                    onChange={set('nombre_local')}
                    placeholder="Supermercado San Martín"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1.5">
                    Tipo de comercio
                  </label>
                  <select
                    value={form.tipo_comercio}
                    onChange={set('tipo_comercio')}
                    className={inputClass}
                  >
                    {TIPOS_COMERCIO.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1.5">
                    Teléfono / WhatsApp de contacto (opcional)
                  </label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={set('telefono')}
                    placeholder="3704-XXXXXX (opcional)"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="comercio@ejemplo.com"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1.5">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1.5">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    value={form.confirmar}
                    onChange={set('confirmar')}
                    placeholder="Repetí la contraseña"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* RUBROS DEL COMERCIO */}
              <div className="mt-5 pt-4 border-t border-borde">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase text-amarillo">
                    Rubros ({categoriasSeleccionadas.length} seleccionados)
                  </label>
                  <span className="text-[10px] text-gris-azulado">Opciones en orden alfabético</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-negro/50 border border-borde">
                  {CATEGORIAS_PRODUCTOS.map((cat) => {
                    const sel = categoriasSeleccionadas.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategoria(cat)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                          sel
                            ? 'bg-amarillo text-negro border-amarillo font-bold shadow'
                            : 'bg-white/5 text-gris-azulado border-borde hover:text-blanco hover:border-gris-azulado'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Seccion>

            {/* SECCIÓN 2: UBICACIÓN Y MAPA */}
            <Seccion n="2" titulo="Ubicación del Local en Formosa Capital">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1.5">
                    Dirección física en Formosa
                  </label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={set('direccion')}
                    placeholder="Ej: Av. 25 de Mayo 450, Centro"
                    required
                    className={inputClass}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gris-azulado">
                  <span>Hacé clic en el mapa para marcar la posición exacta del comercio.</span>
                  <button
                    type="button"
                    onClick={() => setMapaAgrandado((v) => !v)}
                    className="font-bold text-amarillo hover:underline cursor-pointer"
                  >
                    {mapaAgrandado ? 'Reducir mapa' : 'Agrandar pantalla completa'}
                  </button>
                </div>

                {/* Contenedor del Mapa Leaflet */}
                <div
                  className={`relative rounded-xl overflow-hidden border border-borde transition-all ${
                    mapaAgrandado
                      ? 'fixed inset-4 z-50 bg-gris-oscuro flex flex-col p-4 shadow-2xl'
                      : 'h-64 sm:h-80 w-full'
                  }`}
                >
                  {mapaAgrandado && (
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-borde">
                      <span className="font-bold text-sm text-blanco">
                        Ubicación en mapa — Formosa Capital
                      </span>
                      <button
                        type="button"
                        onClick={() => setMapaAgrandado(false)}
                        className="px-3 py-1 rounded-lg bg-rojo text-blanco font-bold text-xs shadow hover:brightness-110 cursor-pointer"
                      >
                        Cerrar pantalla completa
                      </button>
                    </div>
                  )}
                  <MapContainer
                    center={posicion}
                    zoom={14}
                    style={{ width: '100%', height: '100%' }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ClickMapa
                      onPick={(lat, lng) => {
                        setForm((f) => ({ ...f, latitud: String(lat), longitud: String(lng) }));
                      }}
                    />
                    <Marker position={posicion} icon={icono} />
                  </MapContainer>
                </div>
              </div>
            </Seccion>

            {/* SECCIÓN 3: FOTOS DE FACHADA */}
            <Seccion n="3" titulo="Fotografías de Fachada del Local">
              <p className="text-xs text-gris-azulado mb-3">
                Subí fotos claras de la fachada o vidriera para que los clientes reconozcan tu negocio fácilmente.
              </p>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onFotos}
                  className="w-full text-xs text-gris-azulado file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:fondo-dorado file:text-negro hover:file:brightness-110 cursor-pointer"
                />

                {fotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {fotos.map((f, i) => (
                      <div
                        key={i}
                        className="relative rounded-xl overflow-hidden border border-borde bg-negro aspect-square shadow group"
                      >
                        <img
                          src={f.preview}
                          alt={`Foto ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <button
                          type="button"
                          onClick={() => quitarFoto(i)}
                          className="absolute top-1 right-1 bg-rojo text-blanco text-[10px] px-2 py-0.5 rounded font-bold shadow hover:scale-105 transition cursor-pointer"
                          title="Quitar foto"
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Seccion>

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-xl fondo-dorado text-negro font-extrabold py-3.5 text-sm transition shadow-lg hover:brightness-110 disabled:opacity-50 cursor-pointer"
            >
              {cargando ? 'Procesando registro comercial...' : 'Completar Registro de Comercio'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
