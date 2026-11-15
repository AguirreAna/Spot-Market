import {
  api,
  sesion,
  cargarComponentes,
  protegerPagina,
  mostrarAlerta,
  mostrarSpinner,
  estrellas,
  tarjetaFoto,
  urlFotoComercio,
  escapeHtml,
  etiquetaTipo,
  etiquetaCategoria,
  formatearFecha,
  TIPOS_PRODUCTOS
} from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

cargarComponentes('comercios');

const usuario = sesion.usuario();
const esComercio = sesion.esComercio();

const area = document.getElementById('area-comercios');
const filtroQ = document.getElementById('filtro-q');
const filtroCategoria = document.getElementById('filtro-categoria');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroOrden = document.getElementById('filtro-orden');

let comercios = [];
let comercioCalificando = null;
let perfilActual = null;

if (esComercio) {
  document.getElementById('boton-mi-perfil').classList.remove('d-none');
}

filtroTipo.insertAdjacentHTML(
  'beforeend',
  TIPOS_PRODUCTOS.map((tipo) => `<option value="${tipo}">${escapeHtml(etiquetaTipo(tipo))}</option>`).join('')
);

const cargar = async () => {
  mostrarSpinner('area-comercios');
  const query = new URLSearchParams();
  if (filtroQ.value.trim()) query.set('q', filtroQ.value.trim());
  if (filtroCategoria.value) query.set('categoria', filtroCategoria.value);
  if (filtroTipo.value) query.set('tipo', filtroTipo.value);
  if (filtroOrden.value) query.set('orden', filtroOrden.value);

  const { estado, cuerpo } = await api.get(`/productores?${query.toString()}`);
  comercios = estado === 200 ? cuerpo.data : [];
  renderizar();
};

