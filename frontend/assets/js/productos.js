import {
  api,
  sesion,
  cargarComponentes,
  protegerPagina,
  mostrarAlerta,
  mostrarSpinner,
  estrellas,
  tarjetaFoto,
  escapeHtml,
  etiquetaTipo,
  formatearPrecio,
  TIPOS_PRODUCTOS
} from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

cargarComponentes('productos');

const usuario = sesion.usuario();
const esComercio = sesion.esComercio();

const parametros = new URLSearchParams(window.location.search);
let productorFiltro = parametros.get('productor') || '';
let productos = [];
let productoEditando = null;
let productoPedido = null;
let productoCalificando = null;
let productoEliminar = null;

const area = document.getElementById('area-productos');
const chipComercio = document.getElementById('chip-comercio');
const filtroQ = document.getElementById('filtro-q');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroOrden = document.getElementById('filtro-orden');
const precioMin = document.getElementById('filtro-precio-min');
const precioMax = document.getElementById('filtro-precio-max');

if (esComercio) {
  document.getElementById('boton-nuevo-producto').classList.remove('d-none');
  document.getElementById('boton-mi-perfil').classList.remove('d-none');
}

filtroTipo.insertAdjacentHTML(
  'beforeend',
  TIPOS_PRODUCTOS.map((tipo) => `<option value="${tipo}">${escapeHtml(etiquetaTipo(tipo))}</option>`).join('')
);
document
  .getElementById('p-tipo')
  .insertAdjacentHTML(
    'beforeend',
    TIPOS_PRODUCTOS.map((tipo) => `<option value="${tipo}">${escapeHtml(etiquetaTipo(tipo))}</option>`).join('')
  );

const cargar = async () => {
  mostrarSpinner('area-productos');
  const query = new URLSearchParams();
  if (filtroQ.value.trim()) query.set('q', filtroQ.value.trim());
  if (filtroTipo.value) query.set('tipo', filtroTipo.value);
  if (filtroOrden.value) query.set('orden', filtroOrden.value);
  if (precioMin.value) query.set('precio_min', precioMin.value);
  if (precioMax.value) query.set('precio_max', precioMax.value);
  if (productorFiltro) query.set('productor_id', productorFiltro);

  const { estado, cuerpo } = await api.get(`/productos?${query.toString()}`);
  if (estado !== 200) {
    mostrarAlerta(cuerpo?.message || 'No pudimos cargar los productos.');
    area.innerHTML = '';
    return;
  }

  mostrarAlerta([], 'error');
  productos = cuerpo.data || [];
  renderizarChip();
  renderizar();
};

const renderizarChip = () => {
  if (!productorFiltro || !productos.length) {
    chipComercio.innerHTML = '';
    return;
  }
  const local = productos[0].productor?.nombre_local || 'comercio';
  chipComercio.innerHTML = `
    <div class="d-flex flex-wrap align-items-center gap-2">
      <span class="badge-suave"><i class="bi bi-shop"></i> ${escapeHtml(local)}</span>
      <button class="btn btn-outline-secondary btn-sm" id="boton-quitar-comercio">Ver todos los productos</button>
    </div>`;
  document.getElementById('boton-quitar-comercio').addEventListener('click', () => {
    productorFiltro = '';
    cargar();
  });
};

