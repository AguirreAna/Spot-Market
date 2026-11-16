// Rutas principales de SpotMarket (React Router v7).
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Inicio from './pages/Inicio.jsx';
import Productos from './pages/Productos.jsx';
import Ofertas from './pages/Ofertas.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterComercio from './pages/RegisterComercio.jsx';
import PanelComercio from './pages/PanelComercio.jsx';
import Perfil from './pages/Perfil.jsx';
import DetalleProducto from './pages/DetalleProducto.jsx';
import MapaPage from './pages/MapaPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-negro text-blanco transition-colors duration-200">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/catalogo" element={<Productos />} />
          <Route path="/productos/:id" element={<DetalleProducto />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro-comercio" element={<RegisterComercio />} />
          <Route path="/panel" element={<PanelComercio />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/mapa" element={<MapaPage />} />
        </Routes>
      </main>
    </div>
  );
}
