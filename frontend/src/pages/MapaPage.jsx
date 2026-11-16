// Mapa de comercios en Formosa Capital con Leaflet y soporte de pantalla completa.
// Consulta /comercios/cercanos (Haversine en backend) si el usuario permite geolocalización.
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api.js';
import LogoNavbar from '../assets/LogoNavbar.svg';

function crearIconoComercio(nombre) {
  return L.divIcon({
    className: 'custom-spotmarket-pin',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto;">
        <div style="background: rgba(10, 20, 40, 0.95); color: #f4f7ff; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 8px; border: 1.5px solid #ffc72c; box-shadow: 0 4px 12px rgba(0,0,0,0.7); white-space: nowrap; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
          <span style="color: #ffc72c;">●</span> ${nombre}
        </div>
        <div style="width: 32px; height: 32px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));">
          <img src="${LogoNavbar}" style="width: 100%; height: 100%; object-fit: contain;" alt="${nombre}" />
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
}

const FORMOSA = [-26.1849, -58.1731];

export default function MapaPage() {
  const [comercios, setComercios] = useState([]);
  const [info, setInfo] = useState('Buscando comercios…');
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    const cargar = async (lat, lng) => {
      try {
        if (lat != null && lng != null) {
          const res = await api(`/comercios/cercanos?lat=${lat}&lng=${lng}&radio=15`);
          setComercios(res.comercios || []);
          setInfo(`Mostrando comercios cercanos (radio 15 km).`);
        } else {
          const res = await api('/comercios');
          setComercios(res.comercios || []);
          setInfo('Mostrando comercios de Formosa Capital.');
        }
      } catch (e) {
        setInfo(e.message);
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => cargar(pos.coords.latitude, pos.coords.longitude),
        () => cargar(null, null),
        { timeout: 6000 }
      );
    } else {
      cargar(null, null);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-blanco">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blanco">Comercios en Formosa Capital</h1>
          <p className="text-gris-azulado mt-1 text-sm">{info}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpandido(true)}
          className="self-start sm:self-auto fondo-dorado text-negro font-extrabold px-4 py-2 rounded-xl text-xs transition flex items-center shadow-lg hover:brightness-110"
        >
          Agrandar pantalla completa
        </button>
      </div>

      <div className="mt-6 rounded-2xl overflow-hidden border border-borde shadow-2xl relative" style={{ height: 520 }}>
        <MapContainer center={FORMOSA} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {comercios
            .filter((c) => c.latitud && c.longitud)
            .map((c) => (
              <Marker key={c.id} position={[parseFloat(c.latitud), parseFloat(c.longitud)]} icon={crearIconoComercio(c.nombre_local)}>
                <Popup>
                  <div className="p-1 text-blanco">
                    <p className="font-bold text-sm text-amarillo">{c.nombre_local}</p>
                    <p className="text-xs text-gris-azulado font-semibold uppercase">{c.tipo_comercio || 'Minorista'}</p>
                    <p className="text-xs text-blanco mt-1">{c.direccion}</p>
                    {c.distancia != null && <p className="text-xs text-azul font-medium mt-1">A {c.distancia} km</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* MODAL FULL-SCREEN: MAPA EXPANDIDO */}
      {expandido && (
        <div className="fixed inset-0 z-[1000] bg-negro/95 backdrop-blur flex flex-col p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-borde">
            <div>
              <h2 className="text-lg font-bold text-blanco flex items-center gap-2">
                Mapa de Formosa Capital — Pantalla Completa
              </h2>
              <p className="text-xs text-gris-azulado">
                Mostrando todos los comercios barriales registrados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpandido(false)}
              className="bg-rojo hover:brightness-110 text-blanco px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg"
            >
              Salir de pantalla completa
            </button>
          </div>
          <div className="flex-1 mt-3 rounded-2xl overflow-hidden border border-borde relative">
            <MapContainer center={FORMOSA} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {comercios
                .filter((c) => c.latitud && c.longitud)
                .map((c) => (
                  <Marker key={c.id} position={[parseFloat(c.latitud), parseFloat(c.longitud)]} icon={crearIconoComercio(c.nombre_local)}>
                    <Popup>
                      <div className="p-1 text-blanco">
                        <p className="font-bold text-sm text-amarillo">{c.nombre_local}</p>
                        <p className="text-xs text-gris-azulado font-semibold uppercase">{c.tipo_comercio || 'Minorista'}</p>
                        <p className="text-xs text-blanco mt-1">{c.direccion}</p>
                        {c.distancia != null && <p className="text-xs text-azul font-medium mt-1">A {c.distancia} km</p>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}
