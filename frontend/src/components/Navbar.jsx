// Navbar principal de SpotMarket con paleta oscura de alto contraste.
// Soporta logo oficial, menú de 27 categorías A-Z reactivo, buscador rápido y estado de sesión.
// Diferencia la barra si el usuario es comerciante o vecino/consumidor.
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LogoNavbar from '../assets/LogoNavbar.svg';
import LogoCompleto from '../assets/Logo.svg';
import { CATEGORIAS_PRODUCTOS } from '../constants/categorias.js';

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

  const esComerciante = usuario?.rol === 'comerciante';

  return (
    <header className="bg-[#0B111E] border-b border-white/10 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo oficial SpotMarket */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="h-10 w-10 rounded-xl bg-[#0B1220] border border-white/10 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform overflow-hidden shadow">
            <img src={LogoCompleto} alt="Spot Market" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline font-black tracking-tight text-xl leading-none">
              <span className="text-white">Spot</span>
              <span className="text-[#FFB800] ml-0.5">Market</span>
            </div>
            <span className="text-[9px] tracking-widest text-gray-400 uppercase font-semibold">Ofertas cerca tuyo</span>
          </div>
        </Link>

        {/* SI ES COMERCIANTE: BARRA DEDICADA DE GESTIÓN */}
        {esComerciante ? (
          <nav className="hidden md:flex items-center gap-2">
            <Link
              to="/panel"
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#FFB800] text-black shadow hover:bg-yellow-400 transition"
            >
              📊 Mi Panel Comerciante
            </Link>
            <Link
              to="/mapa"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              Ver en Mapa
            </Link>
          </nav>
        ) : (
          /* SI ES CLIENTE/PÚBLICO: DESPLEGABLE DE 27 CATEGORÍAS */
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuCatAbierto(!menuCatAbierto)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <svg className="w-4 h-4 text-[#FFB800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Categorías</span>
              <svg
                className={`w-3.5 h-3.5 transition-transform ${menuCatAbierto ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuCatAbierto && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#111A2E] border border-white/15 shadow-2xl py-2 z-50">
                <div className="px-3 py-1 text-xs font-bold text-[#FFB800] uppercase tracking-wider border-b border-white/5 mb-1 flex items-center justify-between">
                  <span>Categorías A-Z</span>
                  <span className="text-[10px] text-gray-400">27 rubros</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <button
                    onClick={() => seleccionarCategoria('Todas')}
                    className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-[#FFB800] hover:text-black font-bold transition-colors border-b border-white/5"
                  >
                    ★ Ver Todo el Catálogo
                  </button>
                  {CATEGORIAS_PRODUCTOS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => seleccionarCategoria(cat)}
                      className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-[#FFB800] hover:text-black font-medium transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Buscador de productos central */}
        <form onSubmit={handleBuscar} className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar productos o comercios en Formosa..."
              className="w-full rounded-full bg-white/5 border border-white/15 px-4 py-1.5 pl-10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#FFB800] transition"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Sesión y Accesos directos */}
        <div className="flex items-center gap-3">
          {usuario ? (
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white truncate max-w-[140px]">
                  {usuario.nombre_local || usuario.nombre}
                </p>
                <p className="text-[10px] text-[#FFB800] font-semibold uppercase">
                  {esComerciante ? '🏪 Local' : '👤 Vecino'}
                </p>
              </div>
              <button
                onClick={logout}
                className="text-xs font-semibold text-gray-300 hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 px-3 py-1.5 rounded-lg transition"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-gray-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro-comercio"
                className="text-xs font-bold bg-[#FFB800] hover:bg-yellow-400 text-black px-3.5 py-1.5 rounded-lg shadow transition"
              >
                Registrar local
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
