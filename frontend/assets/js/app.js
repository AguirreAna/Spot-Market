const TOKEN_KEY = 'token_plataforma';
const USUARIO_KEY = 'usuario_plataforma';
const ROL_KEY = 'rol_plataforma';

export const CATEGORIAS = [
  { valor: 'minorista', etiqueta: 'Minorista' },
  { valor: 'mayorista', etiqueta: 'Mayorista' },
  { valor: 'ambos', etiqueta: 'Mayorista y minorista' }
];

export const TIPOS_PRODUCTOS = [
  'libreria',
  'almacen',
  'supermercado',
  'polirrubro',
  'kiosco',
  'maxikiosco',
  'pescaderia',
  'carniceria',
  'carniceria y pescaderia',
  'casa de artesanias',
  'dulceria',
  'perfumeria',
  'bazar',
  'bebidas',
  'lacteos',
  'panaderia',
  'verduleria',
  'fruteria',
  'limpieza',
  'mascotas',
  'fiambreria'
];

export const ETIQUETAS_TIPO = {
  libreria: 'Librería',
  almacen: 'Almacén',
  supermercado: 'Supermercado',
  polirrubro: 'Polirrubro',
  kiosco: 'Kiosco',
  maxikiosco: 'Maxikiosco',
  pescaderia: 'Pescadería',
  carniceria: 'Carnicería',
  'carniceria y pescaderia': 'Carnicería y pescadería',
  'casa de artesanias': 'Casa de artesanías',
  dulceria: 'Dulcería',
  perfumeria: 'Perfumería',
  bazar: 'Bazar',
  bebidas: 'Bebidas',
  lacteos: 'Lácteos',
  panaderia: 'Panadería',
  verduleria: 'Verdulería',
  fruteria: 'Fruteria',
  limpieza: 'Limpieza',
  mascotas: 'Mascotas',
  fiambreria: 'Fiambrería'
};

export const etiquetaTipo = (tipo) => ETIQUETAS_TIPO[tipo] || tipo || '';
export const etiquetaCategoria = (categoria) =>
  CATEGORIAS.find((c) => c.valor === categoria)?.etiqueta || categoria || '';

export const escapeHtml = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (caracter) => {
    const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return mapa[caracter];
  });

const guardarSesion = (respuesta, rolExplicito = null) => {
  if (respuesta.token) localStorage.setItem(TOKEN_KEY, respuesta.token);
  if (respuesta.usuario) localStorage.setItem(USUARIO_KEY, JSON.stringify(respuesta.usuario));
  if (respuesta.rol) localStorage.setItem(ROL_KEY, respuesta.rol);
  else if (rolExplicito) localStorage.setItem(ROL_KEY, rolExplicito);
};

const manejarSesionExpirada = (ruta) => {
  if (!ruta.includes('/auth/login')) {
    cerrarSesion(true);
  }
};

export const api = {
  async peticion(ruta, metodo = 'GET', datos = null) {
    const opciones = {
      method: metodo,
      headers: { 'Content-Type': 'application/json' }
    };

    const token = localStorage.getItem(TOKEN_KEY);
    if (token) opciones.headers.Authorization = `Bearer ${token}`;
    if (datos !== null && datos !== undefined) opciones.body = JSON.stringify(datos);

    const respuesta = await fetch(`/api/v1${ruta}`, opciones);

    let cuerpo = null;
    try {
      cuerpo = await respuesta.json();
    } catch {
      cuerpo = null;
    }

    if (respuesta.status === 401) manejarSesionExpirada(ruta);

    return { estado: respuesta.status, cuerpo };
  },

  async subirArchivos(archivos) {
    const lista = Array.isArray(archivos) ? archivos : [archivos];
    if (lista.length === 0) return { estado: 400, cuerpo: null };

    const formData = new FormData();
    lista.forEach((archivo) => formData.append('archivos', archivo));

    const headers = {};
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;

    const respuesta = await fetch('/api/v1/uploads', { method: 'POST', headers, body: formData });

    let cuerpo = null;
    try {
      cuerpo = await respuesta.json();
    } catch {
      cuerpo = null;
    }

    if (respuesta.status === 401) manejarSesionExpirada('/uploads');
    return { estado: respuesta.status, cuerpo };
  },

  get: (ruta) => api.peticion(ruta, 'GET'),
  post: (ruta, datos) => api.peticion(ruta, 'POST', datos),
  patch: (ruta, datos) => api.peticion(ruta, 'PATCH', datos),
  delete: (ruta) => api.peticion(ruta, 'DELETE')
};

