import {
  api,
  sesion,
  mostrarAlerta,
  cargarComponentes,
  TIPOS_PRODUCTOS,
  etiquetaTipo,
  escapeHtml
} from './app.js';

cargarComponentes('');

const parametros = new URLSearchParams(window.location.search);
const siguiente = parametros.get('next');
const motivo = parametros.get('motivo');
const destinoSeguro = siguiente && siguiente.startsWith('/') ? siguiente : '/inicio.html';

if (sesion.activa()) {
  window.location.href = destinoSeguro;
}

if (motivo) {
  mostrarAlerta(`Para usar ${motivo} necesitás crear tu cuenta. Completá el formulario para continuar.`, 'error');
}

const radios = document.querySelectorAll('input[name="rol"]');
const seccionComprador = document.getElementById('seccion-comprador');
const seccionProductor = document.getElementById('seccion-productor');
const etiquetaNombre = document.getElementById('etiqueta-nombre');
const boton = document.getElementById('boton-registrar');

const camposComprador = [
  document.getElementById('ubicacion'),
  document.getElementById('tipo')
];
const camposProductor = [
  document.getElementById('nombre_local'),
  document.getElementById('ubicacion_local'),
  document.getElementById('categoria'),
  document.getElementById('descripcion')
];

const rolActual = () => document.querySelector('input[name="rol"]:checked').value;

const renderizarTipos = () => {
  const contenedor = document.getElementById('tipos-productos');
  contenedor.innerHTML = TIPOS_PRODUCTOS.map(
    (tipo) => `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${tipo}" id="tipo-${tipo.replaceAll(' ', '-')}" />
        <label class="form-check-label" for="tipo-${tipo.replaceAll(' ', '-')}">${escapeHtml(etiquetaTipo(tipo))}</label>
      </div>`
  ).join('');
};

const actualizarVista = () => {
  const esProductor = rolActual() === 'productor';

  seccionComprador.classList.toggle('d-none', esProductor);
  seccionProductor.classList.toggle('d-none', !esProductor);

  camposComprador.forEach((campo) => {
    if (!campo) return;
    campo.required = !esProductor;
  });
  camposProductor.forEach((campo) => {
    if (!campo) return;
    campo.required = esProductor;
  });

  etiquetaNombre.textContent = esProductor ? 'Nombre del responsable' : 'Nombre y apellido';
  mostrarAlerta([], 'error');
};

radios.forEach((radio) => radio.addEventListener('change', actualizarVista));

renderizarTipos();
actualizarVista();

const previsualizarFotos = (input, contenedor) => {
  const archivos = [...input.files].slice(0, 6);
  contenedor.innerHTML = archivos
    .map((archivo) => `<img src="${URL.createObjectURL(archivo)}" class="foto-previa" alt="Vista previa" />`)
    .join('');
};

const fotos = document.getElementById('fotos');
const fotosPrevia = document.getElementById('fotos-previa');
fotos.addEventListener('change', () => previsualizarFotos(fotos, fotosPrevia));

const botonUbicacion = document.getElementById('boton-ubicacion');
const estadoUbicacion = document.getElementById('estado-ubicacion');
const latitud = document.getElementById('latitud');
const longitud = document.getElementById('longitud');

botonUbicacion.addEventListener('click', () => {
  if (!navigator.geolocation) {
    estadoUbicacion.textContent = 'Tu navegador no permite geolocalización. Podés escribir la dirección manualmente.';
    return;
  }

  estadoUbicacion.textContent = 'Obteniendo ubicación...';

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      latitud.value = posicion.coords.latitude.toFixed(6);
      longitud.value = posicion.coords.longitude.toFixed(6);
      estadoUbicacion.textContent = `Ubicación capturada (${latitud.value}, ${longitud.value}).`;
    },
    () => {
      estadoUbicacion.textContent = 'No pudimos obtener tu ubicación. Escribí la dirección manualmente.';
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

const recoger = () => {
  const rol = rolActual();
  const base = {
    nombre: document.getElementById('nombre').value.trim(),
    email: document.getElementById('email').value.trim(),
    telefono: document.getElementById('telefono').value.trim(),
    password: document.getElementById('password').value.trim()
  };

  if (rol === 'productor') {
    const tipos = [...document.querySelectorAll('#tipos-productos input:checked')].map((input) => input.value);
    return {
      ...base,
      nombre_local: document.getElementById('nombre_local').value.trim(),
      ubicacion: document.getElementById('ubicacion_local').value.trim(),
      categoria: document.getElementById('categoria').value,
      tipos_productos: tipos,
      descripcion: document.getElementById('descripcion').value.trim(),
      latitud: latitud.value || null,
      longitud: longitud.value || null,
      suscripcion: 'estandar'
    };
  }

  return {
    ...base,
    ubicacion: document.getElementById('ubicacion').value.trim(),
    tipo: document.getElementById('tipo').value
  };
};

document.getElementById('form-registro').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const rol = rolActual();
  const datos = recoger();

  const errores = [];
  if (!datos.nombre) errores.push('El nombre es obligatorio.');
  if (!datos.email) errores.push('El email es obligatorio.');
  else if (!/^\S+@\S+\.\S+$/.test(datos.email)) errores.push('El email no es válido.');
  if (!datos.telefono) errores.push('El teléfono es obligatorio.');
  if (!datos.password) errores.push('La contraseña es obligatoria.');
  else if (datos.password.length < 6) errores.push('La contraseña debe tener al menos 6 caracteres.');
  if (!datos.ubicacion) errores.push('La ubicación es obligatoria.');

  if (rol === 'productor') {
    if (!datos.nombre_local) errores.push('El nombre del local es obligatorio.');
    if (!datos.tipos_productos.length) errores.push('Seleccioná al menos un tipo de producto.');
  }

  if (errores.length) {
    mostrarAlerta(errores);
    return;
  }

  boton.disabled = true;
  boton.textContent = 'Creando cuenta...';

  const ruta = rol === 'productor' ? '/auth/productores/registro' : '/compradores/registro';
  const { estado, cuerpo } = await api.post(ruta, datos);

  if (estado === 201 && cuerpo.ok) {
    sesion.guardar(cuerpo, rol);

    const archivos = [...fotos.files].slice(0, 6);
    if (rol === 'productor' && archivos.length) {
      const subida = await api.subirArchivos(archivos);
      if (subida.estado === 201) {
        const fotosSubidas = subida.cuerpo?.data || [];
        const actualizacion = await api.patch(`/productores/${cuerpo.usuario.id}`, { fotos: fotosSubidas });
        if (actualizacion.estado === 200) {
          sesion.actualizarUsuario(actualizacion.cuerpo.data);
        }
      }
    }

    mostrarAlerta('Registro exitoso. Redirigiendo...', 'exito');
    setTimeout(() => {
      window.location.href = destinoSeguro;
    }, 900);
    return;
  }

  boton.disabled = false;
  boton.textContent = 'Crear cuenta';
  mostrarAlerta(cuerpo?.message || 'No se pudo completar el registro.');
});
