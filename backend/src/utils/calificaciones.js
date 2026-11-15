import { fn, col, Op } from 'sequelize';
import { Calificacion } from '../models/Calificacion.js';

const promedios = async (campo, ids) => {
  if (!ids.length) return {};

  const filas = await Calificacion.findAll({
    attributes: [
      campo,
      [fn('AVG', col('puntaje')), 'promedio'],
      [fn('COUNT', col('id')), 'total']
    ],
    where: { [campo]: { [Op.in]: ids } },
    group: [campo],
    raw: true
  });

  return filas.reduce((acc, fila) => {
    acc[fila[campo]] = {
      promedio: Number(Number(fila.promedio).toFixed(1)),
      total: Number(fila.total)
    };
    return acc;
  }, {});
};

export const resumenComercios = (ids) => promedios('productor_id', ids);
export const resumenProductos = (ids) => promedios('producto_id', ids);

export const adjuntarCalificacion = (json, resumen) => {
  const datos = resumen?.[json.id];
  return {
    ...json,
    calificacion: datos?.promedio ?? null,
    calificaciones_total: datos?.total ?? 0
  };
};
