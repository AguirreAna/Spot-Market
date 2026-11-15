// Mapa de comercios en Formosa Capital con Leaflet.
// Si el usuario permite geolocalización, consulta /comercios/cercanos (Haversine en backend)
// y muestra la distancia. Distancia = "qué tan lejos" calculada sobre coordenadas.
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api.js';

// Fix de íconos de Leaflet en bundlers (Vite): usa URLs explícitas.
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Comercios cercanos</h1>
      <p className="text-gray-400 mt-1">{info}</p>
      <div className="mt-6 rounded-xl overflow-hidden border border-white/10" style={{ height: 480 }}>
        <MapContainer center={FORMOSA} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {comercios.filter(c => c.latitud && c.longitud).map((c) => (
            <Marker key={c.id} position={[parseFloat(c.latitud), parseFloat(c.longitud)]} icon={icono}>
              <Popup>
                <b>{c.nombre_local}</b><br />{c.direccion || c.tipo_comercio}
                {c.distancia != null && <><br />A {c.distancia} km</>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
