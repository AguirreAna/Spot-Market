// Navbar oficial SpotMarket — Estilo, tipografía (Lobster / Inter) y colores inspirados en Daiana45/proyect
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LogoNavbar from '../assets/LogoNavbar.svg';
import { CATEGORIAS_PRODUCTOS } from '../constants/categorias.js';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuCatAbierto, setMenuCatAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const menuRef = useRef(null);
  const inputRef = useRef(null);

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

  // Atajo Ctrl + K para enfocar el buscador
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-negro/90 backdrop-blur-md transition-all duration-300">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:px-8 justify-between">
        {/* Logo oficial SpotMarket */}
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="SpotMarket - Inicio" className="shrink-0 flex items-center gap-2">
            <img src={LogoNavbar} alt="" className="h-10 w-10 shrink-0 object-contain" />
            <span className="font-marca text-2xl text-blanco tracking-wide">
              Spot<span className="text-amarillo">Market</span>
            </span>
          </Link>

          {/* Botón de Categorías con icono cuadriculado */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuCatAbierto((prev) => !prev)}
              aria-expanded={menuCatAbierto}
              className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                menuCatAbierto ? 'border-amarillo text-amarillo' : 'border-borde text-blanco hover:border-gris-azulado'
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
              <span className="hidden sm:inline">Categorías</span>
            </button>

            {menuCatAbierto && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-gris-oscuro border border-borde shadow-2xl py-2 z-50">
                <div className="px-4 py-2 text-xs font-bold text-amarillo uppercase tracking-wider border-b border-borde/60 flex items-center justify-between">
                  <span>Categorías A-Z</span>
                  <span className="text-[10px] text-gris-azulado">27 rubros</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-borde/30">
                  <button
                    onClick={() => seleccionarCategoria('Todas')}
                    className="w-full text-left px-4 py-2 text-xs text-blanco hover:bg-amarillo hover:text-negro font-bold transition-colors"
                  >
                    ★ Ver Todo el Catálogo
                  </button>
                  {CATEGORIAS_PRODUCTOS.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => seleccionarCategoria(cat)}
                      className="w-full text-left px-4 py-2 text-xs text-gris-azulado hover:text-blanco hover:bg-negro/50 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buscador central idéntico a Daiana45/proyect */}
        <div className="relative w-40 sm:w-60 md:w-80 lg:w-96 shrink-0">
          <form onSubmit={handleBuscar} role="search">
            <div className="relative flex items-center rounded-xl border border-borde bg-gris-oscuro py-1.5 pl-3.5 pr-2 transition-colors hover:border-blanco">
              <input
                ref={inputRef}
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar productos o comercios..."
                className="min-w-0 flex-1 bg-transparent pr-16 text-xs text-blanco placeholder:text-gris-azulado focus:outline-none"
              />
              <kbd aria-hidden="true" className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 rounded border border-borde bg-negro px-1.5 py-0.5 text-[10px] text-gris-azulado hidden sm:inline">
                Ctrl K
              </kbd>
              <button
                type="submit"
                aria-label="Ejecutar búsqueda"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer text-rojo transition hover:scale-110"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Sesión y Navegación Derecha */}
        <div className="flex items-center gap-2 sm:gap-3">
          {usuario ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {esComerciante && (
                <Link
                  to="/panel"
                  className="hidden md:inline-flex px-3 py-1.5 rounded-md text-xs font-bold fondo-dorado text-negro shadow hover:brightness-110 transition"
                >
                  📊 Mi Panel
                </Link>
              )}
              <span className="hidden sm:inline text-xs text-gris-azulado max-w-[140px] truncate">
                Hola, <strong className="text-blanco">{usuario.nombre_local || usuario.nombre}</strong>
              </span>
              <button
                type="button"
                onClick={logout}
                className="shrink-0 cursor-pointer rounded-br-2xl border border-borde px-3.5 py-1.5 text-xs font-semibold text-gris-azulado hover:text-blanco hover:border-blanco transition"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="shrink-0 rounded-br-2xl border border-borde px-3.5 py-1.5 text-xs font-semibold text-blanco hover:border-blanco transition"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro-comercio"
                className="shrink-0 rounded-xs fondo-dorado px-3.5 py-1.5 text-xs font-semibold text-negro transition hover:brightness-110"
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
