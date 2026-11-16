// Formulario de login conectado a POST /api/auth/login y recuperación de contraseña con código de verificación
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
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
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

  const onEnviarCodigo = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeRecuperar('');
    setCargandoRecuperar(true);

    try {
      const body = { email: emailRecuperar.trim() };
      if (codigoEnviado && nuevaPassword.trim()) {
        body.nuevaPassword = nuevaPassword.trim();
        body.codigo = codigoVerificacion.trim();
      }
      const res = await api('/auth/recuperar-password', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      setMensajeRecuperar(res.mensaje || 'Código de verificación generado y enviado a tu correo.');
      if (!codigoEnviado) {
        setCodigoEnviado(true);
      }
    } catch (err) {
      setError(err.message || 'Error al solicitar el código de verificación.');
    } finally {
      setCargandoRecuperar(false);
    }
  };

  if (modoRecuperar) {
    return (
      <form onSubmit={onEnviarCodigo} className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-blanco mb-1">Recuperar Contraseña</h3>
          <p className="text-xs text-gris-azulado mb-3">
            Ingresá tu correo electrónico para recibir tu código de verificación.
          </p>
        </div>

        {mensajeRecuperar && (
          <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs p-3.5 rounded-xl font-medium">
            {mensajeRecuperar}
          </div>
        )}

        {error && (
          <div className="bg-rojo/15 border border-rojo/40 text-rojo text-xs p-3 rounded-xl">
            {error}
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

        {codigoEnviado && (
          <>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amarillo mb-1.5">
                Código de verificación (6 dígitos)
              </label>
              <input
                type="text"
                value={codigoVerificacion}
                onChange={(e) => setCodigoVerificacion(e.target.value)}
                placeholder="Ingresá el código recibido"
                required
                className="w-full rounded-xl bg-negro/60 border border-borde px-3.5 py-2.5 text-sm text-blanco focus:outline-none focus:border-amarillo transition tracking-widest text-center font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gris-azulado mb-1.5">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className="w-full rounded-xl bg-negro/60 border border-borde px-3.5 py-2.5 text-sm text-blanco focus:outline-none focus:border-amarillo transition"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={cargandoRecuperar}
          className="w-full rounded-xl fondo-dorado text-negro font-extrabold py-3 text-sm transition shadow-lg disabled:opacity-60 hover:brightness-110 cursor-pointer"
        >
          {cargandoRecuperar
            ? 'Procesando...'
            : codigoEnviado
            ? 'Restablecer Contraseña'
            : 'Enviar código de verificación'}
        </button>

        <button
          type="button"
          onClick={() => {
            setModoRecuperar(false);
            setCodigoEnviado(false);
            setError('');
            setMensajeRecuperar('');
          }}
          className="w-full text-center text-xs text-gris-azulado hover:text-blanco transition pt-2 cursor-pointer"
        >
          Volver al inicio de sesión
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
        <label className="block text-xs font-bold uppercase tracking-wider text-gris-azulado mb-1.5">
          Contraseña
        </label>
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
        <div className="bg-rojo/15 border border-rojo/40 text-rojo text-xs p-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={cargando}
        className="w-full rounded-xl fondo-dorado text-negro font-extrabold py-3 text-sm transition shadow-lg disabled:opacity-60 hover:brightness-110 cursor-pointer"
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
          className="text-xs text-gris-azulado hover:text-amarillo transition cursor-pointer"
        >
          ¿Olvidaste tu contraseña? <span className="text-amarillo font-semibold">Recuperar contraseña</span>
        </button>
      </div>
    </form>
  );
}
