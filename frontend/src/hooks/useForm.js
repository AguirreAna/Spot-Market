// Hook para manejar estado y cambios de formularios de forma simple.
import { useState } from 'react';

export function useForm(valoresIniciales = {}) {
  const [valores, setValores] = useState(valoresIniciales);
  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValores((v) => ({ ...v, [name]: type === 'checkbox' ? checked : value }));
  };
  const setCampo = (name, value) => setValores((v) => ({ ...v, [name]: value }));
  const reset = () => setValores(valoresIniciales);
  return { valores, onChange, setCampo, setValores, reset };
}
