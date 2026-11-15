// Hook simple para cargar datos de la API con estados de carga y error.
import { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';

export function useFetch(path, deps = []) {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (!path) return;
    setCargando(true);
    setError(null);
    try {
      const res = await api(path);
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [path]);

  useEffect(() => { cargar(); }, [cargar, ...deps]);
  return { data, cargando, error, recargar: cargar };
}
