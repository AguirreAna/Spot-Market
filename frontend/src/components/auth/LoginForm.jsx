// Formulario de login conectado al endpoint real POST /api/auth/login.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@spotmarket.com"
          required
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB800] transition"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#FFB800] transition"
        />
      </div>
      {error && (
        <div className="bg-red-500/15 border border-red-500/40 text-red-200 text-xs p-3 rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      <button
        type="submit"
        disabled={cargando}
        className="w-full rounded-xl bg-[#FFB800] hover:bg-yellow-400 text-black font-extrabold py-3 text-sm transition shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {cargando ? 'Iniciando sesión…' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
