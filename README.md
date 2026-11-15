# Spot Market

Marketplace local para conectar comercios de barrio (almacenes, kioscos, verdulerías, carnicerías, distribuidoras y más) con vecinos, restaurantes y otros comercios.

El catálogo se puede explorar sin cuenta. Para ver locales cercanos, filtrar u ordenar por precio, calificar comercios/productos, hacer pedidos y negociar por chat se requiere registro.

## Características

- Catálogo público de comercios y productos con búsqueda, filtros y orden.
- Gating real desde el backend:
  - filtros/orden por precio requieren sesión (`401 REGISTRO_REQUERIDO`);
  - locales cercanos requieren sesión (`401`);
  - calificar, pedir, chatear y editar perfiles requiere sesión (`401/403`).
- Geolocalización de comercios y listado “Cerca de mí” por radio (Haversine).
- Registro de usuarios (vecino, comercio, restaurante, mayorista) y de comerciantes con:
  - nombre del local, responsable, teléfono, email, ubicación y coordenadas;
  - categoría `minorista`, `mayorista` o `ambos`;
  - tipos de productos que ofrece;
  - fotos del local y descripción.
- Publicación/edición/eliminación de productos con precio, precio de oferta, especificación, descripción, stock e imagen.
- Calificación de comercios y productos de 1 a 5 estrellas con comentario (una reseña por usuario y destino; se actualiza, no se duplica).
- Pedidos con estados `pendiente → confirmado → entregado`; la confirmación exige que el precio negociado coincida con una oferta enviada en el chat.
- Chat de negociación entre usuario y comercio.
- Imágenes subidas al backend (JPG, PNG, WEBP, GIF · máx. 5 MB) servidas desde `/uploads`.
- Interfaz responsive en HTML/CSS/JS vanilla + Bootstrap 5.

## Stack

- Backend: Node.js, Express, Sequelize, JWT, bcryptjs, multer.
- Base de datos: SQLite por defecto (cero configuración) o MySQL opcional.
- Frontend: HTML, CSS, JavaScript ES Modules y Bootstrap 5.3 vía CDN. El backend sirve el frontend, así que toda la aplicación funciona en un solo puerto. También incluye un servidor de desarrollo opcional con proxy.

## Puesta en marcha

Requisitos: Node.js 18 o superior y npm.

Desde la raíz del proyecto:

```bash
npm run install:all   # instala dependencias del backend
npm run seed          # crea la base y carga datos demo
npm start
```

Abrí `http://localhost:4000`.

El backend sirve tanto la aplicación web como la API:

- App: `http://localhost:4000`
- API: `http://localhost:4000/api/v1`
- Salud: `http://localhost:4000/api/v1/salud`
- Imágenes: `http://localhost:4000/uploads/...`

El archivo `.env` es opcional; los valores por defecto ya funcionan con SQLite. Si necesitás cambiarlos, copiá `backend/.env.example` a `backend/.env`.

### Frontend en modo desarrollo (opcional)

Si querés usar el servidor de desarrollo del frontend con recarga manual y proxy:

```bash
# terminal 1, desde la raíz
npm start

# terminal 2
cd frontend
npm start
```

En ese caso abrí `http://localhost:5175`. El servidor de frontend hace proxy de `/api/*` y `/uploads/*` hacia `http://localhost:4000`.

### Abrir y ejecutar desde VS Code

El proyecto está preparado para VS Code:

1. Abrí la carpeta completa del proyecto (`spot-market`), no solo un archivo ni la carpeta personal.
2. La primera vez, ejecutá las tareas `1. Instalar dependencias` y `2. Cargar datos demo` desde `Terminal → Run Task`.
3. Presioná `F5` y elegí `Spot Market (servidor + frontend)`.
4. Abrí `http://localhost:4000`.

La configuración está en `.vscode/launch.json`, `.vscode/tasks.json` y `.vscode/settings.json`. Si aparece `EADDRINUSE`, ya hay otro servidor usando el puerto 4000: cerralo o detené la terminal anterior antes de presionar `F5`.

## Credenciales demo

Contraseña para todas las cuentas: `123456`.

| Rol | Email | Nombre |
| --- | --- | --- |
| Comercio | `juan@spotmarket.com` | Almacén Don Juan (minorista) |
| Comercio | `maria@spotmarket.com` | Distribuidora María (mayorista) |
| Comercio | `pedro@spotmarket.com` | Kiosco El Sol (minorista) |
| Comercio | `carla@spotmarket.com` | Panadería La Espiga (minorista) |
| Usuario | `vecino@spotmarket.com` | Sofía Ramírez |
| Usuario | `resto@spotmarket.com` | Restaurante Sabores |

## Reglas de acceso

| Acción | Sin cuenta | Con cuenta |
| --- | --- | --- |
| Explorar comercios y productos | Sí | Sí |
| Filtrar u ordenar por precio | No | Sí |
| Ver locales cercanos | No | Sí |
| Calificar comercio/producto | No | Sí (no el propio) |
| Hacer pedidos | No | Solo usuarios |
| Confirmar pedido | No | Solo el comercio dueño |
| Marcar entregado | No | Solo el usuario comprador |
| Chatear/negociar | No | Solo participantes |
| Publicar/editar productos | No | Solo el comercio dueño |
| Editar perfil | No | Solo el propio |