const renderizar = () => {
  if (!comercios.length) {
    area.innerHTML = `
      <div class="card shadow-sm border-0">
        <div class="card-body text-center py-5 text-body-secondary">
          <i class="bi bi-shop" style="font-size: 2rem;"></i>
          <p class="mb-0 mt-2">No encontramos comercios con esos filtros.</p>
        </div>
      </div>`;
    return;
  }

  area.innerHTML = `<div class="row g-4">${comercios
    .map((comercio) => {
      const propio = String(comercio.id) === String(usuario?.id) && esComercio;
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
                <h5 class="card-title h6 fw-bold text-verde mb-0">
                  ${escapeHtml(comercio.nombre_local)}
                  ${propio ? '<i class="bi bi-patch-check-fill text-primary" title="Tu comercio"></i>' : ''}
                </h5>
                <span class="etiqueta-categoria">${escapeHtml(etiquetaCategoria(comercio.categoria))}</span>
              </div>
              <div class="small text-body-secondary mb-2">${escapeHtml(comercio.nombre)}</div>
              <div class="mb-2">${estrellas(comercio.calificacion, comercio.calificaciones_total)}</div>
              <div class="small text-body-secondary mb-1"><i class="bi bi-geo-alt"></i> ${escapeHtml(comercio.ubicacion)}</div>
              <div class="small text-body-secondary mb-2"><i class="bi bi-telephone"></i> ${escapeHtml(comercio.telefono)}</div>
              <div class="mb-2">${tipos}</div>
              ${comercio.descripcion ? `<p class="small text-body-secondary mb-2">${escapeHtml(comercio.descripcion)}</p>` : ''}
              <div class="mt-auto d-flex flex-wrap gap-2">
                <a class="btn btn-verde btn-sm flex-fill" href="/productos.html?productor=${comercio.id}">
                  <i class="bi bi-box-seam"></i> Productos
                </a>
                <button class="btn btn-outline-secondary btn-sm" data-resenas="${comercio.id}">
                  <i class="bi bi-chat-left-text"></i> Reseñas
                </button>
                ${propio
                  ? ''
                  : `<button class="btn btn-outline-success btn-sm" data-calificar="${comercio.id}">
                       <i class="bi bi-star"></i> Calificar
                     </button>`}
                ${propio || esComercio
                  ? ''
                  : `<a class="btn btn-outline-secondary btn-sm" href="/chats.html?productor=${comercio.id}">
                       <i class="bi bi-chat-dots"></i>
                     </a>`}
              </div>
            </div>
          </div>
        </div>`;
    })
    .join('')}</div>`;
};

area.addEventListener('click', async (evento) => {
  const calificar = evento.target.closest('[data-calificar]');
  if (calificar) {
    abrirCalificar(calificar.dataset.calificar);
    return;
  }

  const resenas = evento.target.closest('[data-resenas]');
  if (resenas) {
    abrirResenas(resenas.dataset.resenas);
  }
});

const configurarSelectorEstrellas = () => {
  const contenedor = document.getElementById('rating-comercio');
  const pintar = (valor) => {
    contenedor.dataset.valor = valor;
    contenedor.querySelectorAll('[data-estrella]').forEach((estrella) => {
      estrella.classList.toggle('activa', Number(estrella.dataset.estrella) <= valor);
    });
  };

  if (!contenedor.dataset.configurado) {
    contenedor.querySelectorAll('[data-estrella]').forEach((estrella) => {
      estrella.addEventListener('click', () => pintar(Number(estrella.dataset.estrella)));
    });
    contenedor.dataset.configurado = 'true';
  }

  pintar(Number(contenedor.dataset.valor) || 5);
};

configurarSelectorEstrellas();

const abrirCalificar = async (id) => {
  const comercio = comercios.find((c) => String(c.id) === String(id));
  comercioCalificando = id;
  document.getElementById('titulo-calificar').textContent = `Calificar ${comercio?.nombre_local || 'comercio'}`;
  document.getElementById('comentario-comercio').value = '';
  mostrarAlerta([], 'error', 'alerta-calificar');
  document.getElementById('rating-comercio').dataset.valor = '5';
  configurarSelectorEstrellas();
  new bootstrap.Modal(document.getElementById('modal-calificar')).show();
};

document.getElementById('boton-enviar-calificacion-comercio').addEventListener('click', async () => {
  if (!comercioCalificando) return;
  const boton = document.getElementById('boton-enviar-calificacion-comercio');
  const puntaje = Number(document.getElementById('rating-comercio').dataset.valor) || 5;
  const comentario = document.getElementById('comentario-comercio').value.trim();

  boton.disabled = true;
  const { estado, cuerpo } = await api.post(`/productores/${comercioCalificando}/calificaciones`, {
    puntaje,
    comentario
  });
  boton.disabled = false;

  if (estado === 200 || estado === 201) {
    bootstrap.Modal.getInstance(document.getElementById('modal-calificar')).hide();
    mostrarAlerta(cuerpo.message, 'exito');
    cargar();
  } else {
    mostrarAlerta(cuerpo?.message || 'No se pudo enviar la calificación.', 'error', 'alerta-calificar');
  }
});

const abrirResenas = async (id) => {
  const modal = new bootstrap.Modal(document.getElementById('modal-resenas'));
  const cuerpo = document.getElementById('cuerpo-resenas');
  const comercio = comercios.find((c) => String(c.id) === String(id));
  document.getElementById('titulo-resenas').textContent = `Reseñas de ${comercio?.nombre_local || 'comercio'}`;
  cuerpo.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-success"></div></div>`;
  modal.show();

  const { estado, cuerpo: respuesta } = await api.get(`/productores/${id}/calificaciones`);
  const calificaciones = estado === 200 ? respuesta.data : [];
  const resumen = respuesta?.resumen;

  cuerpo.innerHTML = `
    <div class="mb-3">${estrellas(resumen?.promedio, resumen?.total || 0)}</div>
    ${calificaciones.length === 0
      ? '<p class="text-body-secondary small mb-0">Todavía no hay reseñas.</p>'
      : `<ul class="list-group list-group-flush">
          ${calificaciones
            .map(
              (c) => `<li class="list-group-item px-0">
                <div class="d-flex justify-content-between align-items-start gap-2">
                  <div>
                    <div class="fw-semibold small">${escapeHtml(c.usuario?.nombre || 'Usuario')}</div>
                    <div class="text-body-secondary small">${escapeHtml(c.comentario || 'Sin comentario')}</div>
                    <div class="text-body-secondary" style="font-size: 0.72rem;">${formatearFecha(c.fecha)}</div>
                  </div>
                  <div class="estrellas"><span class="estrellas-iconos">${'★'.repeat(c.puntaje)}${'☆'.repeat(5 - c.puntaje)}</span></div>
                </div>
              </li>`
            )
            .join('')}
        </ul>`}`;
};

const renderizarTiposPerfil = (seleccionados = []) => {
  const set = new Set(seleccionados);
  document.getElementById('per-tipos').innerHTML = TIPOS_PRODUCTOS.map(
    (tipo) => `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${tipo}" id="per-tipo-${tipo.replaceAll(' ', '-')}" ${
      set.has(tipo) ? 'checked' : ''
    } />
        <label class="form-check-label" for="per-tipo-${tipo.replaceAll(' ', '-')}">${escapeHtml(etiquetaTipo(tipo))}</label>
      </div>`
  ).join('');
};

const previsualizarFotos = (input, contenedor, existentes = []) => {
  const nuevas = [...input.files].slice(0, 6);
  contenedor.innerHTML =
    existentes
      .map((url) => `<img src="${escapeHtml(url)}" class="foto-previa" alt="Foto del local" />`)
      .join('') +
    nuevas
      .map((archivo) => `<img src="${URL.createObjectURL(archivo)}" class="foto-previa" alt="Nueva foto" />`)
      .join('');
};

