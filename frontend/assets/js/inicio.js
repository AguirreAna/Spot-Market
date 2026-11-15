import {
  api,
  sesion,
  cargarComponentes,
  protegerPagina,
  mostrarAlerta,
  estrellas,
  escapeHtml,
  etiquetaCategoria,
  formatearPrecio,
  formatearFecha,
  badgeEstado
} from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

cargarComponentes('inicio');

const usuario = sesion.usuario();
const esComercio = sesion.esComercio();

const filtroPropio = esComercio
  ? `productor_id=${usuario.id}`
  : `comprador_id=${usuario.id}`;

const saludo = document.getElementById('saludo');
saludo.textContent = `Hola, ${usuario?.nombre || 'vecino'}`;
document.getElementById('saludo-descripcion').textContent = esComercio
  ? 'Gestioná tu comercio, publicá productos y respondé pedidos.'
  : 'Descubrí ofertas cerca tuyo y negociá con los comercios de tu zona.';

const acciones = esComercio
  ? [
      ['/productos.html', 'Publicar producto', 'bi-plus-circle', 'btn-naranja'],
      ['/transacciones.html', 'Ver pedidos', 'bi-receipt', 'btn-outline-light'],
      ['/chats.html', 'Mis chats', 'bi-chat-dots', 'btn-outline-light']
    ]
  : [
      ['/explorar.html', 'Explorar ofertas', 'bi-compass', 'btn-naranja'],
      ['/cerca.html', 'Cerca de mí', 'bi-geo-alt', 'btn-outline-light'],
      ['/transacciones.html', 'Mis pedidos', 'bi-receipt', 'btn-outline-light']
    ];

document.getElementById('acciones-rapidas').innerHTML = acciones
  .map(
    ([href, texto, icono, clase]) => `
      <a class="btn ${clase} btn-sm" href="${href}">
        <i class="bi ${icono}"></i> ${texto}
      </a>`
  )
  .join('');

const tarjetaEstadistica = (icono, valor, etiqueta, href) => `
  <div class="col-6 col-md-3">
    <a class="text-decoration-none" href="${href}">
      <div class="mini-estadistica text-center h-100 px-2">
        <i class="bi ${icono} text-verde fs-5"></i>
        <div class="fw-bold fs-5">${valor}</div>
        <div class="text-body-secondary small">${etiqueta}</div>
      </div>
    </a>
  </div>`;