export const sesion = {
  guardar: guardarSesion,
  actualizarUsuario(usuario) {
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
  },
  usuario() {
    try {
      return JSON.parse(localStorage.getItem(USUARIO_KEY)) || null;
    } catch {
      return null;
    }
  },
  rol() {
    return localStorage.getItem(ROL_KEY);
  },
  token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  activa() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },
  esComercio() {
    return localStorage.getItem(ROL_KEY) === 'productor';
  }
};

export function cerrarSesion(redirigir = false) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
  localStorage.removeItem(ROL_KEY);
  if (redirigir) window.location.href = '/index.html';
}

export function formatearPrecio(valor) {
  return `$${Number(valor || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatearFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatearDistancia(km) {
  if (km === null || km === undefined) return '';
  const numero = Number(km);
  if (numero < 1) return `${Math.round(numero * 1000)} m`;
  return `${numero.toFixed(1)} km`;
}

export function badgeEstado(estado) {
  const clases = {
    pendiente: 'etiqueta-pendiente',
    confirmado: 'etiqueta-confirmado',
    entregado: 'etiqueta-entregado'
  };
  return `<span class="etiqueta-estado ${clases[estado] || ''}">${escapeHtml(estado)}</span>`;
}

export function badgeSuscripcion(suscripcion) {
  return `<span class="etiqueta-estado ${
    suscripcion === 'premium' ? 'etiqueta-premium' : 'etiqueta-estandar'
  }">${escapeHtml(suscripcion)}</span>`;
}

export function estrellas(promedio, total = 0) {
  const valor = Number(promedio) || 0;
  const llenas = Math.round(valor);
  const texto = valor > 0 ? valor.toFixed(1) : 'Sin calificar';
  return `<span class="estrellas" title="${escapeHtml(texto)}${total ? ` · ${total} calificaciones` : ''}">
    <span class="estrellas-iconos">${'★'.repeat(llenas)}${'☆'.repeat(5 - llenas)}</span>
    <span class="estrellas-texto">${escapeHtml(texto)}${total ? ` (${total})` : ''}</span>
  </span>`;
}

export function mostrarAlerta(mensajes, tipo = 'error', contenedorId = 'area-alerta') {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const lista = Array.isArray(mensajes) ? mensajes : [mensajes];
  const visibles = lista.filter((m) => m);
  if (visibles.length === 0) {
    contenedor.innerHTML = '';
    return;
  }

  contenedor.innerHTML = `
    <div class="alert alert-${tipo === 'error' ? 'danger' : 'success'} py-2 small">
      ${visibles.map((m) => `<div>${escapeHtml(m)}</div>`).join('')}
    </div>`;
}

const enlaceNav = (href, texto, activo, icono) => `
  <li class="nav-item">
    <a class="link-nav ${activo ? 'activo' : ''}" href="${href}">
      <i class="bi ${icono}"></i> ${texto}
    </a>
  </li>`;