## Flujo rápido

### Como comerciante

1. Crear cuenta con “Soy comerciante”, completar datos del local, tipos de productos, ubicación (botón “Usar mi ubicación”) y fotos.
2. Desde “Productos”, usar “Publicar producto” y cargar nombre, tipo, descripción, especificación, precio, oferta, stock e imagen.
3. Recibir consultas en “Chats” y pedidos en “Pedidos”.
4. Confirmar un pedido pendiente. Solo se confirma si el precio negociado coincide con una oferta enviada en el chat.
5. Editar el perfil en “Comercios → Mi perfil”.

### Como usuario

1. Crear cuenta como usuario o explorar el catálogo sin registrarse.
2. Registrarse para usar “Cerca de mí”, filtros por precio y calificaciones.
3. Pedir un producto desde “Productos” o negociar en “Chats”.
4. Marcar como entregado un pedido confirmado por el comercio.
5. Calificar comercios y productos desde “Comercios” y “Productos”.

## API principal

Base: `http://localhost:4000/api/v1`

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/salud` | Público |
| POST | `/auth/productores/registro` (`/auth/comercios/registro`) | Público |
| POST | `/compradores/registro` | Público |
| POST | `/auth/login` | Público |
| GET | `/productores` | Público |
| GET | `/productores/cercanos?lat=&lng=&radio=` | Autenticado |
| GET | `/productores/:id` | Público |
| PATCH/DELETE | `/productores/:id` | Dueño |
| GET | `/productores/:id/calificaciones` | Público |
| POST | `/productores/:id/calificaciones` | Autenticado |
| GET | `/productores/:id/estadisticas` | Dueño |
| GET | `/productos` | Público; precio/orden por precio requieren sesión |
| GET | `/productos/:id` | Público |
| POST/PATCH/DELETE | `/productos` · `/productos/:id` | Comercio dueño |
| GET | `/productos/:id/calificaciones` | Público |
| POST | `/productos/:id/calificaciones` | Autenticado |
| GET | `/compradores` | Autenticado |
| PATCH | `/compradores/:id` | Dueño |
| GET | `/compradores/:id/productores` | Dueño |
| GET | `/transacciones` | Autenticado (solo propias) |
| POST | `/transacciones` | Usuario autenticado |
| PATCH | `/transacciones/:id/estado` | Participante según estado |
| GET | `/chats` | Autenticado (solo propios) |
| GET/POST | `/chats/productor/:productor_id/comprador/:comprador_id` | Participantes |
| POST | `/uploads` | Autenticado (`archivo` o `archivos`) |

Las respuestas exitosas siguen el formato `{ ok, message, data?, ... }`. Los errores de validación devuelven `400` con `errors`.

## Configuración

Variables en `backend/.env` (ver `backend/.env.example`):

| Variable | Default | Descripción |
| --- | --- | --- |
| `DB_DIALECT` | `sqlite` | `sqlite` o `mysql` |
| `DB_STORAGE` | `backend/data/spotmarket.sqlite` | Archivo SQLite (las rutas relativas se resuelven desde `backend/`) |
| `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_HOST`, `DB_PORT` | — | Conexión MySQL |
| `PORT` | `4000` | Puerto del servidor |
| `JWT_SECRET` | `secreto_dev` | Cambiar en producción |
| `UPLOAD_DIR` | `backend/uploads` | Carpeta de imágenes |
| `FRONTEND_DIR` | `frontend/` | Carpeta del frontend servida por Express |
| `NODE_ENV` | `development` | Entorno |

Para usar MySQL:

```env
DB_DIALECT=mysql
DB_NAME=spot_market
DB_USER=root
DB_PASS=tu_password
DB_HOST=127.0.0.1
DB_PORT=3306
```

Luego ejecutá `npm run seed` para crear las tablas y cargar los datos demo.

## Pruebas

```bash
npm test
```

Las pruebas levantan la app en el puerto `4100`, usan una base SQLite aislada (`backend/data/test-spotmarket.sqlite`) y una carpeta de uploads temporal, y al finalizar eliminan esos archivos. Cubren registro/login, gating por precio, locales cercanos, permisos, calificaciones, pedidos, chat, privacidad, subida de imágenes y borrado lógico.

## Estructura

```text
package.json         scripts para iniciar, sembrar y probar desde la raíz
backend/
  app.js, server.js
  src/
    config/        conexión, entorno y catálogos
    models/        Productor, Comprador, Producto, Calificacion, Chat, Transaccion
    controllers/   lógica de la API
    routes/        endpoints
    middlewares/   auth, uploads, validación y errores
    validators/    reglas de entrada
    utils/         geolocalización y resúmenes de calificaciones
    seed.js        datos demo
  tests/api.test.js
frontend/
  *.html
  assets/css/estilos.css
  assets/js/app.js y módulos por página
  servidor.js      servidor estático + proxy
```

## Notas

- El proyecto usa soft delete en comercios, productos, usuarios, transacciones y chats.
- Las fotos demo del seed son URLs externas de `picsum.photos`.
- En producción, cambiá `JWT_SECRET`, usá HTTPS y serví el frontend compilado/estático detrás de un proxy.
