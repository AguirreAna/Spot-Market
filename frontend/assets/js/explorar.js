import {
  api,
  sesion,
  cargarComponentes,
  mostrarAlerta,
  estrellas,
  tarjetaFoto,
  urlFotoComercio,
  escapeHtml,
  etiquetaTipo,
  etiquetaCategoria,
  formatearPrecio,
  TIPOS_PRODUCTOS,
  requerirSesionPara
} from './app.js';

cargarComponentes('explorar');

const parametros = new URLSearchParams(window.location.search);
let vista = parametros.get('vista') === 'productos' ? 'productos' : 'comercios';
let comercioFiltro = parametros.get('comercio') || '';
let nombreComercioFiltro = '';

const area = document.getElementById('area-explorar');
const resumen = document.getElementById('resumen-explorar');
const busqueda = document.getElementById('busqueda');
const filtroCategoria = document.getElementById('filtro-categoria');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroOrden = document.getElementById('filtro-orden');
const precioMin = document.getElementById('filtro-precio-min');
const precioMax = document.getElementById('filtro-precio-max');
const gatePrecio = document.getElementById('gate-precio');

filtroTipo.insertAdjacentHTML(
  'beforeend',
  TIPOS_PRODUCTOS.map((tipo) => `<option value="${tipo}">${escapeHtml(etiquetaTipo(tipo))}</option>`).join('')
);

const configurarGatePrecio = () => {
  if (sesion.activa()) {
    gatePrecio.classList.add('d-none');
    precioMin.disabled = false;
    precioMax.disabled = false;
  } else {
    gatePrecio.classList.remove('d-none');
    precioMin.disabled = true;
    precioMax.disabled = true;
    precioMin.value = '';
    precioMax.value = '';
  }
};

const configurarOrden = () => {
  const opcionesBase = '<option value="">Más recientes</option><option value="calificacion">Mejor calificados</option>';
  const opcionesPrecio = sesion.activa()
    ? '<option value="precio_asc">Menor precio</option><option value="precio_desc">Mayor precio</option>'
    : '';
  filtroOrden.innerHTML = opcionesBase + (vista === 'productos' ? opcionesPrecio : '');
};

const tarjetaComercio = (comercio) => {
  const tipos = (comercio.tipos_productos || [])
    .slice(0, 5)
    .map((tipo) => `<span class="tipo-chip">${escapeHtml(etiquetaTipo(tipo))}</span>`)
    .join('');

  const destinoProductos = `/explorar.html?vista=productos&comercio=${comercio.id}`;
  const accionCalificar = sesion.activa()
    ? '<a class="btn btn-outline-success btn-sm" href="/productores.html">Calificar</a>'
    : `<button class="btn btn-outline-success btn-sm" data-calificar="${comercio.id}">Calificar</button>`;

  return `
    <div class="col-md-6 col-lg-4">
      <div class="card shadow-sm h-100 border-0 card-entidad">
        ${tarjetaFoto(urlFotoComercio(comercio), comercio.nombre_local)}
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
            <h5 class="card-title h6 fw-bold text-verde mb-0">${escapeHtml(comercio.nombre_local)}</h5>
            <span class="etiqueta-categoria">${escapeHtml(etiquetaCategoria(comercio.categoria))}</span>
          </div>
          <div class="small text-body-secondary mb-2">${escapeHtml(comercio.nombre)}</div>
          <div class="mb-2">${estrellas(comercio.calificacion, comercio.calificaciones_total)}</div>
          <div class="small text-body-secondary mb-2"><i class="bi bi-geo-alt"></i> ${escapeHtml(comercio.ubicacion)}</div>
          <div class="mb-3">${tipos}</div>
          <div class="mt-auto d-flex gap-2">
            <a class="btn btn-verde btn-sm flex-fill" href="${destinoProductos}">Ver productos</a>
            ${accionCalificar}
          </div>
        </div>
      </div>
    </div>`;
};

const tarjetaProducto = (producto) => {
  const comercio = producto.productor || {};
  const precio = Number(producto.precio);
  const oferta = producto.precio_oferta ? Number(producto.precio_oferta) : null;
  const accionCalificar = sesion.activa()
    ? '<a class="btn btn-outline-success btn-sm" href="/productos.html">Calificar</a>'
    : `<button class="btn btn-outline-success btn-sm" data-calificar="${producto.id}">Calificar</button>`;

  return `
    <div class="col-md-6 col-lg-4">
      <div class="card shadow-sm h-100 border-0 card-producto">
        ${tarjetaFoto(producto.imagen, producto.nombre)}
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start gap-2 mb-1">
            <h5 class="card-title h6 fw-bold text-verde mb-0">${escapeHtml(producto.nombre)}</h5>
            ${producto.tipo ? `<span class="tipo-chip">${escapeHtml(etiquetaTipo(producto.tipo))}</span>` : ''}
          </div>
          <p class="small text-body-secondary mb-2">${escapeHtml(producto.descripcion)}</p>
          <div class="mb-2">${estrellas(producto.calificacion, producto.calificaciones_total)}</div>
          <div class="d-flex align-items-center gap-2 mb-2">
            ${oferta ? `<span class="precio-badge">${formatearPrecio(oferta)}</span><span class="precio-tachado">${formatearPrecio(precio)}</span>` : `<span class="precio-badge">${formatearPrecio(precio)}</span>`}
          </div>
          <div class="small text-body-secondary mb-3">
            <i class="bi bi-shop"></i> ${escapeHtml(comercio.nombre_local || 'Comercio')}<br />
            <i class="bi bi-box"></i> Stock: ${producto.stock} u
          </div>
          <div class="mt-auto d-flex gap-2">
            <a class="btn btn-outline-success btn-sm flex-fill" href="/explorar.html?vista=productos&comercio=${comercio.id}">Ver comercio</a>
            ${accionCalificar}
          </div>
        </div>
      </div>
    </div>`;
};