export function renderizarNav(activo = '') {
  const contenedor = document.getElementById('barra-navegacion');
  if (!contenedor) return;

  const activa = sesion.activa();
  const usuario = sesion.usuario();
  const esComercio = sesion.esComercio();

  const enlaces = activa
    ? [
        ['/inicio.html', 'Inicio', 'inicio', 'bi-house'],
        ['/explorar.html', 'Explorar', 'explorar', 'bi-compass'],
        ['/productos.html', 'Productos', 'productos', 'bi-box-seam'],
        ['/productores.html', 'Comercios', 'comercios', 'bi-shop'],
        ['/cerca.html', 'Cerca de mí', 'cerca', 'bi-geo-alt'],
        ['/compradores.html', 'Usuarios', 'usuarios', 'bi-people'],
        ['/transacciones.html', 'Pedidos', 'pedidos', 'bi-receipt'],
        ['/chats.html', 'Chats', 'chats', 'bi-chat-dots']
      ]
    : [
        ['/explorar.html', 'Explorar', 'explorar', 'bi-compass'],
        ['/registro.html?motivo=ver%20los%20locales%20cercanos', 'Cerca de mí', 'cerca', 'bi-geo-alt']
      ];

  const links = enlaces
    .map(([href, texto, clave, icono]) => enlaceNav(href, texto, activo === clave, icono))
    .join('');

  const zonaUsuario = activa
    ? `<div class="text-end me-2 d-none d-md-block">
         <div class="fw-semibold text-white" style="font-size: 0.9rem;">${escapeHtml(usuario?.nombre || '')}</div>
         <div class="text-white-50 text-capitalize" style="font-size: 0.75rem;">${esComercio ? 'Comerciante' : 'Usuario'}</div>
       </div>
       <button class="btn btn-naranja btn-sm" id="boton-cerrar-sesion">Salir</button>`
    : `<a class="btn btn-outline-light btn-sm" href="/index.html">Ingresar</a>
       <a class="btn btn-naranja btn-sm" href="/registro.html">Registrarse</a>`;

  contenedor.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-verde shadow-sm">
      <div class="container">
        <a class="navbar-brand" href="${activa ? '/inicio.html' : '/explorar.html'}">
          <i class="bi bi-shop-window text-naranja"></i> Spot Market
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu-principal">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="menu-principal">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">${links}</ul>
          <div class="d-flex align-items-center gap-2">${zonaUsuario}</div>
        </div>
      </div>
    </nav>`;

  const cerrar = document.getElementById('boton-cerrar-sesion');
  if (cerrar) cerrar.addEventListener('click', () => cerrarSesion(true));
}

export function cargarComponentes(activo = '') {
  renderizarNav(activo);
}

export function protegerPagina(activo = '') {
  if (!sesion.activa()) {
    const destino = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/index.html?next=${encodeURIComponent(destino)}`;
    return false;
  }
  return true;
}

export function solicitarRegistro(motivo, destino = null) {
  const siguiente = destino || `${window.location.pathname}${window.location.search}`;
  const razon = motivo ? `&motivo=${encodeURIComponent(motivo)}` : '';
  window.location.href = `/registro.html?next=${encodeURIComponent(siguiente)}${razon}`;
}

export function requerirSesionPara(motivo) {
  if (sesion.activa()) return true;
  solicitarRegistro(motivo);
  return false;
}

export function mostrarSpinner(contenedorId = 'area-contenido') {
  const contenedor = document.getElementById(contenedorId);
  if (contenedor) {
    contenedor.innerHTML = `
      <div class="loading-overlay">
        <div class="spinner-border text-success" role="status"></div>
      </div>`;
  }
}

export function urlFotoComercio(comercio) {
  return comercio?.fotos?.[0] || '';
}

export function tarjetaFoto(url, texto = 'Spot Market') {
  if (url) {
    return `<div class="tarjeta-foto"><img src="${escapeHtml(url)}" alt="${escapeHtml(texto)}" loading="lazy" onerror="this.parentElement.classList.add('sin-foto'); this.remove();" /></div>`;
  }
  return `<div class="tarjeta-foto sin-foto"><i class="bi bi-shop"></i></div>`;
}

export function opcionesTipos(seleccionados = []) {
  const set = new Set(seleccionados);
  return TIPOS_PRODUCTOS.map(
    (tipo) =>
      `<option value="${tipo}" ${set.has(tipo) ? 'selected' : ''}>${escapeHtml(etiquetaTipo(tipo))}</option>`
  ).join('');
}

export function opcionesCategorias(seleccionada = 'minorista') {
  return CATEGORIAS.map(
    (c) => `<option value="${c.valor}" ${c.valor === seleccionada ? 'selected' : ''}>${escapeHtml(c.etiqueta)}</option>`
  ).join('');
}
