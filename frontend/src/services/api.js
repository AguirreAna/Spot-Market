// Cliente HTTP centralizado. Usa `credentials: 'include'` para enviar/recibir
// la cookie httpOnly del JWT en cada petición al backend.
const BASE = '/api';

export async function api(path, opciones = {}) {
  const esFormData = opciones.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: esFormData ? {} : { 'Content-Type': 'application/json', ...(opciones.headers || {}) },
    ...opciones
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.mensaje || 'Error en la petición');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}
