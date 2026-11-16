// Card horizontal de resultado de producto, idéntica a la vista de referencia.
import { Link, useNavigate } from 'react-router-dom';
import { haceCuanto } from '../utils/tiempo.js';
import { datosTienda } from '../data/tiendas.js';
import { aSlug } from '../utils/slug.js';
import { resolverUrlImagen } from '../utils/imageUrl.js';

const formatoPrecio = (n) => `$${Math.round(n).toLocaleString('es-AR')}`;

function Estrellas({ valor = 4.2 }) {
  const v = Number(valor) || 4.2;
  const redondeado = Math.round(v);
  return (
    <span className="flex items-center gap-1 text-xs">
      <span aria-hidden="true" className="tracking-tighter text-amarillo">
        {'★'.repeat(redondeado)}
        <span className="text-borde">{'★'.repeat(5 - redondeado)}</span>
      </span>
      <span className="font-semibold text-blanco">{String(v.toFixed(1)).replace('.', ',')}</span>
    </span>
  );
}

export default function TarjetaResultado({ producto }) {
  const nombreTienda = producto.comercio?.nombre_local || producto.tienda?.nombre || 'Comercio local';
  const tiendaInfo = datosTienda(nombreTienda);
  const tipo = producto.comercio?.tipo_comercio || tiendaInfo.tipo || 'Pyme';
  const rating = tiendaInfo.rating || 4.2;
  const imagen = producto.imagen_url || producto.imagen;
  const distancia = producto.distancia || producto.comercio?.distancia || '1,8 km';

  return (
    <Link to={`/productos/${producto.id}`} className="block rounded-xl group">
      <article className="flex gap-4 rounded-xl border border-borde bg-gris-oscuro p-3.5 transition hover:border-amarillo/50 hover:shadow-lg hover:shadow-black/40">
        {/* Foto del producto */}
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-negro">
          {imagen ? (
            <img
              src={resolverUrlImagen(imagen)}
              alt={producto.nombre}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <span className="text-[11px] text-gris-azulado font-medium">Sin foto</span>
          )}
        </div>

        {/* Datos centrales */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <h3 className="truncate text-sm font-bold text-blanco group-hover:text-amarillo transition-colors">
              {producto.nombre}
            </h3>
            <p className="mt-0.5 text-xs text-gris-azulado">
              <span className="text-azul hover:underline font-medium">
                {nombreTienda}
              </span>{' '}
              · a {distancia}
            </p>
            <div className="mt-1">
              <Estrellas valor={rating} />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
            <span
              className={`rounded px-2 py-0.5 font-bold uppercase tracking-wider ${
                tipo.toLowerCase().includes('cadena') || tipo.toLowerCase().includes('super')
                  ? 'bg-azul/20 text-azul border border-azul/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {tipo}
            </span>
            <span className="text-gris-azulado">
              Actualizado {haceCuanto(producto.updatedAt || producto.createdAt)}
            </span>
            {(producto.en_oferta || producto.precio_oferta) && (
              <span className="rounded bg-rojo px-2 py-0.5 font-black text-blanco uppercase shadow">
                Oferta
              </span>
            )}
            {producto.cuotas && (
              <span className="rounded bg-amarillo/15 px-2 py-0.5 font-semibold text-amarillo border border-amarillo/30">
                {producto.cuotas}
              </span>
            )}
          </div>
        </div>

        {/* Precio en la derecha */}
        <div className="flex shrink-0 flex-col items-end justify-center text-right pl-2">
          <span className="text-base sm:text-lg font-black text-blanco">
            {formatoPrecio(producto.precio_oferta || producto.precio)}
          </span>
          {(producto.en_oferta || producto.precio_oferta) && (
            <span className="text-xs text-rojo line-through font-semibold">
              {formatoPrecio(producto.precio_anterior || producto.precio)}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
