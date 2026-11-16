// Mapa de comercios en Formosa Capital con Leaflet y soporte de pantalla completa.
// Consulta /comercios/cercanos (Haversine en backend) si el usuario permite geolocalización.
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api.js';

const icono = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

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
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Comercios en Formosa Capital</h1>
          <p className="text-gray-400 mt-1">{info}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpandido(true)}
          className="self-start sm:self-auto bg-[#FFB800] hover:bg-yellow-400 text-black font-extrabold px-4 py-2 rounded-xl text-xs transition flex items-center gap-2 shadow-lg"
        >
          <span>⛶</span> Agrandar pantalla completa
        </button>
      </div>

      <div className="mt-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative" style={{ height: 520 }}>
        <MapContainer center={FORMOSA} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {comercios
            .filter((c) => c.latitud && c.longitud)
            .map((c) => (
              <Marker key={c.id} position={[parseFloat(c.latitud), parseFloat(c.longitud)]} icon={icono}>
                <Popup className="spot-popup">
                  <div className="p-1 text-black">
                    <p className="font-bold text-sm text-red-600">{c.nombre_local}</p>
                    <p className="text-xs text-gray-700 font-semibold uppercase">{c.tipo_comercio || 'Minorista'}</p>
                    <p className="text-xs text-gray-800 mt-1">📍 {c.direccion}</p>
                    {c.distancia != null && <p className="text-xs text-blue-600 font-medium mt-1">A {c.distancia} km</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>

      {/* MODAL FULL-SCREEN: MAPA EXPANDIDO */}
      {expandido && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur flex flex-col p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📍</span> Mapa de Formosa Capital — Pantalla Completa
              </h2>
              <p className="text-xs text-gray-400">
                Mostrando todos los comercios barriales registrados.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpandido(false)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow"
            >
              <span>✕</span> Reducir Pantalla
            </button>
          </div>
          <div className="flex-1 mt-3 rounded-2xl overflow-hidden border border-white/20">
            <MapContainer center={FORMOSA} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {comercios
                .filter((c) => c.latitud && c.longitud)
                .map((c) => (
                  <Marker key={c.id} position={[parseFloat(c.latitud), parseFloat(c.longitud)]} icon={icono}>
                    <Popup className="spot-popup">
                      <div className="p-1 text-black">
                        <p className="font-bold text-sm text-red-600">{c.nombre_local}</p>
                        <p className="text-xs text-gray-700 font-semibold uppercase">{c.tipo_comercio || 'Minorista'}</p>
                        <p className="text-xs text-gray-800 mt-1">📍 {c.direccion}</p>
                        {c.distancia != null && <p className="text-xs text-blue-600 font-medium mt-1">A {c.distancia} km</p>}
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