const abrirPerfil = async () => {
  mostrarAlerta([], 'error', 'alerta-perfil');
  const { estado, cuerpo } = await api.get(`/productores/${usuario.id}`);
  if (estado !== 200) {
    mostrarAlerta(cuerpo?.message || 'No pudimos cargar tu perfil.', 'error', 'alerta-perfil');
    return;
  }

  perfilActual = cuerpo.data;
  document.getElementById('per-nombre').value = perfilActual.nombre || '';
  document.getElementById('per-nombre-local').value = perfilActual.nombre_local || '';
  document.getElementById('per-telefono').value = perfilActual.telefono || '';
  document.getElementById('per-categoria').value = perfilActual.categoria || 'minorista';
  document.getElementById('per-ubicacion').value = perfilActual.ubicacion || '';
  document.getElementById('per-descripcion').value = perfilActual.descripcion || '';
  document.getElementById('per-latitud').value = perfilActual.latitud || '';
  document.getElementById('per-longitud').value = perfilActual.longitud || '';
  document.getElementById('per-estado-ubicacion').textContent = perfilActual.latitud
    ? `Ubicación registrada (${perfilActual.latitud}, ${perfilActual.longitud}).`
    : 'Podés capturar tu ubicación para aparecer en "Cerca de mí".';
  document.getElementById('per-fotos').value = '';
  document.getElementById('per-fotos-previa').innerHTML = (perfilActual.fotos || [])
    .map((url) => `<img src="${escapeHtml(url)}" class="foto-previa" alt="Foto del local" />`)
    .join('');
  renderizarTiposPerfil(perfilActual.tipos_productos || []);
};

document.getElementById('boton-mi-perfil').addEventListener('click', abrirPerfil);

document.getElementById('per-fotos').addEventListener('change', () => {
  previsualizarFotos(
    document.getElementById('per-fotos'),
    document.getElementById('per-fotos-previa'),
    perfilActual?.fotos || []
  );
});

document.getElementById('per-boton-ubicacion').addEventListener('click', () => {
  const estadoUbicacion = document.getElementById('per-estado-ubicacion');
  if (!navigator.geolocation) {
    estadoUbicacion.textContent = 'Tu navegador no permite geolocalización.';
    return;
  }
  estadoUbicacion.textContent = 'Obteniendo ubicación...';
  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      document.getElementById('per-latitud').value = posicion.coords.latitude.toFixed(6);
      document.getElementById('per-longitud').value = posicion.coords.longitude.toFixed(6);
      estadoUbicacion.textContent = `Ubicación capturada (${document.getElementById('per-latitud').value}, ${document.getElementById('per-longitud').value}).`;
    },
    () => {
      estadoUbicacion.textContent = 'No pudimos obtener tu ubicación. Escribí la dirección manualmente.';
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

document.getElementById('form-perfil').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const tipos = [...document.querySelectorAll('#per-tipos input:checked')].map((input) => input.value);
  const datos = {
    nombre: document.getElementById('per-nombre').value.trim(),
    nombre_local: document.getElementById('per-nombre-local').value.trim(),
    telefono: document.getElementById('per-telefono').value.trim(),
    categoria: document.getElementById('per-categoria').value,
    ubicacion: document.getElementById('per-ubicacion').value.trim(),
    descripcion: document.getElementById('per-descripcion').value.trim(),
    tipos_productos: tipos,
    latitud: document.getElementById('per-latitud').value || null,
    longitud: document.getElementById('per-longitud').value || null
  };

  if (!datos.nombre || !datos.nombre_local || !datos.telefono || !datos.ubicacion) {
    mostrarAlerta('Completá nombre, nombre del local, teléfono y ubicación.', 'error', 'alerta-perfil');
    return;
  }
  if (!tipos.length) {
    mostrarAlerta('Seleccioná al menos un tipo de producto.', 'error', 'alerta-perfil');
    return;
  }

  const boton = document.getElementById('boton-guardar-perfil');
  boton.disabled = true;

  const archivos = [...document.getElementById('per-fotos').files].slice(0, 6);
  let fotos = perfilActual?.fotos || [];

  if (archivos.length) {
    const subida = await api.subirArchivos(archivos);
    if (subida.estado !== 201) {
      mostrarAlerta(subida.cuerpo?.message || 'No se pudieron subir las fotos.', 'error', 'alerta-perfil');
      boton.disabled = false;
      return;
    }
    fotos = [...fotos, ...(subida.cuerpo.data || [])].slice(0, 6);
  }

  const { estado, cuerpo } = await api.patch(`/productores/${usuario.id}`, { ...datos, fotos });
  boton.disabled = false;

  if (estado === 200) {
    sesion.actualizarUsuario(cuerpo.data);
    perfilActual = cuerpo.data;
    bootstrap.Modal.getInstance(document.getElementById('modal-perfil')).hide();
    mostrarAlerta(cuerpo.message, 'exito');
    cargar();
  } else {
    mostrarAlerta(cuerpo?.message || 'No se pudo guardar el perfil.', 'error', 'alerta-perfil');
  }
});

const aplicarFiltros = () => cargar();

document.getElementById('boton-aplicar-filtros').addEventListener('click', aplicarFiltros);
document.getElementById('boton-limpiar-filtros').addEventListener('click', () => {
  filtroQ.value = '';
  filtroCategoria.value = '';
  filtroTipo.value = '';
  filtroOrden.value = '';
  cargar();
});
filtroQ.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    evento.preventDefault();
    aplicarFiltros();
  }
});
[filtroCategoria, filtroTipo, filtroOrden].forEach((campo) => campo.addEventListener('change', aplicarFiltros));

cargar();
