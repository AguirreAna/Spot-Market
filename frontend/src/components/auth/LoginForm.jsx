// Formulario de login conectado al endpoint real POST /api/auth/login.
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function LoginForm() {
  const nav = useNavigate();
  const { setUsuario } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setUsuario(res.usuario);
      nav(res.usuario?.rol === 'comerciante' ? '/panel' : '/');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-300 mb-1">Correo</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={cargando}
        className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2.5 transition disabled:opacity-60">
        {cargando ? 'Ingresando…' : 'Ingresar'}
      </button>
      <Link to="/registro-comercio"
        className="block w-full text-center rounded-lg bg-emerald-500/90 hover:bg-emerald-400 text-black font-semibold py-2.5 transition">
        Registrar mi Comercio
      </Link>
    </form>
  );
}
