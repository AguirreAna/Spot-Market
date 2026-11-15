import fs from 'node:fs';

process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = './data/test-spotmarket.sqlite';
process.env.UPLOAD_DIR = './uploads/test';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'secreto_test';

const DB_FILE = './data/test-spotmarket.sqlite';
const UPLOAD_DIR = './uploads/test';
fs.rmSync(DB_FILE, { force: true });
fs.rmSync(UPLOAD_DIR, { recursive: true, force: true });

const { app } = await import('../app.js');
const { sequelize } = await import('../src/config/db.js');
await import('../src/models/index.js');

const PUERTO = 4100;
const base = `http://127.0.0.1:${PUERTO}/api/v1`;

let fallos = 0;
let servidor = null;

const ok = (nombre, condicion, detalle = '') => {
  if (condicion) {
    console.log(`  PASS - ${nombre}`);
  } else {
    console.log(`  FAIL - ${nombre} ${detalle}`);
    fallos++;
  }
};

const api = async (ruta, opciones = {}) => {
  const res = await fetch(`${base}${ruta}`, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) }
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, json };
};

const conToken = (token) => ({ Authorization: `Bearer ${token}` });

const iniciar = async () => {
  await sequelize.sync({ force: true });
  servidor = await new Promise((resolve) => {
    const s = app.listen(PUERTO, () => resolve(s));
  });
  console.log('Servidor de prueba iniciado en', base);
};

