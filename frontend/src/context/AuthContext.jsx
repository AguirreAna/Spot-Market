// Contexto de autenticación: guarda el usuario actual (cargado desde /auth/me)
// y expone helpers de login/logout para toda la app.
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const refrescar = async () => {
    try {
      const res = await api('/auth/me');
      setUsuario(res.usuario);
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { refrescar(); }, []);

  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, cargando, logout, refrescar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
