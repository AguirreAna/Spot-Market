import {
  api,
  sesion,
  cargarComponentes,
  protegerPagina,
  mostrarSpinner,
  mostrarAlerta,
  escapeHtml,
  etiquetaCategoria
} from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

cargarComponentes('usuarios');

const usuario = sesion.usuario();
const esComercio = sesion.esComercio();
const area = document.getElementById('area-compradores');

if (!esComercio) {
  document.getElementById('boton-mi-perfil').classList.remove('d-none');
}

let compradores = [];

const cargar = async () => {
  mostrarSpinner('area-compradores');
  const { estado, cuerpo } = await api.get('/compradores');
  compradores = estado === 200 ? cuerpo.data : [];
  renderizar();
};

const renderizar = () => {
  if (compradores.length === 0) {
    area.innerHTML = `
      <div class="card shadow-sm border-0">
        <div class="card-body text-center py-5 text-body-secondary">
          <i class="bi bi-people" style="font-size: 2rem;"></i>
          <p class="mb-0 mt-2">Aún no hay usuarios registrados.</p>
        </div>
      </div>`;
    return;
  }

  area.innerHTML = `<div class="row g-4">
    ${compradores
      .map((comprador) => {
        const esPropio = !esComercio && String(comprador.id) === String(usuario?.id);
        return `
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm h-100 border-0 card-entidad">
            <div class="card-body">
              <div class="d-flex align-items-center gap-3 mb-2">
                <span class="avatar-inicial">${escapeHtml((comprador.nombre || 'U').charAt(0).toUpperCase())}</span>
                <div>
                  <h5 class="card-title h6 fw-bold text-verde mb-0">
                    ${escapeHtml(comprador.nombre)}
                    ${esPropio ? '<i class="bi bi-patch-check-fill text-primary" title="Tu perfil"></i>' : ''}
                  </h5>
                  <span class="etiqueta-estado etiqueta-estandar text-capitalize">${escapeHtml(comprador.tipo || 'vecino')}</span>
                </div>
              </div>
              <p class="card-text small text-body-secondary mb-2">
                <i class="bi bi-geo-alt"></i> ${escapeHtml(comprador.ubicacion || 'Sin ubicación')}
              </p>
              ${comprador.telefono ? `<p class="card-text small text-body-secondary mb-2"><i class="bi bi-telephone"></i> ${escapeHtml(comprador.telefono)}</p>` : ''}
              ${esPropio
                ? `<button class="btn btn-outline-secondary btn-sm" data-accion="vinculados">
                     <i class="bi bi-link-45deg"></i> Comercios con los que opero
                   </button>`
                : ''}
            </div>
          </div>
        </div>`;
      })
      .join('')}
  </div>`;
};

area.addEventListener('click', async (evento) => {
  const boton = evento.target.closest('[data-accion="vinculados"]');
  if (!boton) return;

  const modal = new bootstrap.Modal(document.getElementById('modal-vinculados'));
  const cuerpo = document.getElementById('cuerpo-vinculados');
  cuerpo.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-success"></div></div>`;
  modal.show();

  const { estado, cuerpo: respuesta } = await api.get(`/compradores/${usuario.id}/productores`);
  const vinculados = estado === 200 ? respuesta.data : [];

  cuerpo.innerHTML =
    vinculados.length === 0
      ? '<p class="text-body-secondary small mb-0">Todavía no operaste con ningún comercio. Hacé un pedido para empezar.</p>'
      : `<ul class="list-group list-group-flush">
          ${vinculados
            .map(
              (comercio) => `<li class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                  <div class="fw-semibold small text-verde">${escapeHtml(comercio.nombre_local)}</div>
                  <div class="small text-body-secondary">${escapeHtml(comercio.ubicacion || '')} · ${escapeHtml(etiquetaCategoria(comercio.categoria))}</div>
                </div>
                <a class="btn btn-outline-secondary btn-sm" href="/chats.html?productor=${comercio.id}">
                  <i class="bi bi-chat-dots"></i>
                </a>
              </li>`
            )
            .join('')}
        </ul>`;
});

document.getElementById('boton-mi-perfil').addEventListener('click', () => {
  document.getElementById('per-nombre').value = usuario.nombre || '';
  document.getElementById('per-telefono').value = usuario.telefono || '';
  document.getElementById('per-ubicacion').value = usuario.ubicacion || '';
  document.getElementById('per-tipo').value = usuario.tipo || 'vecino';
  mostrarAlerta([], 'error', 'alerta-perfil');
});

document.getElementById('form-perfil').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const datos = {
    nombre: document.getElementById('per-nombre').value.trim(),
    telefono: document.getElementById('per-telefono').value.trim(),
    ubicacion: document.getElementById('per-ubicacion').value.trim(),
    tipo: document.getElementById('per-tipo').value
  };

  const errores = [];
  if (!datos.nombre) errores.push('El nombre es obligatorio.');
  if (!datos.ubicacion) errores.push('La ubicación es obligatoria.');

  if (errores.length) {
    mostrarAlerta(errores, 'error', 'alerta-perfil');
    return;
  }

  const { estado, cuerpo } = await api.patch(`/compradores/${usuario.id}`, datos);

  if (estado === 200) {
    sesion.actualizarUsuario(cuerpo.data);
    cargarComponentes('usuarios');
    bootstrap.Modal.getInstance(document.getElementById('modal-perfil')).hide();
    mostrarAlerta(cuerpo.message, 'exito');
    cargar();
  } else {
    mostrarAlerta(cuerpo?.message || 'No se pudo actualizar el perfil.', 'error', 'alerta-perfil');
  }
});

cargar();
