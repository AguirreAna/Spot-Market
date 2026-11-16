// Escribe cuánto pasó desde una fecha: "hace 30 minutos", "hace 3 horas", "hace 2 días".
export function haceCuanto(fecha, ahora = Date.now()) {
  if (!fecha) return 'hace instantes';
  const minutos = Math.max(0, Math.floor((ahora - new Date(fecha)) / 60000));

  if (minutos < 1) return 'hace instantes';
  if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;

  const dias = Math.floor(horas / 24);
  return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
}
