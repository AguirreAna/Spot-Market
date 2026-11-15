export const distanciaKm = (lat1, lng1, lat2, lng2) => {
  const valores = [lat1, lng1, lat2, lng2].map(Number);
  if (valores.some((v) => !Number.isFinite(v))) return null;

  const [a1, o1, a2, o2] = valores;
  const R = 6371;
  const dLat = ((a2 - a1) * Math.PI) / 180;
  const dLng = ((o2 - o1) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a1 * Math.PI) / 180) * Math.cos((a2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
