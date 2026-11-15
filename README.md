# 📍 SpotMarket — Plataforma de Precios y Comercios Locales (Formosa Capital)

Plataforma web de software para la **centralización, consulta y comparación transparente de precios** entre minimercados, almacenes y comercios de barrio en **Formosa Capital**.

> **"Informate de los mejores precios de tu zona desde la comodidad de tu hogar."**

---

## 🎯 Propósito del Proyecto y Problemática Resuelta

En Formosa Capital, la información sobre precios en góndola se encuentra altamente descentralizada y dispersa en los diferentes barrios urbanos. Estudios de mercado confirman que un mismo producto de la canasta básica familiar puede costar hasta un **9,2% más** según el negocio elegido, llegando a brechas del **20% al 50%** de ahorro potencial si se cuenta con información precisa en tiempo real.

### Actores Beneficiados
1. **Consumidores y Familias:** Comparan precios reales de proximidad antes de salir a comprar, protegiendo sus ingresos diarios contra la inflación.
2. **Estudiantes del Interior:** Jóvenes que llegan a estudiar a la capital sin conocer los comercios ni las referencias de precios de cada barrio.
3. **Pequeños y Medianos Comerciantes:** Minimercados y negocios barriales independientes que obtienen una vidriera digital gratuita y geolocalizada para competir con visibilidad frente a las grandes cadenas.

> **Importante:** SpotMarket **no es un e-commerce transaccional**. No se realizan compras directas, pedidos ni pagos en la aplicación, ni se gestiona stock ni regateo de precios. La plataforma conecta informativamente a vecinos con comerciantes a través de sus canales de contacto directo (WhatsApp, teléfono y ubicación física).

---

## 🚀 Características Principales

- **Catálogo de Precios Transparente:** Búsqueda en tiempo real por nombre, rubro, categorías y ordenamiento de precios.
- **Productos Más Solicitados y Vendidos:** Sección destacada en la portada principal para identificar rápidamente los productos líderes de la canasta barrial.
- **Ofertas de la Semana:** Descuentos temporales publicados por comercios con cálculo de porcentaje de ahorro y distancia.
- **Financiación en Cuotas:** Visibilidad de facilidades de pago (ej. 3, 6 y 12 cuotas fijas).
- **Mapa Interactivo de Formosa Capital:** Visualización con OpenStreetMap/Leaflet y cálculo de distancia en línea recta mediante la fórmula de **Haversine** (`lat/lng`).
- **Comunidad y Valoraciones:** Los usuarios registrados pueden calificar con estrellas y comentar **únicamente sobre los productos** (se excluye la calificación entre negocios para garantizar un entorno leal y constructivo).
- **Panel Exclusivo del Comerciante:**
  - Registro ágil en 3 pasos: datos del local, ubicación en el mapa y fotografías.
  - Publicación y edición inmediata de productos con soporte para fotos (Cloudinary) y precios.
  - Gestión de ofertas y promociones con fecha límite.
  - Actualización de canales de atención (WhatsApp, teléfono y dirección).

---

## 🛠️ Stack Tecnológico

El proyecto está construido íntegramente siguiendo los lineamientos curriculares y pedagógicos de la carrera de Desarrollo de Software (Instituto Politécnico Formosa):

### Frontend
- **React (v18+)** con **Vite** como empaquetador ultrarrápido con HMR.
- **Tailwind CSS** para un diseño moderno, responsivo y de alto contraste oscuro (`#070C16`, `#111A2E`, `#FFB800`, `#EF4444`).
- **React Router** para navegación declarativa mediante SPA (Single Page Application).
- **Custom Hooks:** `useFetch` (para consumo de API con manejo de carga/error) y `useForm` (para formularios controlados con setter funcional).
- **Leaflet & React-Leaflet** para mapas geolocalizados.
- **Autenticación:** Manejo de estado de sesión basado en `isLogged` en `localStorage` y cookies seguras.

### Backend
- **Node.js** con entorno **Express** estructurado en arquitectura en capas (config, models, controllers, routes, middlewares, utils/helpers).
- **ESModules (`import` / `export`)** nativo.
- **Sequelize ORM** con soporte dual:
  - **MySQL / MariaDB** (motor relacional principal para cursada y producción).
  - **SQLite** (motor ligero con archivo local para ejecución y testing sin configuración).