const cargar = async () => {
  area.innerHTML = `<div class="loading-overlay"><div class="spinner-border text-success"></div></div>`;

  const query = new URLSearchParams();
  if (busqueda.value.trim()) query.set('q', busqueda.value.trim());
  if (filtroCategoria.value) query.set('categoria', filtroCategoria.value);
  if (filtroTipo.value) query.set('tipo', filtroTipo.value);
  if (filtroOrden.value) query.set('orden', filtroOrden.value);

  if (vista === 'productos') {
    query.set('en_stock', 'true');
    if (comercioFiltro) query.set('productor_id', comercioFiltro);
    if (sesion.activa()) {
      if (precioMin.value) query.set('precio_min', precioMin.value);
      if (precioMax.value) query.set('precio_max', precioMax.value);
    }
  }

  const ruta = vista === 'comercios' ? '/productores' : '/productos';
  const { estado, cuerpo } = await api.get(`${ruta}?${query.toString()}`);
  const datos = estado === 200 ? cuerpo.data : [];

  if (estado !== 200) {
    mostrarAlerta(cuerpo?.message || 'No pudimos cargar el catálogo.');
    area.innerHTML = '';
    return;
  }

  mostrarAlerta([], 'error');

  if (vista === 'productos' && comercioFiltro && datos.length) {
    nombreComercioFiltro = datos[0].productor?.nombre_local || '';
  }

  resumen.textContent =
    vista === 'comercios'
      ? `${datos.length} comercio${datos.length === 1 ? '' : 's'}`
      : `${datos.length} producto${datos.length === 1 ? '' : 's'}${nombreComercioFiltro ? ` de ${nombreComercioFiltro}` : ''}`;

  if (!datos.length) {
    area.innerHTML = `
      <div class="card shadow-sm border-0">
        <div class="card-body text-center py-5 text-body-secondary">
          <i class="bi bi-search" style="font-size: 2rem;"></i>
          <p class="mb-0 mt-2">No encontramos resultados con esos filtros.</p>
        </div>
      </div>`;
    return;
  }

  area.innerHTML = `<div class="row g-4">${datos
    .map((dato) => (vista === 'comercios' ? tarjetaComercio(dato) : tarjetaProducto(dato)))
    .join('')}</div>`;
};

document.querySelectorAll('#tabs-explorar [data-vista]').forEach((boton) => {
  boton.addEventListener('click', () => {
    vista = boton.dataset.vista;
    if (vista === 'comercios') comercioFiltro = '';
    document.querySelectorAll('#tabs-explorar .nav-link').forEach((b) => b.classList.remove('active'));
    boton.classList.add('active');
    configurarOrden();
    cargar();
  });
});

document.getElementById('boton-buscar').addEventListener('click', cargar);
busqueda.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    evento.preventDefault();
    cargar();
  }
});

[filtroCategoria, filtroTipo, filtroOrden].forEach((campo) => campo.addEventListener('change', cargar));
[precioMin, precioMax].forEach((campo) => campo.addEventListener('change', () => {
  if (sesion.activa()) cargar();
}));

document.getElementById('boton-limpiar').addEventListener('click', () => {
  busqueda.value = '';
  filtroCategoria.value = '';
  filtroTipo.value = '';
  filtroOrden.value = '';
  precioMin.value = '';
  precioMax.value = '';
  comercioFiltro = '';
  cargar();
});

document.getElementById('boton-cerca').addEventListener('click', () => {
  if (requerirSesionPara('ver los locales cercanos')) {
    window.location.href = '/cerca.html';
  }
});

area.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-calificar]');
  if (!boton) return;
  if (!requerirSesionPara('calificar un comercio o producto')) return;
  window.location.href = vista === 'comercios' ? '/productores.html' : '/productos.html';
});

const sincronizarTabs = () => {
  document.querySelectorAll('#tabs-explorar .nav-link').forEach((boton) => {
    boton.classList.toggle('active', boton.dataset.vista === vista);
  });
};

configurarGatePrecio();
configurarOrden();
sincronizarTabs();
cargar();
