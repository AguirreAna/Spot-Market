// Panel lateral de filtros con Tipo de Comercio y Rubro (idéntico a Image 1 e Image 2).
import { useState } from 'react';

const LIMITE_RUBROS = 14;

export default function PanelFiltros({
  tiposOpciones = [],
  tiposSeleccionados = [],
  alCambiarTipo,
  rubrosOpciones = [],
  rubrosSeleccionados = [],
  alCambiarRubro,
  alLimpiarFiltros,
  hayFiltrosActivos = false
}) {
  const [rubrosExpandidos, setRubrosExpandidos] = useState(false);

  const rubrosVisibles = rubrosExpandidos
    ? rubrosOpciones
    : rubrosOpciones.filter((r, i) => i < LIMITE_RUBROS || rubrosSeleccionados.includes(r.nombre));

  return (
    <aside className="w-full md:w-64 shrink-0 space-y-6 text-xs text-blanco">
      {/* Botón limpiar si hay filtros */}
      {hayFiltrosActivos && (
        <div className="flex items-center justify-between pb-2 border-b border-borde">
          <span className="text-[11px] text-gris-azulado">Filtros aplicados</span>
          <button
            type="button"
            onClick={alLimpiarFiltros}
            className="text-xs text-amarillo hover:underline font-bold cursor-pointer"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* ── 1. TIPO DE COMERCIO ── */}
      <div className="border-b border-borde pb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gris-azulado mb-3">
          TIPO DE COMERCIO
        </h3>
        <div className="space-y-1.5">
          {tiposOpciones.map((t) => {
            const marcado = tiposSeleccionados.includes(t.nombre);
            return (
              <label
                key={t.nombre}
                className={`flex cursor-pointer items-center justify-between gap-2 py-1 px-1 rounded hover:bg-white/5 transition ${
                  t.cantidad === 0 && !marcado ? 'opacity-40' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={() => alCambiarTipo(t.nombre)}
                    className="accent-amarillo h-3.5 w-3.5 rounded cursor-pointer"
                  />
                  <span className="truncate text-xs font-medium text-blanco">{t.etiqueta || t.nombre}</span>
                </div>
                <span className="text-xs text-gris-azulado tabular-nums">{t.cantidad}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── 2. RUBRO (Desplegable y con Ver más / Ver menos) ── */}
      <details open className="group border-b border-borde pb-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold uppercase tracking-wider text-gris-azulado mb-3">
          <span>RUBRO</span>
          <span className="text-gris-azulado transition-transform group-open:rotate-90">›</span>
        </summary>

        <div className="space-y-1.5 mt-2">
          {rubrosVisibles.map((r) => {
            const marcado = rubrosSeleccionados.includes(r.nombre);
            return (
              <label
                key={r.nombre}
                className={`flex cursor-pointer items-center justify-between gap-2 py-1 px-1 rounded hover:bg-white/5 transition ${
                  r.cantidad === 0 && !marcado ? 'opacity-40' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={marcado}
                    onChange={() => alCambiarRubro(r.nombre)}
                    className="accent-amarillo h-3.5 w-3.5 rounded cursor-pointer"
                  />
                  <span className="truncate text-xs font-medium text-blanco">{r.nombre}</span>
                </div>
                <span className="text-xs text-gris-azulado tabular-nums">{r.cantidad}</span>
              </label>
            );
          })}

          {rubrosOpciones.length > LIMITE_RUBROS && (
            <button
              type="button"
              onClick={() => setRubrosExpandidos((prev) => !prev)}
              className="mt-2 text-xs text-azul hover:underline font-semibold block cursor-pointer"
            >
              {rubrosExpandidos ? 'Ver menos' : `Ver más (${rubrosOpciones.length - LIMITE_RUBROS})`}
            </button>
          )}
        </div>
      </details>
    </aside>
  );
}
