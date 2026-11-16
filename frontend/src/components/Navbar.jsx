// Navbar oficial SpotMarket — Estilo, tipografía y mega-menú de categorías idénticos a la referencia.
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LogoNavbar from '../assets/LogoNavbar.svg';
import MenuCategorias from './MenuCategorias.jsx';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuCatAbierto, setMenuCatAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const inputRef = useRef(null);

  // Modo Oscuro / Claro
  const [tema, setTema] = useState(() => {
    try {
      return localStorage.getItem('theme') || localStorage.getItem('tema') || 'oscuro';
    } catch {
      return 'oscuro';
    }
  });

  useEffect(() => {
    if (tema === 'claro') {
      document.documentElement.classList.add('tema-claro');
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.classList.remove('tema-claro');
      document.documentElement.style.colorScheme = 'dark';
    }
    try {
      localStorage.setItem('theme', tema);
      localStorage.setItem('tema', tema);
    } catch {}
  }, [tema]);

  const alternarTema = () => {
    setTema((prev) => (prev === 'oscuro' ? 'claro' : 'oscuro'));
  };

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
    setMenuCatAbierto(false);
    if (busqueda.trim()) {
      navigate(`/productos?buscar=${encodeURIComponent(busqueda.trim())}`);
    } else {
      navigate('/productos');
    }
  };

  const esComerciante = usuario?.rol === 'comerciante';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-negro/95 backdrop-blur-md transition-all duration-300">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8 justify-between">
        
        {/* PARTE IZQUIERDA: LOGO + BOTÓN CATEGORÍAS */}
        <div className="flex items-center gap-3">
          {/* Logo oficial SpotMarket */}
          <Link to="/" onClick={() => setMenuCatAbierto(false)} aria-label="SpotMarket - Inicio" className="shrink-0 flex items-center gap-2">
            <img src={LogoNavbar} alt="" className="h-9 w-9 shrink-0 object-contain" />
            <span className="font-marca text-2xl text-blanco tracking-wide">
              Spot<span className="text-amarillo">Market</span>
            </span>
          </Link>

          {/* Botón Categorías */}
          <button
            type="button"
            onClick={() => setMenuCatAbierto((prev) => !prev)}
            aria-expanded={menuCatAbierto}
            className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
              menuCatAbierto ? 'border-amarillo text-amarillo' : 'border-borde text-blanco hover:border-gris-azulado'
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span className="hidden text-xs sm:inline">Categorías</span>
          </button>
        </div>

        {/* Buscador central */}
        <div className="relative w-40 sm:w-60 md:w-80 lg:w-96 shrink-0">
          <form onSubmit={handleBuscar} role="search">
            <div className="relative flex items-center rounded-xl border border-borde bg-gris-oscuro py-1.5 pl-3.5 pr-2 transition-colors hover:border-blanco">
              <input
                ref={inputRef}
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar productos o tiendas..."
                className="min-w-0 flex-1 bg-transparent pr-16 text-xs text-blanco placeholder:text-gris-azulado focus:outline-none"
              />
              <kbd aria-hidden="true" className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 rounded border border-borde bg-negro px-1.5 py-0.5 text-[10px] text-gris-azulado hidden sm:inline">
                Ctrl K
              </kbd>
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-rojo hover:brightness-125 transition"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* Sesión, Modo Oscuro/Claro y Navegación Derecha */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón selector de Modo Oscuro / Claro con icono de Sol/Luna */}
          <button
            type="button"
            onClick={alternarTema}
            aria-label={`Cambiar a tema ${tema === 'oscuro' ? 'claro' : 'oscuro'}`}
            className="shrink-0 cursor-pointer rounded-full p-2 text-gris-azulado transition hover:text-amarillo"
            title={tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {tema === 'oscuro' ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {usuario ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {esComerciante && (
                <Link
                  to="/panel"
                  className="hidden md:inline-flex px-3 py-1.5 rounded-md text-xs font-bold fondo-dorado text-negro shadow hover:brightness-110 transition"
                >
                  Mi Panel
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

      {/* MEGA MENÚ DESPLEGABLE HACIA ABAJO */}
      {menuCatAbierto && (
        <MenuCategorias cerrar={() => setMenuCatAbierto(false)} />
      )}
    </header>
  );
}