const renderizar = () => {
  if (!productos.length) {
    area.innerHTML = `
      <div class="card shadow-sm border-0">
        <div class="card-body text-center py-5 text-body-secondary">
          <i class="bi bi-box-seam" style="font-size: 2rem;"></i>
          <p class="mb-0 mt-2">No encontramos productos con esos filtros.</p>
        </div>
      </div>`;
    return;
  }

  area.innerHTML = `<div class="row g-4">${productos
    .map((producto) => {
      const propio = String(producto.productor_id) === String(usuario?.id) && esComercio;
      const precio = Number(producto.precio);
      const oferta = producto.precio_oferta ? Number(producto.precio_oferta) : null;
      const comercio = producto.productor || {};

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
              ${producto.especificacion ? `<p class="small text-body-secondary mb-2 fst-italic">${escapeHtml(producto.especificacion)}</p>` : ''}
              <div class="mb-2">${estrellas(producto.calificacion, producto.calificaciones_total)}</div>
              <div class="d-flex align-items-center gap-2 mb-2">
                ${oferta
                  ? `<span class="precio-badge">${formatearPrecio(oferta)}</span><span class="precio-tachado">${formatearPrecio(precio)}</span>`
                  : `<span class="precio-badge">${formatearPrecio(precio)}</span>`}
              </div>
              <div class="small text-body-secondary mb-1">
                <i class="bi bi-shop"></i> ${escapeHtml(comercio.nombre_local || 'Comercio')}
              </div>
              <div class="small text-body-secondary mb-3">
                <i class="bi bi-box"></i> Stock: ${producto.stock} u
              </div>
              <div class="mt-auto d-flex flex-wrap gap-2">
                ${propio
                  ? `<button class="btn btn-outline-secondary btn-sm" data-editar="${producto.id}"><i class="bi bi-pencil"></i> Editar</button>
                     <button class="btn btn-outline-danger btn-sm" data-eliminar="${producto.id}"><i class="bi bi-trash"></i></button>`
                  : esComercio
                    ? `<a class="btn btn-outline-secondary btn-sm flex-fill" href="/chats.html?productor=${producto.productor_id}"><i class="bi bi-chat-dots"></i> Negociar</a>
                       <button class="btn btn-outline-success btn-sm" data-calificar="${producto.id}"><i class="bi bi-star"></i> Calificar</button>`
                    : `<button class="btn btn-naranja btn-sm flex-fill" data-pedido="${producto.id}"><i class="bi bi-cart-plus"></i> Pedir</button>
                       <button class="btn btn-outline-success btn-sm" data-calificar="${producto.id}"><i class="bi bi-star"></i> Calificar</button>`}
              </div>
            </div>
          </div>
        </div>`;
    })
    .join('')}</div>`;
};

const abrirFormulario = (producto = null) => {
  productoEditando = producto ? producto.id : null;
  document.getElementById('titulo-producto').textContent = producto ? 'Editar producto' : 'Publicar producto';
  document.getElementById('boton-guardar-producto').textContent = producto ? 'Guardar cambios' : 'Publicar';
  document.getElementById('p-nombre').value = producto?.nombre || '';
  document.getElementById('p-tipo').value = producto?.tipo || '';
  document.getElementById('p-descripcion').value = producto?.descripcion || '';
  document.getElementById('p-especificacion').value = producto?.especificacion || '';
  document.getElementById('p-precio').value = producto?.precio ?? '';
  document.getElementById('p-precio-oferta').value = producto?.precio_oferta ?? '';
  document.getElementById('p-stock').value = producto?.stock ?? '';
  document.getElementById('p-imagen').value = '';
  document.getElementById('p-imagen-previa').innerHTML = producto?.imagen
    ? `<img src="${escapeHtml(producto.imagen)}" class="foto-previa" alt="Imagen actual" />`
    : '';
  mostrarAlerta([], 'error', 'alerta-producto');
};

document.getElementById('boton-nuevo-producto').addEventListener('click', () => abrirFormulario());

document.getElementById('p-imagen').addEventListener('change', () => {
  const archivo = document.getElementById('p-imagen').files[0];
  const contenedor = document.getElementById('p-imagen-previa');
  if (!archivo) {
    contenedor.innerHTML = '';
    return;
  }
  contenedor.innerHTML = `<img src="${URL.createObjectURL(archivo)}" class="foto-previa" alt="Vista previa" />`;
});

document.getElementById('form-producto').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const datos = {
    nombre: document.getElementById('p-nombre').value.trim(),
    tipo: document.getElementById('p-tipo').value || null,
    descripcion: document.getElementById('p-descripcion').value.trim(),
    especificacion: document.getElementById('p-especificacion').value.trim() || null,
    precio: Number(document.getElementById('p-precio').value),
    precio_oferta: document.getElementById('p-precio-oferta').value
      ? Number(document.getElementById('p-precio-oferta').value)
      : null,
    stock: Number(document.getElementById('p-stock').value)
  };

  const errores = [];
  if (!datos.nombre) errores.push('El nombre es obligatorio.');
  if (!datos.descripcion) errores.push('La descripción es obligatoria.');
  if (!(datos.precio > 0)) errores.push('El precio debe ser mayor a 0.');
  if (datos.precio_oferta !== null && datos.precio_oferta >= datos.precio) {
    errores.push('El precio de oferta debe ser menor al precio normal.');
  }
  if (!(datos.stock >= 0) || !Number.isInteger(datos.stock)) errores.push('El stock debe ser un entero mayor o igual a 0.');

  if (errores.length) {
    mostrarAlerta(errores, 'error', 'alerta-producto');
    return;
  }

  const boton = document.getElementById('boton-guardar-producto');
  boton.disabled = true;

  const archivo = document.getElementById('p-imagen').files[0];
  if (archivo) {
    const subida = await api.subirArchivos([archivo]);
    if (subida.estado !== 201) {
      mostrarAlerta(subida.cuerpo?.message || 'No se pudo subir la imagen.', 'error', 'alerta-producto');
      boton.disabled = false;
      return;
    }
    datos.imagen = subida.cuerpo.data[0];
  }

  const resultado = productoEditando
    ? await api.patch(`/productos/${productoEditando}`, datos)
    : await api.post('/productos', datos);

  boton.disabled = false;

  if (resultado.estado === 200 || resultado.estado === 201) {
    bootstrap.Modal.getInstance(document.getElementById('modal-producto')).hide();
    mostrarAlerta(resultado.cuerpo.message, 'exito');
    cargar();
  } else {
    mostrarAlerta(resultado.cuerpo?.message || 'No se pudo guardar el producto.', 'error', 'alerta-producto');
  }
});

const configurarSelectorEstrellas = () => {
  const contenedor = document.getElementById('rating-producto');
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

const abrirCalificar = (id) => {
  const producto = productos.find((p) => String(p.id) === String(id));
  productoCalificando = id;
  document.getElementById('titulo-calificar').textContent = `Calificar ${producto?.nombre || 'producto'}`;
  document.getElementById('comentario-producto').value = '';
  mostrarAlerta([], 'error', 'alerta-calificar');
  document.getElementById('rating-producto').dataset.valor = '5';
  configurarSelectorEstrellas();
  new bootstrap.Modal(document.getElementById('modal-calificar')).show();
};

document.getElementById('boton-enviar-calificacion-producto').addEventListener('click', async () => {
  if (!productoCalificando) return;
  const boton = document.getElementById('boton-enviar-calificacion-producto');
  const puntaje = Number(document.getElementById('rating-producto').dataset.valor) || 5;
  const comentario = document.getElementById('comentario-producto').value.trim();

  boton.disabled = true;
  const { estado, cuerpo } = await api.post(`/productos/${productoCalificando}/calificaciones`, {
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

const abrirPedido = (id) => {
  const producto = productos.find((p) => String(p.id) === String(id));
  if (!producto) return;

  productoPedido = id;
  const precio = producto.precio_oferta ? Number(producto.precio_oferta) : Number(producto.precio);
  document.getElementById('titulo-pedido').textContent = `Pedir ${producto.nombre}`;
  document.getElementById('info-pedido').textContent = `${producto.productor?.nombre_local || 'Comercio'} · Stock disponible: ${producto.stock} u. Precio sugerido: ${formatearPrecio(precio)}.`;
  document.getElementById('ped-cantidad').value = 1;
  document.getElementById('ped-cantidad').max = producto.stock;
  document.getElementById('ped-precio').value = precio.toFixed(2);
  mostrarAlerta([], 'error', 'alerta-pedido');
  new bootstrap.Modal(document.getElementById('modal-pedido')).show();
};

document.getElementById('form-pedido').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const boton = evento.submitter;
  const cantidad = Number(document.getElementById('ped-cantidad').value);
  const precio = Number(document.getElementById('ped-precio').value);
  const producto = productos.find((p) => String(p.id) === String(productoPedido));

  const errores = [];
  if (!(cantidad > 0) || !Number.isInteger(cantidad)) errores.push('La cantidad debe ser un entero mayor a 0.');
  if (producto && cantidad > producto.stock) errores.push(`Solo hay ${producto.stock} unidades disponibles.`);
  if (!(precio > 0)) errores.push('El precio debe ser mayor a 0.');

  if (errores.length) {
    mostrarAlerta(errores, 'error', 'alerta-pedido');
    return;
  }

  if (boton) boton.disabled = true;
  const { estado, cuerpo } = await api.post('/transacciones', {
    producto_id: Number(productoPedido),
    cantidad,
    precio_negociado: precio
  });
  if (boton) boton.disabled = false;

  if (estado === 201) {
    bootstrap.Modal.getInstance(document.getElementById('modal-pedido')).hide();
    mostrarAlerta(cuerpo.message, 'exito');
  } else {
    mostrarAlerta(cuerpo?.message || 'No se pudo crear el pedido.', 'error', 'alerta-pedido');
  }
});

const abrirEliminar = (id) => {
  const producto = productos.find((p) => String(p.id) === String(id));
  productoEliminar = id;
  document.getElementById('texto-confirmar').textContent = `¿Eliminar "${producto?.nombre || 'producto'}"? Esta acción no se puede deshacer.`;
  new bootstrap.Modal(document.getElementById('modal-confirmar')).show();
};

document.getElementById('boton-eliminar-confirmado').addEventListener('click', async () => {
  if (!productoEliminar) return;
  const boton = document.getElementById('boton-eliminar-confirmado');
  boton.disabled = true;
  const { estado, cuerpo } = await api.delete(`/productos/${productoEliminar}`);
  boton.disabled = false;

  if (estado === 200) {
    bootstrap.Modal.getInstance(document.getElementById('modal-confirmar')).hide();
    mostrarAlerta(cuerpo.message, 'exito');
    cargar();
  } else {
    mostrarAlerta(cuerpo?.message || 'No se pudo eliminar el producto.');
  }
});

area.addEventListener('click', (evento) => {
  const editar = evento.target.closest('[data-editar]');
  if (editar) {
    const producto = productos.find((p) => String(p.id) === String(editar.dataset.editar));
    abrirFormulario(producto);
    new bootstrap.Modal(document.getElementById('modal-producto')).show();
    return;
  }

  const eliminar = evento.target.closest('[data-eliminar]');
  if (eliminar) {
    abrirEliminar(eliminar.dataset.eliminar);
    return;
  }

  const calificar = evento.target.closest('[data-calificar]');
  if (calificar) {
    abrirCalificar(calificar.dataset.calificar);
    return;
  }

  const pedido = evento.target.closest('[data-pedido]');
  if (pedido && !esComercio) abrirPedido(pedido.dataset.pedido);
});

const aplicarFiltros = () => cargar();

document.getElementById('boton-aplicar-filtros').addEventListener('click', aplicarFiltros);
document.getElementById('boton-limpiar-filtros').addEventListener('click', () => {
  filtroQ.value = '';
  filtroTipo.value = '';
  filtroOrden.value = '';
  precioMin.value = '';
  precioMax.value = '';
  productorFiltro = '';
  cargar();
});
filtroQ.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') {
    evento.preventDefault();
    aplicarFiltros();
  }
});
[filtroTipo, filtroOrden, precioMin, precioMax].forEach((campo) => campo.addEventListener('change', aplicarFiltros));

cargar();
