import {
  api,
  sesion,
  cargarComponentes,
  protegerPagina,
  mostrarAlerta,
  formatearPrecio,
  formatearFecha,
  escapeHtml
} from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

cargarComponentes('chats');

const usuario = sesion.usuario();
const esComercio = sesion.esComercio();
const filtroPropio = esComercio ? `productor_id=${usuario.id}` : `comprador_id=${usuario.id}`;

document.getElementById('enlace-nuevo').href = esComercio ? '/compradores.html' : '/productores.html';

const areaContactos = document.getElementById('area-contactos');
const areaMensajes = document.getElementById('area-mensajes');

let contactos = [];
let activo = null;

const esMio = (mensaje) =>
  esComercio
    ? String(mensaje.productor_id) === String(usuario.id)
    : String(mensaje.comprador_id) === String(usuario.id);

const rutaConversacion = () =>
  esComercio
    ? `/chats/productor/${usuario.id}/comprador/${activo.id}`
    : `/chats/productor/${activo.id}/comprador/${usuario.id}`;

const cargarContactos = async () => {
  areaContactos.innerHTML = '<div class="p-3 text-body-secondary small">Cargando contactos...</div>';

  const [resChats, resCatalogo] = await Promise.all([
    api.get(`/chats?${filtroPropio}`),
    api.get(esComercio ? '/compradores' : '/productores')
  ]);

  const mensajes = resChats.estado === 200 ? resChats.cuerpo.data : [];
  const catalogo = resCatalogo.estado === 200 ? resCatalogo.cuerpo.data : [];

  const mapa = new Map();
  mensajes.forEach((m) => {
    if (esComercio) {
      const id = String(m.comprador_id);
      if (!mapa.has(id)) {
        mapa.set(id, { id: m.comprador_id, nombre: m.comprador?.nombre || 'Usuario', tipo: 'Usuario' });
      }
    } else {
      const id = String(m.productor_id);
      if (!mapa.has(id)) {
        mapa.set(id, {
          id: m.productor_id,
          nombre: m.productor?.nombre_local || m.productor?.nombre || 'Comercio',
          tipo: 'Comercio'
        });
      }
    }
  });

  catalogo.forEach((item) => {
    const id = String(item.id);
    if (mapa.has(id)) return;
    mapa.set(id, {
      id: item.id,
      nombre: esComercio ? item.nombre : item.nombre_local || item.nombre,
      tipo: esComercio ? 'Usuario' : 'Comercio'
    });
  });

  contactos = [...mapa.values()];
  renderizarContactos();
  autoSeleccionar();
};

const renderizarContactos = () => {
  if (contactos.length === 0) {
    areaContactos.innerHTML =
      '<div class="p-3 text-body-secondary small">Sin contactos. Explorá el catálogo para empezar a negociar.</div>';
    return;
  }

  areaContactos.innerHTML = contactos
    .map(
      (contacto) => `
      <div class="px-3 py-2 contacto border-bottom ${
        activo && String(activo.id) === String(contacto.id) ? 'activo' : ''
      }" data-contacto="${contacto.id}">
        <div class="fw-semibold small">${escapeHtml(contacto.nombre)}</div>
        <div class="text-body-secondary small">${escapeHtml(contacto.tipo)}</div>
      </div>`
    )
    .join('');
};

const autoSeleccionar = () => {
  const params = new URLSearchParams(window.location.search);
  const contactoParam = esComercio ? params.get('comprador') : params.get('productor');

  if (contactoParam) {
    const candidato = contactos.find((c) => String(c.id) === String(contactoParam));
    if (candidato) {
      seleccionar(candidato);
      return;
    }
  }

  if (contactos.length && !activo) seleccionar(contactos[0]);
};

const seleccionar = (contacto) => {
  activo = contacto;
  document.getElementById('chat-titulo').textContent = contacto.nombre;
  document.getElementById('chat-subtitulo').textContent = contacto.tipo;
  renderizarContactos();
  cargarConversacion();
};

const cargarConversacion = async () => {
  if (!activo) return;

  areaMensajes.innerHTML = `<div class="text-center py-5"><div class="spinner-border text-success"></div></div>`;

  const { estado, cuerpo } = await api.get(rutaConversacion());
  const mensajes = estado === 200 ? cuerpo.data : [];

  if (mensajes.length === 0) {
    areaMensajes.innerHTML = `
      <div class="text-center text-body-secondary small py-5">
        Iniciá la negociación. Si acuerdan un precio, cargalo en el campo "Precio oferta" para poder confirmar el pedido.
      </div>`;
    return;
  }

  areaMensajes.innerHTML = mensajes
    .map(
      (mensaje) => `
      <div class="d-flex flex-column gap-1 mb-3">
        <div class="burbuja ${esMio(mensaje) ? 'burbuja-propia' : 'burbuja-ajena'}">
          <div class="small">${escapeHtml(mensaje.mensaje)}</div>
          ${mensaje.precio_oferta ? `<span class="burbuja-oferta">Oferta: ${formatearPrecio(mensaje.precio_oferta)}</span>` : ''}
          <div class="small opacity-75" style="font-size: 0.7rem;">${formatearFecha(mensaje.fecha)}</div>
        </div>
      </div>`
    )
    .join('');

  areaMensajes.scrollTop = areaMensajes.scrollHeight;
};

areaContactos.addEventListener('click', (evento) => {
  const item = evento.target.closest('[data-contacto]');
  if (!item) return;

  const contacto = contactos.find((c) => String(c.id) === String(item.dataset.contacto));
  if (contacto) seleccionar(contacto);
});

document.getElementById('form-mensaje').addEventListener('submit', async (evento) => {
  evento.preventDefault();

  if (!activo) {
    mostrarAlerta('Seleccioná un contacto para negociar.');
    return;
  }

  const texto = document.getElementById('texto-mensaje').value.trim();
  const ofertaCampo = document.getElementById('precio-oferta').value;

  const errores = [];
  if (!texto && !ofertaCampo) errores.push('Escribí un mensaje o cargá una oferta.');
  if (ofertaCampo && !(Number(ofertaCampo) > 0)) errores.push('La oferta debe ser mayor a 0.');

  if (errores.length) {
    mostrarAlerta(errores);
    return;
  }

  const datos = { mensaje: texto || `Oferta de ${formatearPrecio(ofertaCampo)}` };
  if (ofertaCampo) datos.precio_oferta = Number(ofertaCampo);

  const { estado, cuerpo } = await api.post(rutaConversacion(), datos);

  if (estado === 201) {
    document.getElementById('texto-mensaje').value = '';
    document.getElementById('precio-oferta').value = '';
    mostrarAlerta([], 'error');
    cargarConversacion();
  } else {
    mostrarAlerta(cuerpo?.message || 'No se pudo enviar el mensaje.');
  }
});

setInterval(() => {
  if (document.visibilityState === 'visible' && activo) cargarConversacion();
}, 15000);

cargarContactos();
