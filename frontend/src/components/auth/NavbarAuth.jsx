// Barra mínima para pantallas de autenticación, coherente con la identidad oscura.
import { Link } from 'react-router-dom';

export default function NavbarAuth() {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
      <Link to="/" className="font-bold text-lg"><span className="text-white">Spot</span><span className="text-amber-400">Market</span></Link>
      <Link to="/" className="text-sm text-gray-300 hover:text-white">Volver al inicio</Link>
    </div>
  );
}
