// Barra superior para pantallas de autenticación con identidad oficial SpotMarket
import { Link } from 'react-router-dom';
import LogoNavbar from '../../assets/LogoNavbar.svg';

export default function NavbarAuth() {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
      <Link to="/" className="flex items-center gap-2">
        <img src={LogoNavbar} alt="SpotMarket" className="h-8 w-8 object-contain" />
        <span className="font-marca text-2xl text-blanco">
          Spot<span className="text-amarillo">Market</span>
        </span>
      </Link>
      <Link to="/" className="text-xs font-semibold text-gris-azulado hover:text-blanco transition">
        ← Volver al inicio
      </Link>
    </div>
  );
}
