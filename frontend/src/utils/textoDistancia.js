export function aKm(texto) {
  if (!texto) return 0;
  const str = String(texto);
  const numero = parseFloat(str.replace(',', '.'));
  return str.includes('km') ? numero : numero / 1000;
}
