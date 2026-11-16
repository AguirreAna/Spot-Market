// Página de login: estética oscura con mapa real de Formosa Capital en el fondo,
// mostrando los comercios registrados con el logo de SpotMarket apuntando a su ubicación y su nombre.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api.js';
import LoginForm from '../components/auth/LoginForm.jsx';
import LogoNavbar from '../assets/LogoNavbar.svg';

const FORMOSA = [-26.1849, -58.1731];

// Genera un icono personalizado con el pin/logo de SpotMarket apuntando a la coordenada y el nombre del comercio
function crearIconoComercio(nombre) {
  return L.divIcon({
    className: 'custom-spotmarket-pin',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto;">
        <div style="background: rgba(10, 20, 40, 0.95); color: #f4f7ff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 8px; border: 1.5px solid #ffc72c; box-shadow: 0 4px 12px rgba(0,0,0,0.7); white-space: nowrap; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
          <span style="color: #ffc72c;">●</span> ${nombre}
        </div>
        <div style="width: 36px; height: 36px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));">
          <img src="${LogoNavbar}" style="width: 100%; height: 100%; object-fit: contain;" alt="${nombre}" />
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
}

export default function LoginPage() {
  const [comercios, setComercios] = useState([]);

  useEffect(() => {
    async function cargarComercios() {
      try {
        const res = await api('/comercios');
        setComercios(res.comercios || []);
      } catch (err) {
        console.warn('Error cargando comercios en login:', err.message);
      }
    }
    cargarComercios();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-negro">
      {/* ── MAPA DE FORMOSA CAPITAL EN EL FONDO ── */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={FORMOSA}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {comercios
            .filter((c) => c.latitud && c.longitud)
            .map((com) => {
              const lat = parseFloat(com.latitud);
              const lng = parseFloat(com.longitud);
              return (
                <Marker
                  key={com.id}
                  position={[lat, lng]}
                  icon={crearIconoComercio(com.nombre_local)}
                >
                  <Popup>
                    <div className="p-1 text-blanco">
                      <p className="font-bold text-sm text-amarillo">{com.nombre_local}</p>
                      <p className="text-xs text-gris-azulado font-semibold uppercase">{com.tipo_comercio || 'Comercio'}</p>
                      <p className="text-xs text-blanco mt-1">{com.direccion}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
        {/* Capa oscura con viñeta para destacar la tarjeta de login */}
        <div className="absolute inset-0 bg-negro/50 backdrop-blur-[2px] pointer-events-none" />
      </div>

      {/* Barra superior con indicador de comercios y volver al inicio */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 pointer-events-none">
        <div className="flex items-center gap-2 bg-gris-oscuro/90 backdrop-blur px-3 py-1.5 rounded-xl border border-borde pointer-events-auto">
          <span className="text-xs font-bold text-gris-azulado">Formosa Capital · {comercios.length} comercios en mapa</span>
        </div>
        <Link
          to="/"
          className="text-xs font-bold bg-gris-oscuro/90 hover:bg-gris-oscuro text-blanco border border-borde px-3.5 py-1.5 rounded-xl shadow transition pointer-events-auto"
        >
          &larr; Volver al inicio
        </Link>
      </div>

      {/* ── TARJETA CENTRAL: INICIAR SESIÓN CON RECUPERAR CONTRASEÑA ── */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-3xl bg-gris-oscuro/95 backdrop-blur-xl border border-borde p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <img src={LogoNavbar} alt="SpotMarket Logo" className="h-10 w-10 object-contain" />
            <span className="font-marca text-3xl text-blanco">
              Spot<span className="text-amarillo">Market</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-blanco">Iniciar Sesión</h1>
          <p className="text-xs text-gris-azulado mt-1">
            Accedé para gestionar tu comercio o consultar ofertas en Formosa
          </p>
        </div>

        <LoginForm />

        <div className="mt-6 pt-4 border-t border-borde/60 text-center">
          <p className="text-xs text-gris-azulado">
            ¿No tenés una cuenta todavía?{' '}
            <Link to="/registro-comercio" className="text-amarillo hover:underline font-bold">
              Registrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
