// Formulario de login conectado a POST /api/auth/login y recuperación de contraseña POST /api/auth/recuperar-password
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

  // Estado para recuperar contraseña
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensajeRecuperar, setMensajeRecuperar] = useState('');
  const [cargandoRecuperar, setCargandoRecuperar] = useState(false);

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

  const onRecuperarPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeRecuperar('');
    setCargandoRecuperar(true);
    try {
      const body = { email: emailRecuperar.trim() };
      if (nuevaPassword.trim()) {
        body.nuevaPassword = nuevaPassword.trim();
      }
      const res = await api('/auth/recuperar-password', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      setMensajeRecuperar(res.mensaje || 'Instrucciones enviadas con éxito.');
    } catch (err) {
      setError(err.message || 'Error al solicitar recuperación de contraseña.');
    } finally {
      setCargandoRecuperar(false);
    }
  };

  if (modoRecuperar) {
    return (
      <form onSubmit={onRecuperarPassword} className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-blanco mb-1">Recuperar Contraseña</h3>
          <p className="text-xs text-gris-azulado mb-3">
            Ingresá tu correo electrónico para restablecer el acceso a tu cuenta.
          </p>
        </div>

        {mensajeRecuperar && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs p-3.5 rounded-xl">
            ✓ {mensajeRecuperar}
          </div>
        )}

        {error && (
          <div className="bg-rojo/15 border border-rojo/40 text-rojo text-xs p-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gris-azulado mb-1.5">
            Correo electrónico
          </label>
          <input
            type="email"
            value={emailRecuperar}
            onChange={(e) => setEmailRecuperar(e.target.value)}
            placeholder="ejemplo@spotmarket.com"
            required
            className="w-full rounded-xl bg-negro/60 border border-borde px-3.5 py-2.5 text-sm text-blanco focus:outline-none focus:border-amarillo transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gris-azulado mb-1.5">
            Nueva contraseña (opcional)
          </label>
          <input
            type="password"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            placeholder="Dejá en blanco o escribí una nueva (mín. 6 caracteres)"
            className="w-full rounded-xl bg-negro/60 border border-borde px-3.5 py-2.5 text-sm text-blanco focus:outline-none focus:border-amarillo transition"
          />
        </div>

        <button
          type="submit"
          disabled={cargandoRecuperar}
          className="w-full rounded-xl fondo-dorado text-negro font-extrabold py-3 text-sm transition shadow-lg disabled:opacity-60 hover:brightness-110"
        >
          {cargandoRecuperar ? 'Procesando...' : 'Restablecer Contraseña'}
        </button>

        <button
          type="button"
          onClick={() => {
            setModoRecuperar(false);
            setError('');
            setMensajeRecuperar('');
          }}
          className="w-full text-center text-xs text-gris-azulado hover:text-blanco transition pt-2"
        >
          ← Volver al inicio de sesión
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gris-azulado mb-1.5">
          Correo electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@spotmarket.com"
          required
          className="w-full rounded-xl bg-negro/60 border border-borde px-3.5 py-2.5 text-sm text-blanco focus:outline-none focus:border-amarillo transition"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-gris-azulado">
            Contraseña
          </label>
          <button
            type="button"
            onClick={() => {
              setModoRecuperar(true);
              setEmailRecuperar(email);
              setError('');
            }}
            className="text-xs text-amarillo hover:underline font-semibold"
          >
            (Recuperar contraseña)
          </button>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full rounded-xl bg-negro/60 border border-borde px-3.5 py-2.5 text-sm text-blanco focus:outline-none focus:border-amarillo transition"
        />
      </div>

      {error && (
        <div className="bg-rojo/15 border border-rojo/40 text-rojo text-xs p-3 rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={cargando}
        className="w-full rounded-xl fondo-dorado text-negro font-extrabold py-3 text-sm transition shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 hover:brightness-110"
      >
        {cargando ? 'Iniciando sesión…' : 'Iniciar Sesión'}
      </button>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => {
            setModoRecuperar(true);
            setEmailRecuperar(email);
            setError('');
          }}
          className="text-xs text-gris-azulado hover:text-amarillo transition"
        >
          ¿Olvidaste tu contraseña? <span className="text-amarillo font-semibold">(Recuperar contraseña)</span>
        </button>
      </div>
    </form>
  );
}