const ejecutar = async () => {
  await iniciar();
  let r;

  console.log('\n1) Salud y registro de cuentas');
  r = await api('/salud');
  ok('GET /salud -> 200', r.status === 200 && r.json.ok === true, `status=${r.status}`);

  r = await api('/auth/productores/registro', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Juan Pérez',
      nombre_local: 'Almacén Don Juan',
      email: 'juan@test.com',
      telefono: '+54 370 400-0001',
      password: '123456',
      ubicacion: 'Formosa Capital',
      latitud: -26.1775,
      longitud: -58.1781,
      categoria: 'minorista',
      tipos_productos: ['almacen', 'bebidas'],
      descripcion: 'Almacén de barrio',
      fotos: []
    })
  });
  ok('Registro de comercio -> 201', r.status === 201 && r.json.rol === 'productor', `status=${r.status}`);
  const comercio = r.json?.usuario;
  const tokenComercio = r.json?.token;

  r = await api('/auth/productores/registro', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'María Gómez',
      nombre_local: 'Carnicería La Estrella',
      email: 'maria@test.com',
      telefono: '+54 370 400-0002',
      password: '123456',
      ubicacion: 'Formosa Capital',
      categoria: 'ambos',
      tipos_productos: ['carniceria'],
      fotos: []
    })
  });
  ok('Registro de segundo comercio -> 201', r.status === 201, `status=${r.status}`);
  const comercio2 = r.json?.usuario;
  const tokenComercio2 = r.json?.token;

  r = await api('/compradores/registro', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Vecino Test',
      email: 'vecino@test.com',
      telefono: '+54 370 400-0003',
      password: '123456',
      tipo: 'vecino',
      ubicacion: 'Barrio San Martín'
    })
  });
  ok('Registro de usuario -> 201', r.status === 201 && r.json.rol === 'comprador', `status=${r.status}`);
  const comprador = r.json?.usuario;
  const tokenComprador = r.json?.token;

  r = await api('/compradores/registro', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Resto Test',
      email: 'resto@test.com',
      password: '123456',
      tipo: 'restaurante',
      ubicacion: 'Centro'
    })
  });
  ok('Registro de segundo usuario -> 201', r.status === 201, `status=${r.status}`);
  const comprador2 = r.json?.usuario;
  const tokenComprador2 = r.json?.token;

  r = await api('/auth/productores/registro', {
    method: 'POST',
    body: JSON.stringify({
      nombre: 'Duplicado',
      nombre_local: 'Duplicado',
      email: 'vecino@test.com',
      telefono: '123',
      password: '123456',
      ubicacion: 'X',
      categoria: 'minorista',
      tipos_productos: ['kiosco']
    })
  });
  ok('Email repetido entre roles -> 409', r.status === 409, `status=${r.status}`);

  r = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'juan@test.com', password: 'incorrecta' })
  });
  ok('Login con contraseña incorrecta -> 401', r.status === 401, `status=${r.status}`);

  console.log('\n2) Catálogo público y gating de precio');
  r = await api('/productos');
  ok('Listado público de productos -> 200', r.status === 200 && Array.isArray(r.json.data), `status=${r.status}`);

  r = await api('/productores');
  ok('Listado público de comercios -> 200', r.status === 200 && r.json.data.length >= 2, `status=${r.status}`);

  r = await api('/productos?precio_min=10&precio_max=500');
  ok(
    'Filtro de precio sin sesión -> 401 REGISTRO_REQUERIDO',
    r.status === 401 && r.json.codigo === 'REGISTRO_REQUERIDO',
    `status=${r.status}`
  );

  r = await api('/productos?orden=precio_asc');
  ok('Orden por precio sin sesión -> 401', r.status === 401, `status=${r.status}`);

  r = await api('/productos?precio_min=10&precio_max=500', { headers: conToken(tokenComprador) });
  ok('Filtro de precio con sesión -> 200', r.status === 200, `status=${r.status}`);

  r = await api('/productores/cercanos?lat=-26.1775&lng=-58.1781&radio=5');
  ok('Locales cercanos sin sesión -> 401', r.status === 401, `status=${r.status}`);

  console.log('\n3) Publicación de productos y permisos');
  r = await api('/productos', {
    method: 'POST',
    headers: conToken(tokenComprador),
    body: JSON.stringify({ nombre: 'Yerba', descripcion: 'Paquete 1kg', precio: 100, stock: 10 })
  });
  ok('Usuario no puede publicar productos -> 403', r.status === 403, `status=${r.status}`);

  r = await api('/productos', {
    method: 'POST',
    headers: conToken(tokenComercio),
    body: JSON.stringify({ nombre: 'Yerba', descripcion: '', precio: -5, stock: -1 })
  });
  ok('Publicación inválida -> 400', r.status === 400 && Array.isArray(r.json.errors), `status=${r.status}`);

  r = await api('/productos', {
    method: 'POST',
    headers: conToken(tokenComercio),
    body: JSON.stringify({
      nombre: 'Yerba mate 1kg',
      descripcion: 'Paquete de yerba tradicional',
      especificacion: 'Origen Misiones, vencimiento 12 meses',
      tipo: 'almacen',
      precio: 100,
      precio_oferta: 80,
      stock: 10
    })
  });
  ok('Comercio publica producto -> 201', r.status === 201, `status=${r.status} msg=${r.json?.message}`);
  const producto = r.json?.data;

  r = await api('/productos', {
    method: 'POST',
    headers: conToken(tokenComercio2),
    body: JSON.stringify({
      nombre: 'Asado',
      descripcion: 'Corte de carne',
      tipo: 'carniceria',
      precio: 900,
      stock: 5
    })
  });
  const producto2 = r.json?.data;
  ok('Segundo comercio publica producto -> 201', r.status === 201, `status=${r.status}`);

  r = await api(`/productos/${producto.id}`, {
    method: 'PATCH',
    headers: conToken(tokenComercio),
    body: JSON.stringify({ especificacion: 'Actualizada' })
  });
  ok('Comercio edita su producto -> 200', r.status === 200, `status=${r.status}`);

  r = await api(`/productos/${producto.id}`, {
    method: 'PATCH',
    headers: conToken(tokenComercio2),
    body: JSON.stringify({ precio: 1 })
  });
  ok('Comercio no edita producto ajeno -> 403', r.status === 403, `status=${r.status}`);

  console.log('\n4) Locales cercanos y filtros');
  r = await api('/productores/cercanos?lat=-26.1775&lng=-58.1781&radio=5', {
    headers: conToken(tokenComprador)
  });
  const cercano = r.json?.data?.find((p) => p.id === comercio.id);
  ok(
    'Locales cercanos con sesión -> 200 e incluye comercio',
    r.status === 200 && Boolean(cercano) && typeof cercano.distancia_km === 'number',
    `status=${r.status}`
  );

  r = await api('/productores/cercanos?lat=-26.1775&lng=-58.1781&radio=5&tipo=bebidas', {
    headers: conToken(tokenComprador)
  });
  ok('Filtro por tipo en cercanos -> 200', r.status === 200 && r.json.data.every((p) => p.tipos_productos.includes('bebidas')), `status=${r.status}`);

  r = await api('/productores/cercanos?lat=-26.1775&lng=-58.1781&radio=5&categoria=mayorista', {
    headers: conToken(tokenComprador)
  });
  ok('Filtro por categoría en cercanos -> 200', r.status === 200, `status=${r.status}`);

  console.log('\n5) Calificaciones de comercios y productos');
  r = await api(`/productores/${comercio.id}/calificaciones`, {
    method: 'POST',
    body: JSON.stringify({ puntaje: 5 })
  });
  ok('Calificar sin sesión -> 401', r.status === 401, `status=${r.status}`);

  r = await api(`/productores/${comercio.id}/calificaciones`, {
    method: 'POST',
    headers: conToken(tokenComprador),
    body: JSON.stringify({ puntaje: 5, comentario: 'Excelente atención' })
  });
  ok(
    'Usuario califica comercio -> 201',
    r.status === 201 && r.json.resumen.total === 1,
    `status=${r.status}`
  );

  r = await api(`/productores/${comercio.id}/calificaciones`, {
    method: 'POST',
    headers: conToken(tokenComprador),
    body: JSON.stringify({ puntaje: 4, comentario: 'Muy bueno' })
  });
  ok(
    'Segunda calificación actualiza (no duplica) -> 200',
    r.status === 200 && r.json.resumen.total === 1,
    `status=${r.status}`
  );

  r = await api(`/productores/${comercio.id}/calificaciones`, {
    method: 'POST',
    headers: conToken(tokenComercio),
    body: JSON.stringify({ puntaje: 5 })
  });
  ok('Comercio no puede autocalificarse -> 403', r.status === 403, `status=${r.status}`);

  r = await api(`/productores/${comercio.id}/calificaciones`);
  ok('Calificaciones públicas del comercio -> 200', r.status === 200 && r.json.data.length === 1, `status=${r.status}`);

  r = await api(`/productos/${producto.id}/calificaciones`, {
    method: 'POST',
    headers: conToken(tokenComprador),
    body: JSON.stringify({ puntaje: 5, comentario: 'Rinde bien' })
  });
  ok('Usuario califica producto -> 201', r.status === 201 && r.json.resumen.total === 1, `status=${r.status}`);

  r = await api(`/productos/${producto.id}/calificaciones`, {
    method: 'POST',
    headers: conToken(tokenComercio),
    body: JSON.stringify({ puntaje: 5 })
  });
  ok('Comercio no puede autocalificar su producto -> 403', r.status === 403, `status=${r.status}`);

  console.log('\n6) Perfil de comercio');
  r = await api(`/productores/${comercio.id}`, {
    method: 'PATCH',
    headers: conToken(tokenComercio),
    body: JSON.stringify({
      nombre_local: 'Almacén Don Juan',
      telefono: '+54 370 400-9999',
      categoria: 'ambos',
      tipos_productos: ['almacen', 'bebidas', 'limpieza'],
      descripcion: 'Atendemos de 8 a 20 hs',
      latitud: -26.18,
      longitud: -58.18,
      fotos: ['/uploads/foto-demo.jpg']
    })
  });
  ok('Comercio actualiza su perfil -> 200', r.status === 200 && r.json.data.telefono === '+54 370 400-9999', `status=${r.status}`);

  r = await api(`/productores/${comercio.id}`);
  ok(
    'Perfil actualizado se refleja en el detalle',
    r.status === 200 && r.json.data.categoria === 'ambos' && r.json.data.tipos_productos.length === 3,
    `status=${r.status}`
  );

  r = await api(`/productores/${comercio2.id}`, {
    method: 'PATCH',
    headers: conToken(tokenComercio),
    body: JSON.stringify({ telefono: '000' })
  });
  ok('Comercio no actualiza perfil ajeno -> 403', r.status === 403, `status=${r.status}`);

  console.log('\n7) Pedidos y validación de oferta en chat');
  r = await api('/transacciones', {
    method: 'POST',
    headers: conToken(tokenComercio),
    body: JSON.stringify({ producto_id: producto.id, cantidad: 1, precio_negociado: 90 })
  });
  ok('Comercio no puede crear pedidos -> 403', r.status === 403, `status=${r.status}`);

  r = await api('/transacciones', {
    method: 'POST',
    headers: conToken(tokenComprador),
    body: JSON.stringify({ producto_id: producto.id, cantidad: 5, precio_negociado: 90 })
  });
  ok('Usuario crea pedido -> 201', r.status === 201 && r.json.data.estado === 'pendiente', `status=${r.status}`);
  const transaccion = r.json?.data;

  r = await api(`/transacciones/${transaccion.id}/estado`, {
    method: 'PATCH',
    headers: conToken(tokenComprador),
    body: JSON.stringify({ estado: 'confirmado' })
  });
  ok('Usuario no puede confirmar pedido -> 403', r.status === 403, `status=${r.status}`);

  r = await api(`/transacciones/${transaccion.id}/estado`, {
    method: 'PATCH',
    headers: conToken(tokenComercio),
    body: JSON.stringify({ estado: 'confirmado' })
  });
  ok('Confirmar sin oferta en chat -> 400', r.status === 400, `status=${r.status}`);

  r = await api(`/chats/productor/${comercio.id}/comprador/${comprador.id}`, {
    method: 'POST',
    headers: conToken(tokenComprador),
    body: JSON.stringify({ mensaje: 'Te ofrezco $90', precio_oferta: 90 })
  });
  ok('Usuario envía oferta por chat -> 201', r.status === 201, `status=${r.status}`);

  r = await api(`/transacciones/${transaccion.id}/estado`, {
    method: 'PATCH',
    headers: conToken(tokenComercio),
    body: JSON.stringify({ estado: 'confirmado' })
  });
  ok('Comercio confirma pedido con oferta válida -> 200', r.status === 200 && r.json.data.estado === 'confirmado', `status=${r.status}`);

  r = await api(`/productos/${producto.id}`);
  ok('Stock decrementado (10 -> 5)', Number(r.json.data.stock) === 5, `stock=${r.json?.data?.stock}`);

  r = await api(`/transacciones/${transaccion.id}/estado`, {
    method: 'PATCH',
    headers: conToken(tokenComprador),
    body: JSON.stringify({ estado: 'entregado' })
  });
  ok('Usuario marca pedido entregado -> 200', r.status === 200 && r.json.data.estado === 'entregado', `status=${r.status}`);

  r = await api('/transacciones', {
    method: 'POST',
    headers: conToken(tokenComprador),
    body: JSON.stringify({ producto_id: producto.id, cantidad: 999, precio_negociado: 90 })
  });
  ok('Pedido con stock insuficiente -> 400', r.status === 400, `status=${r.status}`);

  console.log('\n8) Privacidad de pedidos y chats');
  r = await api('/transacciones');
  ok('Listar pedidos sin sesión -> 401', r.status === 401, `status=${r.status}`);

  r = await api('/transacciones', { headers: conToken(tokenComercio) });
  ok(
    'Comercio solo ve sus pedidos',
    r.status === 200 && r.json.data.length === 1 && r.json.data.every((t) => t.productor_id === comercio.id),
    `status=${r.status}`
  );

  r = await api('/transacciones', { headers: conToken(tokenComprador2) });
  ok('Otro usuario no ve pedidos ajenos', r.status === 200 && r.json.data.length === 0, `status=${r.status}`);

  r = await api(`/transacciones/${transaccion.id}`, { headers: conToken(tokenComprador2) });
  ok('Usuario ajeno consulta pedido puntual -> 403', r.status === 403, `status=${r.status}`);

  r = await api('/chats');
  ok('Listar chats sin sesión -> 401', r.status === 401, `status=${r.status}`);

  r = await api('/chats', { headers: conToken(tokenComprador2) });
  ok('Otro usuario no ve conversaciones ajenas', r.status === 200 && r.json.data.length === 0, `status=${r.status}`);

  r = await api(`/chats/productor/${comercio.id}/comprador/${comprador.id}`, {
    headers: conToken(tokenComprador2)
  });
  ok('Usuario ajeno lee conversación -> 403', r.status === 403, `status=${r.status}`);

  r = await api(`/chats/productor/${comercio.id}/comprador/${comprador.id}`, {
    method: 'POST',
    headers: conToken(tokenComprador2),
    body: JSON.stringify({ mensaje: 'Intruso' })
  });
  ok('Usuario ajeno envía mensaje -> 403', r.status === 403, `status=${r.status}`);

  r = await api('/chats', { headers: conToken(tokenComercio) });
  ok('Comercio ve sus conversaciones', r.status === 200 && r.json.data.length >= 1, `status=${r.status}`);

  r = await api('/chats', { headers: conToken(tokenComprador) });
  ok('Usuario ve sus conversaciones', r.status === 200 && r.json.data.length >= 1, `status=${r.status}`);

  console.log('\n9) Usuarios y estadísticas');
  r = await api('/compradores');
  ok('Listar usuarios sin sesión -> 401', r.status === 401, `status=${r.status}`);

  r = await api('/compradores', { headers: conToken(tokenComprador) });
  ok(
    'Listar usuarios con sesión -> 200 sin passwords',
    r.status === 200 && r.json.data.every((c) => c.password === undefined),
    `status=${r.status}`
  );

  r = await api(`/compradores/${comprador.id}/productores`, { headers: conToken(tokenComprador) });
  ok('Usuario consulta sus comercios vinculados -> 200', r.status === 200 && r.json.data.some((p) => p.id === comercio.id), `status=${r.status}`);

  r = await api(`/compradores/${comprador.id}/productores`, { headers: conToken(tokenComprador2) });
  ok('Usuario no consulta vínculos ajenos -> 403', r.status === 403, `status=${r.status}`);

  r = await api(`/productores/${comercio.id}/estadisticas`, { headers: conToken(tokenComercio) });
  ok('Comercio consulta sus estadísticas -> 200', r.status === 200 && r.json.data.productos >= 1, `status=${r.status}`);

  r = await api(`/productores/${comercio.id}/estadisticas`, { headers: conToken(tokenComercio2) });
  ok('Comercio no consulta estadísticas ajenas -> 403', r.status === 403, `status=${r.status}`);

  console.log('\n10) Subida de imágenes');
  r = await api('/uploads', { method: 'POST' });
  ok('Subir imagen sin sesión -> 401', r.status === 401, `status=${r.status}`);

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const formData = new FormData();
  formData.append('archivos', new Blob([png], { type: 'image/png' }), 'prueba.png');
  const subida = await fetch(`${base}/uploads`, {
    method: 'POST',
    headers: conToken(tokenComercio),
    body: formData
  });
  const subidaJson = await subida.json().catch(() => null);
  ok(
    'Comercio sube imagen -> 201',
    subida.status === 201 && subidaJson?.data?.[0]?.startsWith('/uploads/'),
    `status=${subida.status}`
  );

  if (subidaJson?.data?.[0]) {
    const imagen = await fetch(`http://127.0.0.1:${PUERTO}${subidaJson.data[0]}`);
    ok(
      'Imagen servida con content-type correcto',
      imagen.status === 200 && imagen.headers.get('content-type') === 'image/png',
      `status=${imagen.status} type=${imagen.headers.get('content-type')}`
    );
  }

  console.log('\n11) Eliminación y rutas inexistentes');
  r = await api(`/productos/${producto2.id}`, { method: 'DELETE', headers: conToken(tokenComprador) });
  ok('Usuario no elimina producto -> 403', r.status === 403, `status=${r.status}`);

  r = await api(`/productos/${producto2.id}`, { method: 'DELETE', headers: conToken(tokenComercio) });
  ok('Comercio no elimina producto ajeno -> 403', r.status === 403, `status=${r.status}`);

  r = await api(`/productos/${producto.id}`, { method: 'DELETE', headers: conToken(tokenComercio) });
  ok('Comercio elimina su producto -> 200', r.status === 200, `status=${r.status}`);

  r = await api(`/productos/${producto.id}`);
  ok('Producto eliminado no está disponible -> 404', r.status === 404, `status=${r.status}`);

  r = await api('/productos');
  ok('Producto eliminado no aparece en listado', !r.json.data.some((p) => p.id === producto.id));

  r = await api('/ruta/inexistente');
  ok('Ruta inexistente -> 404', r.status === 404, `status=${r.status}`);
};

try {
  await ejecutar();
} catch (error) {
  console.error('Error fatal en las pruebas:', error);
  fallos++;
} finally {
  if (servidor) await new Promise((resolve) => servidor.close(resolve));
  await sequelize.close();
  fs.rmSync(DB_FILE, { force: true });
  fs.rmSync(UPLOAD_DIR, { recursive: true, force: true });
  console.log(
    `\nRESULTADO FINAL: ${fallos === 0 ? 'TODAS LAS PRUEBAS PASARON' : `${fallos} PRUEBA(S) FALLARON`}`
  );
  process.exit(fallos === 0 ? 0 : 1);
}
