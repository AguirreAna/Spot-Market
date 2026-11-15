import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
export default function Perfil() {
  const { usuario } = useAuth();
  if (!usuario) return <div className="max-w-6xl mx-auto px-4 py-10"><Link to="/login" className="text-brand-yellow">Iniciá sesión</Link></div>;
  return <div className="max-w-6xl mx-auto px-4 py-10">Perfil de {usuario.nombre} {usuario.rol==='comerciante' && <Link className="ml-4 text-brand-yellow" to="/panel">Ir a mi panel</Link>}</div>;
}