const cargar = async () => {
  const solicitudes = [
    api.get('/productos?en_stock=true'),
    api.get('/productores?orden=calificacion'),
    api.get('/compradores'),
    api.get(`/transacciones?${filtroPropio}`),
    api.get(`/chats?${filtroPropio}`)
  ];
  if (esComercio) solicitudes.push(api.get(`/productos?productor_id=${usuario.id}`));
  if (esComercio) solicitudes.push(api.get(`/productores/${usuario.id}`));

  const respuestas = await Promise.all(solicitudes);
  const [resProductos, resComercios, resUsuarios, resPedidos, resChats] = respuestas;

  const productos = resProductos.estado === 200 ? resProductos.cuerpo.data : [];
  const comercios = resComercios.estado === 200 ? resComercios.cuerpo.data : [];
  const usuarios = resUsuarios.estado === 200 ? resUsuarios.cuerpo.data : [];
  const pedidos = resPedidos.estado === 200 ? resPedidos.cuerpo.data : [];
  const chats = resChats.estado === 200 ? resChats.cuerpo.data : [];
  const propios = esComercio && respuestas[5]?.estado === 200 ? respuestas[5].cuerpo.data : [];
  const miPerfil = esComercio && respuestas[6]?.estado === 200 ? respuestas[6].cuerpo.data : null;

  if (resProductos.estado !== 200) {
    mostrarAlerta('No pudimos cargar la información del panel. Recargá la página.');
  }

  const estadisticas = esComercio
    ? [
        ['bi-box-seam', propios.length, 'Mis productos', '/productos.html'],
        ['bi-receipt', pedidos.length, 'Mis pedidos', '/transacciones.html'],
        ['bi-chat-dots', new Set(chats.map((c) => c.comprador_id)).size, 'Conversaciones', '/chats.html'],
        ['bi-star', miPerfil?.calificacion ? Number(miPerfil.calificacion).toFixed(1) : '—', 'Mi calificación', '/productores.html']
      ]
    : [
        ['bi-shop', comercios.length, 'Comercios', '/productores.html'],
        ['bi-box-seam', productos.length, 'Productos', '/explorar.html'],
        ['bi-receipt', pedidos.length, 'Mis pedidos', '/transacciones.html'],
        ['bi-people', usuarios.length, 'Usuarios', '/compradores.html']
      ];

  document.getElementById('area-estadisticas').innerHTML = estadisticas
    .map(([icono, valor, etiqueta, href]) => tarjetaEstadistica(icono, valor, etiqueta, href))
    .join('');

  const productosMostrar = esComercio ? propios.slice(0, 5) : productos.slice(0, 5);
  const areaProductos = document.getElementById('area-productos');

  areaProductos.innerHTML = productosMostrar.length
    ? productosMostrar
        .map(
          (producto) => `
            <div class="d-flex gap-3 py-2 border-bottom align-items-center">
              ${
                producto.imagen
                  ? `<img src="${escapeHtml(producto.imagen)}" class="tarjeta-foto-mini" alt="${escapeHtml(producto.nombre)}" />`
                  : '<div class="tarjeta-foto-mini d-flex align-items-center justify-content-center text-verde"><i class="bi bi-box-seam"></i></div>'
              }
              <div class="flex-grow-1">
                <div class="fw-semibold small">${escapeHtml(producto.nombre)}</div>
                <div class="text-body-secondary small">${escapeHtml(producto.productor?.nombre_local || 'Mi comercio')}</div>
                ${estrellas(producto.calificacion, producto.calificaciones_total)}
              </div>
              <div class="text-end">
                <div class="precio-badge">${formatearPrecio(producto.precio_oferta || producto.precio)}</div>
              </div>
            </div>`
        )
        .join('')
    : '<p class="text-body-secondary small mb-0 py-3">Todavía no hay productos publicados.</p>';

  const areaComercios = document.getElementById('area-comercios');
  areaComercios.innerHTML = comercios.length
    ? comercios
        .slice(0, 5)
        .map(
          (comercio) => `
            <a class="d-flex gap-3 py-2 border-bottom align-items-center text-decoration-none text-body" href="/productos.html?productor=${comercio.id}">
              <span class="avatar-inicial">${escapeHtml((comercio.nombre_local || 'S').charAt(0).toUpperCase())}</span>
              <div class="flex-grow-1">
                <div class="fw-semibold small text-verde">${escapeHtml(comercio.nombre_local)}</div>
                <div class="text-body-secondary small">${escapeHtml(comercio.ubicacion)} · ${escapeHtml(etiquetaCategoria(comercio.categoria))}</div>
                ${estrellas(comercio.calificacion, comercio.calificaciones_total)}
              </div>
              <i class="bi bi-chevron-right text-body-secondary"></i>
            </a>`
        )
        .join('')
    : '<p class="text-body-secondary small mb-0 py-3">Todavía no hay comercios registrados.</p>';

  document.getElementById('area-transacciones').innerHTML = pedidos.length
    ? `<div class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <thead>
            <tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Estado</th><th class="text-end">Fecha</th></tr>
          </thead>
          <tbody>
            ${pedidos
              .slice(0, 5)
              .map(
                (t) => `<tr>
                  <td class="small fw-semibold">${escapeHtml(t.producto?.nombre || 'Producto')}</td>
                  <td class="small">${t.cantidad}</td>
                  <td class="small">${formatearPrecio(t.precio_negociado)}</td>
                  <td>${badgeEstado(t.estado)}</td>
                  <td class="text-end small text-body-secondary">${formatearFecha(t.fecha)}</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>`
    : '<p class="text-body-secondary small mb-0 py-3">Todavía no tenés pedidos. Explorá productos para empezar a comprar.</p>';
};

cargar();