- **Seguridad y Autenticación:**
  - Contraseñas hasheadas irreversiblemente con **bcryptjs** (costo `saltRounds: 10`).
  - Autenticación con **JWT (JSON Web Token)** transmitido mediante cookies seguras **`httpOnly`** (protección contra ataques XSS) y `credentials: 'include'`.
- **Validaciones:** Validación robusta en todas las rutas con **express-validator**.
- **Gestión Multimedia:** Subida de imágenes procesada en memoria mediante **Multer** y almacenada en la nube con **Cloudinary** (`upload_stream`), persistiendo en la base de datos únicamente `url` y `public_id`.

---

## 📂 Estructura del Repositorio

```text
spot-market/
├── backend/
│   ├── server.js                     # Punto de entrada del servidor Express
│   ├── app.js                        # Configuración de Express, CORS y Middlewares
│   ├── package.json
│   ├── .env.example                  # Variables de entorno modelo
│   └── src/
│       ├── config/                   # Conexión Sequelize (db.js) y Cloudinary
│       ├── models/                   # Modelos: Usuario, Comercio, FotoComercio, Producto, Oferta, Valoracion, Favorito
│       ├── controllers/              # Controladores de lógica de negocio (CRUDs)
│       ├── routes/                   # Definición de endpoints (/api)
│       ├── middlewares/              # Autenticación (verificarToken), Multer, Validaciones y Manejo de Errores
│       ├── utils/                    # Fórmula de Haversine, subida Cloudinary, cookies
│       ├── validators/               # Reglas de express-validator
│       └── seed.js                   # Carga inicial de datos reales de Formosa
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js                # Proxy hacia el backend (:4000)
│   ├── tailwind.config.js
│   ├── package.json
│   └── src/
│       ├── assets/                   # Logotipos oficiales SVG
│       ├── components/               # Navbar, Footer y componentes modulares
│       ├── hooks/                    # useFetch y useForm (según pautas de cátedra)
│       ├── pages/                    # Inicio, Productos, DetalleProducto, Ofertas, MapaPage, Login, Register, Panel
│       ├── services/                 # api.js con fetch nativo y credentials: 'include'
│       ├── index.css                 # Directivas Tailwind y estilos de alto contraste
│       ├── App.jsx                   # Enrutamiento principal
│       └── main.jsx                  # Montaje con createRoot y StrictMode
│
└── README.md
```

---

## ⚡ Guía de Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/fabiannacevvedo-crypto/Spot-Market.git
cd Spot-Market
```

### 2. Configurar el Backend
```bash
cd backend
npm install
cp .env.example .env
```

*Configuración en `.env`:*
```env
DB_DIALECT=sqlite              # O 'mysql' si tenés MySQL/XAMPP corriendo
DB_NAME=spotmarket
DB_USER=root
DB_PASS=
DB_HOST=127.0.0.1
DB_PORT=3306
PORT=4000
JWT_SECRET=secreto_desarrollo_spotmarket_2026
CORS_ORIGIN=http://localhost:5173
```

### 3. Cargar Datos de Demostración (Seed)
Puebla automáticamente 7 comercios barriales de Formosa (Almacén Don Pepe, Súper Sol APA, Frutería La Esquina, Deportes Norte, TechZone, etc.) y más de 15 productos:
```bash
npm run seed
```

### 4. Iniciar el Backend
```bash
npm start
# La API queda escuchando en http://localhost:4000/api
```

### 5. Iniciar el Frontend (React)
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
# La aplicación abrirá en http://localhost:5173
```

---

## 🔐 Cuentas de Prueba Pre-cargadas

| Rol | Correo Electrónico | Contraseña | Acceso |
| :--- | :--- | :--- | :--- |
| **Comerciante (Almacén Don Pepe)** | `comercio1@spotmarket.com` | `123456` | Panel de Comercio completo |
| **Comerciante (Súper Sol APA)** | `comercio2@spotmarket.com` | `123456` | Panel de Comercio completo |
| **Comerciante (Deportes Norte)** | `comercio4@spotmarket.com` | `123456` | Panel de Comercio completo |
| **Consumidor / Vecino** | `consumidor@spotmarket.com` | `123456` | Guardar favoritos y valorar productos |

---

## 👥 Equipo de Desarrollo y Presentación
- **Aguirre, Ana Belén**
- **Bogado, Daiana**
- **Duarte, Serena**
- **Schibilbain, Valentina**

*Desarrollado en el marco del Instituto Politécnico Formosa — 2026.*
