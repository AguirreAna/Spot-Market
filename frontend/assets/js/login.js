import { api, sesion, mostrarAlerta, cargarComponentes } from './app.js';

cargarComponentes('');

const parametros = new URLSearchParams(window.location.search);
const siguiente = parametros.get('next');
const motivo = parametros.get('motivo');

const destinoSeguro = siguiente && siguiente.startsWith('/') ? siguiente : '/inicio.html';

if (sesion.activa()) {
  window.location.href = destinoSeguro;
}

const enlaceRegistro = document.querySelector('a[href="/registro.html"]');
if (enlaceRegistro) {
  const extra = new URLSearchParams();
  if (siguiente) extra.set('next', siguiente);
  if (motivo) extra.set('motivo', motivo);
  enlaceRegistro.href = `/registro.html${extra.toString() ? `?${extra}` : ''}`;
}

if (motivo) {
  mostrarAlerta(`Para usar ${motivo} necesitás ingresar o crear una cuenta gratuita.`, 'error');
}

const form = document.getElementById('form-login');
const boton = document.getElementById('boton-ingresar');

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  const errores = [];
  if (!email) errores.push('El email es obligatorio.');
  if (!password) errores.push('La contraseña es obligatoria.');

  if (errores.length) {
    mostrarAlerta(errores);
    return;
  }

  boton.disabled = true;
  boton.textContent = 'Ingresando...';

  const { estado, cuerpo } = await api.post('/auth/login', { email, password });

  if (estado === 200 && cuerpo.ok) {
    sesion.guardar(cuerpo);
    window.location.href = destinoSeguro;
    return;
  }

  boton.disabled = false;
  boton.textContent = 'Ingresar';
  mostrarAlerta(cuerpo?.message || 'No se pudo iniciar sesión.');
});
