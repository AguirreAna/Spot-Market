// Navbar principal de SpotMarket con paleta oscura de alto contraste.
// Soporta logo oficial, menú de categorías desplegable, buscador rápido y estado de sesión.
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LogoNavbar from '../assets/LogoNavbar.svg';

const CATEGORIAS = [
  'Todas',
  'Alimentos',
  'Bebidas',
  'Panadería',
  'Frutas y Verduras',
  'Limpieza',
  'Lácteos',
  'Carnes',
  'Deportes',
  'Hogar',
  'Mascotas',
  'Otros'
];

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuCatAbierto, setMenuCatAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const menuRef = useRef(null);

  // Cerrar menú al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuCatAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBuscar = (e) => {
    e.preventDefault();
    if (busqueda.trim()) {
      navigate(`/productos?q=${encodeURIComponent(busqueda.trim())}`);
    } else {
      navigate('/productos');
    }
  };

  const seleccionarCategoria = (cat) => {
    setMenuCatAbierto(false);
    if (cat === 'Todas') {
      navigate('/productos');
    } else {
      navigate(`/productos?categoria=${encodeURIComponent(cat)}`);
    }
  };

  return (
    <header className="bg-[#0B111E] border-b border-white/10 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo de SpotMarket */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-9 h-9 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
            <img src={LogoNavbar} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-baseline font-black tracking-tight text-xl">
            <span className="text-white">Spot</span>
            <span className="text-[#FFB800] ml-0.5">Market</span>
          </div>
        </Link>

        {/* Botón de Categorías desplegable */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuCatAbierto(!menuCatAbierto)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <svg className="w-4 h-4 text-[#FFB800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Categorías</span>
            <svg className={`w-3.5 h-3.5 transition-transform ${menuCatAbierto ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuCatAbierto && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#111A2E] border border-white/15 shadow-2xl py-2 z-50">
              <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 mb-1">
                Rubros y Categorías
              </div>
              <div className="max-h-72 overflow-y-auto">
                {CATEGORIAS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => seleccionarCategoria(cat)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-[#FFB800] hover:text-black font-medium transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Buscador central */}
        <form onSubmit={handleBuscar} className="flex-1 max-w-lg hidden sm:flex items-center relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar productos o comercios en Formosa..."
            className="w-full bg-[#111A2E] text-white placeholder-gray-400 text-sm rounded-full pl-10 pr-4 py-2 border border-white/15 focus:outline-none focus:border-[#FFB800] transition-colors"
          />
          <button type="submit" className="absolute left-3 text-gray-400 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Enlaces de Mapa y Ofertas */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          <Link to="/mapa" className="text-gray-300 hover:text-[#FFB800] flex items-center gap-1.5 transition-colors">
            <span className="text-red-500">📍</span> Ver Mapa
          </Link>
          <Link to="/productos" className="text-gray-300 hover:text-[#FFB800] transition-colors">
            Productos
          </Link>
          <Link to="/ofertas" className="text-gray-300 hover:text-[#FFB800] transition-colors">
            Ofertas
          </Link>
        </div>

        {/* Acciones de usuario / comerciante */}
        <div className="flex items-center gap-3">
          {usuario ? (
            <div className="flex items-center gap-3">
              {usuario.rol === 'comerciante' ? (
                <Link
                  to="/panel"
                  className="px-3 py-1.5 rounded-lg bg-[#FFB800]/15 border border-[#FFB800]/40 text-[#FFB800] text-xs font-semibold hover:bg-[#FFB800]/25 transition-colors flex items-center gap-1.5"
                >
                  <span>🏪</span> {usuario.nombre_local || 'Mi Comercio'}
                </Link>
              ) : (
                <span className="text-xs text-gray-300 font-medium hidden sm:inline">
                  Hola, <strong className="text-white">{usuario.nombre}</strong>
                </span>
              )}
              <button
                onClick={logout}
                className="text-xs font-semibold text-gray-400 hover:text-red-400 border border-white/10 px-2.5 py-1.5 rounded-lg hover:border-red-500/30 transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro-comercio"
                className="bg-[#FFB800] hover:bg-[#FFA500] text-black text-sm font-bold px-4 py-1.5 rounded-full shadow-lg transition-transform hover:scale-105"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
