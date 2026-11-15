import {
  api,
  sesion,
  cargarComponentes,
  protegerPagina,
  mostrarSpinner,
  mostrarAlerta,
  formatearPrecio,
  formatearFecha,
  badgeEstado,
  escapeHtml
} from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

cargarComponentes('pedidos');

const usuario = sesion.usuario();
const esComercio = sesion.esComercio();
const area = document.getElementById('area-transacciones');
const filtroPropio = esComercio ? `productor_id=${usuario.id}` : `comprador_id=${usuario.id}`;

let filtro = '';

const cargar = async () => {
  mostrarSpinner('area-transacciones');
  const query = filtro ? `${filtroPropio}&estado=${filtro}` : filtroPropio;
  const { estado, cuerpo } = await api.get(`/transacciones?${query}`);
  const transacciones = estado === 200 ? cuerpo.data : [];
  renderizar(transacciones);
};

const renderizar = (transacciones) => {
  if (transacciones.length === 0) {
    area.innerHTML = `
      <div class="card shadow-sm border-0">
        <div class="card-body text-center py-5 text-body-secondary">
          <i class="bi bi-receipt" style="font-size: 2rem;"></i>
          <p class="mb-0 mt-2">
            ${filtro ? `No hay pedidos en estado "${filtro}".` : 'Todavía no hay pedidos.'}
          </p>
          ${esComercio ? '' : '<a class="btn btn-verde btn-sm mt-3" href="/explorar.html">Explorar productos</a>'}
        </div>
      </div>`;
    return;
  }

  area.innerHTML = `<div class="card shadow-sm border-0">
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th class="d-none d-md-table-cell">${esComercio ? 'Comprador' : 'Comercio'}</th>
            <th class="text-end">Cant.</th>
            <th class="text-end d-none d-md-table-cell">Precio</th>
            <th>Estado</th>
            <th class="text-end d-none d-lg-table-cell">Fecha</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${transacciones
            .map((t) => {
              const contraparte = esComercio ? t.comprador?.nombre : t.productor?.nombre;
              const puedeConfirmar = esComercio && t.estado === 'pendiente';
              const puedeEntregar = !esComercio && t.estado === 'confirmado';

              return `
              <tr>
                <td class="text-body-secondary">${t.id}</td>
                <td class="fw-semibold small">${escapeHtml(t.producto?.nombre || 'Producto')}</td>
                <td class="d-none d-md-table-cell small">${escapeHtml(contraparte || '—')}</td>
                <td class="text-end">${t.cantidad}</td>
                <td class="text-end d-none d-md-table-cell">${formatearPrecio(t.precio_negociado)}</td>
                <td>${badgeEstado(t.estado)}</td>
                <td class="text-end text-body-secondary small d-none d-lg-table-cell">${formatearFecha(t.fecha)}</td>
                <td class="text-end">
                  ${puedeConfirmar
                    ? `<button class="btn btn-success btn-sm" data-accion="confirmar" data-id="${t.id}" title="Confirmar pedido (requiere oferta en el chat)">
                         Confirmar
                       </button>`
                    : ''}
                  ${puedeEntregar
                    ? `<button class="btn btn-outline-primary btn-sm" data-accion="entregar" data-id="${t.id}" title="Marcar como entregado">
                         Entregar
                       </button>`
                    : ''}
                  ${!puedeConfirmar && !puedeEntregar ? '<span class="text-body-secondary small">—</span>' : ''}
                </td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  </div>`;
};

area.addEventListener('click', async (evento) => {
  const boton = evento.target.closest('[data-accion]');
  if (!boton) return;

  const { accion, id } = boton.dataset;
  boton.disabled = true;

  const nuevoEstado = accion === 'confirmar' ? 'confirmado' : 'entregado';
  const resultado = await api.patch(`/transacciones/${id}/estado`, { estado: nuevoEstado });

  if (resultado.estado === 200) {
    mostrarAlerta(resultado.cuerpo.message, 'exito');
    cargar();
  } else {
    mostrarAlerta(resultado.cuerpo?.message || 'No se pudo actualizar el pedido.');
    boton.disabled = false;
  }
});

document.querySelectorAll('.filtro-estado').forEach((boton) => {
  boton.addEventListener('click', () => {
    document.querySelectorAll('.filtro-estado').forEach((b) => b.classList.remove('activo'));
    boton.classList.add('activo');
    filtro = boton.dataset.estado;
    cargar();
  });
});

cargar();
