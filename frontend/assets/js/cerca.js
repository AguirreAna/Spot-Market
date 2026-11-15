import {
  api,
  sesion,
  cargarComponentes,
  protegerPagina,
  mostrarAlerta,
  estrellas,
  tarjetaFoto,
  urlFotoComercio,
  escapeHtml,
  etiquetaTipo,
  etiquetaCategoria,
  formatearDistancia,
  TIPOS_PRODUCTOS
} from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

cargarComponentes('cerca');

const area = document.getElementById('area-cerca');
const estado = document.getElementById('estado-cerca');
const filtroRadio = document.getElementById('filtro-radio');
const filtroCategoria = document.getElementById('filtro-categoria');
const filtroTipo = document.getElementById('filtro-tipo');

filtroTipo.insertAdjacentHTML(
  'beforeend',
  TIPOS_PRODUCTOS.map((tipo) => `<option value="${tipo}">${escapeHtml(etiquetaTipo(tipo))}</option>`).join('')
);

let centro = null;

const mostrarInicial = () => {
  area.innerHTML = `
    <div class="gate-card p-4 text-center">
      <div class="gate-icono mb-2"><i class="bi bi-geo-alt"></i></div>
      <h2 class="h5 fw-bold text-verde">Activá tu ubicación</h2>
      <p class="text-body-secondary mb-0">
        Para mostrarte los comercios cercanos necesitamos tu ubicación. Presioná "Usar mi ubicación".
      </p>
    </div>`;
};

const tarjeta = (comercio) => {
  const tipos = (comercio.tipos_productos || [])
    .slice(0, 6)
    .map((tipo) => `<span class="tipo-chip">${escapeHtml(etiquetaTipo(tipo))}</span>`)
    .join('');

  return `
    <div class="col-md-6 col-lg-4">
      <div class="card shadow-sm h-100 border-0 card-entidad">
        ${tarjetaFoto(urlFotoComercio(comercio), comercio.nombre_local)}
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
            <h5 class="card-title h6 fw-bold text-verde mb-0">${escapeHtml(comercio.nombre_local)}</h5>
            <span class="badge-suave"><i class="bi bi-geo"></i> ${formatearDistancia(comercio.distancia_km)}</span>
          </div>
          <div class="small text-body-secondary mb-2">${escapeHtml(comercio.nombre)}</div>
          <div class="mb-2">${estrellas(comercio.calificacion, comercio.calificaciones_total)}</div>
          <div class="small text-body-secondary mb-2"><i class="bi bi-geo-alt"></i> ${escapeHtml(comercio.ubicacion)}</div>
          <div class="small text-body-secondary mb-2"><i class="bi bi-telephone"></i> ${escapeHtml(comercio.telefono)}</div>
          <div class="mb-3">
            <span class="etiqueta-categoria me-1">${escapeHtml(etiquetaCategoria(comercio.categoria))}</span>
            ${tipos}
          </div>
          <div class="mt-auto d-flex gap-2">
            <a class="btn btn-verde btn-sm flex-fill" href="/productos.html?productor=${comercio.id}">Ver productos</a>
            <a class="btn btn-outline-success btn-sm" href="/productores.html">Calificar</a>
          </div>
        </div>
      </div>
    </div>`;
};

const cargar = async () => {
  if (!centro) {
    mostrarInicial();
    return;
  }

  area.innerHTML = `<div class="loading-overlay"><div class="spinner-border text-success"></div></div>`;
  estado.textContent = 'Buscando comercios cercanos...';

  const query = new URLSearchParams({
    lat: centro.lat,
    lng: centro.lng,
    radio: filtroRadio.value
  });
  if (filtroCategoria.value) query.set('categoria', filtroCategoria.value);
  if (filtroTipo.value) query.set('tipo', filtroTipo.value);

  const { estado: codigo, cuerpo } = await api.get(`/productores/cercanos?${query.toString()}`);
  if (codigo !== 200) {
    mostrarAlerta(cuerpo?.message || 'No pudimos obtener los comercios cercanos.');
    area.innerHTML = '';
    return;
  }

  mostrarAlerta([], 'error');
  const comercios = cuerpo.data || [];
  estado.textContent = `Radio: ${filtroRadio.value} km · ${comercios.length} comercio${comercios.length === 1 ? '' : 's'} encontrado${comercios.length === 1 ? '' : 's'}.`;

  if (!comercios.length) {
    area.innerHTML = `
      <div class="card shadow-sm border-0">
        <div class="card-body text-center py-5 text-body-secondary">
          <i class="bi bi-shop" style="font-size: 2rem;"></i>
          <p class="mb-0 mt-2">No hay comercios en ese radio. Probá ampliar la distancia.</p>
        </div>
      </div>`;
    return;
  }

  area.innerHTML = `<div class="row g-4">${comercios.map(tarjeta).join('')}</div>`;
};

const usarCentro = (lat, lng, mensaje) => {
  centro = { lat, lng };
  mostrarAlerta(mensaje, 'error');
  cargar();
};

const geolocalizar = () => {
  if (!navigator.geolocation) {
    usarCentro(-26.1775, -58.1781, 'Tu navegador no soporta geolocalización. Mostramos comercios de Formosa Capital como referencia.');
    return;
  }

  estado.textContent = 'Obteniendo tu ubicación...';

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      centro = {
        lat: posicion.coords.latitude.toFixed(6),
        lng: posicion.coords.longitude.toFixed(6)
      };
      mostrarAlerta([], 'error');
      cargar();
    },
    () => {
      usarCentro(
        -26.1775,
        -58.1781,
        'No pudimos acceder a tu ubicación. Mostramos comercios de Formosa Capital como referencia.'
      );
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
};

document.getElementById('boton-geolocalizar').addEventListener('click', geolocalizar);
document.getElementById('boton-aplicar').addEventListener('click', () => {
  if (!centro) geolocalizar();
  else cargar();
});
filtroRadio.addEventListener('change', () => centro && cargar());
filtroCategoria.addEventListener('change', () => centro && cargar());
filtroTipo.addEventListener('change', () => centro && cargar());

mostrarInicial();
