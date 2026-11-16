// Panel de Gestión Integral del Comerciante - SpotMarket Formosa Capital.
// Módulos:
// 1) Dashboard: Métricas, productos más solicitados/vistos y valoraciones/opiniones recibidas.
// 2) Catálogo (CRUD): Alta, edición y eliminación de productos (sin stock ni regateo, con foto).
// 3) Ofertas Temporales: Crear, editar y pausar promociones con fecha de vigencia (sincronizadas con Inicio).
// 4) Perfil del Comercio: WhatsApp, dirección, horario de atención y tipo (Minorista/Mayorista).
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATEGORIAS_PRODUCTOS, TIPOS_COMERCIO } from '../constants/categorias.js';
import { resolverUrlImagen } from '../utils/imageUrl.js';

export default function PanelComercio() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { usuario, cargando: authCargando } = useAuth();

  const tabActual = searchParams.get('tab') || 'Dashboard';
  const [tab, setTab] = useState(tabActual);

  const [comercio, setComercio] = useState(null);
  const [productos, setProductos] = useState([]);
  const [ofertas, setOfertas] = useState([]);
  const [resumenVal, setResumenVal] = useState(null);
  const [masBuscados, setMasBuscados] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [mensaje, setMensaje] = useState('');

  const cambiarTab = (t) => {
    setTab(t);
    setSearchParams({ tab: t });
  };

  const cargarDatos = async () => {
    setCargandoDatos(true);
    try {
      const [resComercio, resOfertas, resVal, resTop] = await Promise.all([
        api('/comercios/mi-comercio').catch(() => null),
        api('/ofertas/mis-ofertas').catch(() => ({ ofertas: [] })),
        api('/valoraciones/mi-comercio').catch(() => null),
        api('/comercios/mas-buscados').catch(() => ({ productos: [] }))
      ]);

      if (resComercio?.comercio) {
        setComercio(resComercio.comercio);
        setProductos(resComercio.comercio.productos || []);
      }
      setOfertas(resOfertas?.ofertas || []);
      setResumenVal(resVal?.resumen || null);
      setMasBuscados(resTop?.productos || []);
    } catch (err) {
      console.error('Error cargando datos del panel:', err);
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => {
    if (!authCargando) {
      if (!usuario || usuario.rol !== 'comerciante') {
        nav('/login');
      } else {
        cargarDatos();
      }
    }
  }, [usuario, authCargando]);

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t && t !== tab) setTab(t);
  }, [searchParams]);

  if (authCargando || cargandoDatos) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-gray-400 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#FFB800] border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando panel de comerciante...</span>
        </div>
      </div>
    );
  }

  const ofertasVigentes = ofertas.filter(
    (o) => new Date(o.fecha_fin) >= new Date()
  ).length;

  const totalVistas = productos.reduce((acc, p) => acc + (p.vistas || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-blanco">
      {/* CABECERA DEL PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#FFB800] text-black text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
              {comercio?.tipo_comercio || 'Comercio Local'}
            </span>
            <span className="text-xs text-gray-400">Panel de Control</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-1">
            {comercio?.nombre_local || usuario?.nombre_local || 'Mi Comercio'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {comercio?.direccion || 'Formosa Capital'} {comercio?.telefono ? `· Tel: ${comercio.telefono}` : ''}
          </p>
        </div>

        {/* NAVEGACIÓN ENTRE SECCIONES DEL PANEL */}
        <div className="flex flex-wrap gap-2">
          {['Dashboard', 'Productos', 'Ofertas', 'Perfil'].map((t) => (
            <button
              key={t}
              onClick={() => cambiarTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow cursor-pointer ${
                tab === t
                  ? 'fondo-dorado text-negro'
                  : 'bg-gris-oscuro text-gris-azulado hover:text-blanco border border-borde hover:border-gris-azulado'
              }`}
            >
              {t === 'Dashboard' && 'Métricas / Resumen'}
              {t === 'Productos' && 'Catálogo de Productos'}
              {t === 'Ofertas' && 'Ofertas Temporales'}
              {t === 'Perfil' && 'Datos del Comercio'}
            </button>
          ))}
        </div>
      </div>

      {mensaje && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>{mensaje}</span>
          <button onClick={() => setMensaje('')} className="text-gris-azulado hover:text-blanco text-xs font-bold cursor-pointer">Cerrar</button>
        </div>
      )}

      {/* CONTENIDO SEGÚN TAB ACTIVA */}
      {tab === 'Dashboard' && (
        <DashboardTab
          productosCount={productos.length}
          ofertasCount={ofertasVigentes}
          totalVistas={totalVistas}
          resumenVal={resumenVal}
          masBuscados={masBuscados}
          productos={productos}
          irAProductos={() => cambiarTab('Productos')}
          irAOfertas={() => cambiarTab('Ofertas')}
        />
      )}

      {tab === 'Productos' && (
        <ProductosTab
          productos={productos}
          onActualizar={() => {
            setMensaje('Catálogo actualizado correctamente.');
            cargarDatos();
          }}
        />
      )}

      {tab === 'Ofertas' && (
        <OfertasTab
          ofertas={ofertas}
          productos={productos}
          onActualizar={() => {
            setMensaje('Ofertas actualizadas correctamente.');
            cargarDatos();
          }}
        />
      )}

      {tab === 'Perfil' && (
        <PerfilTab
          comercio={comercio}
          onActualizar={() => {
            setMensaje('Perfil comercial actualizado.');
            cargarDatos();
          }}
        />
      )}
    </div>
  );
}

/* =========================================================================
   1. DASHBOARD: MÉTRICAS, RANKING DE PRODUCTOS Y VALORACIONES RECIBIDAS
   ========================================================================= */
function DashboardTab({
  productosCount,
  ofertasCount,
  totalVistas,
  resumenVal,
  masBuscados,
  productos,
  irAProductos,
  irAOfertas
}) {
  const valoraciones = resumenVal?.valoraciones || [];

  return (
    <div className="mt-6 space-y-8">
      {/* 3 TARJETAS KPI: PRODUCTOS ACTIVOS, OFERTAS VIGENTES Y VALORACIONES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111A2E] border border-white/10 rounded-2xl p-5 shadow-lg">
          <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Productos Activos</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-white">{productosCount}</span>
            <button onClick={irAProductos} className="text-xs text-[#FFB800] hover:underline font-semibold">
              Ver catálogo &rarr;
            </button>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">En góndola barrial de Formosa</p>
        </div>

        <div className="bg-[#111A2E] border border-white/10 rounded-2xl p-5 shadow-lg">
          <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Ofertas Vigentes</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-[#EF4444]">{ofertasCount}</span>
            <button onClick={irAOfertas} className="text-xs text-[#FFB800] hover:underline font-semibold">
              Administrar &rarr;
            </button>
          </div>
          <p className="text-[11px] text-yellow-300/80 font-medium mt-1">Con descuento activo en Inicio</p>
        </div>

        <div className="bg-gris-oscuro border border-borde rounded-2xl p-5 shadow-lg">
          <p className="text-xs font-bold uppercase text-gris-azulado tracking-wider">Valoraciones</p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-amarillo">
              {resumenVal?.total != null ? resumenVal.total : 0}
            </span>
            <span className="text-[10px] text-gris-azulado font-bold">
              {resumenVal?.promedio != null ? `${resumenVal.promedio} de promedio` : 'Sin reseñas'}
            </span>
          </div>
          <p className="text-[11px] text-gris-azulado font-medium mt-1">Calificaciones recibidas de los clientes</p>
        </div>
      </div>

      {/* SECCIÓN 2: PRODUCTOS MÁS SOLICITADOS / VISTOS Y CON MEJOR VALORACIÓN */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Productos más solicitados y vistos */}
        <div className="bg-gris-oscuro border border-borde rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borde">
            <h3 className="text-sm font-bold text-blanco uppercase tracking-wider">
              Productos más solicitados y vistos
            </h3>
            <span className="text-xs text-gris-azulado">Interés en Formosa</span>
          </div>

          <div className="space-y-2.5">
            {(masBuscados.length > 0 ? masBuscados : productos.slice(0, 5)).map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl bg-negro/40 border border-borde/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-amarillo w-4">#{idx + 1}</span>
                  <div className="w-10 h-10 rounded-lg bg-negro/60 overflow-hidden flex items-center justify-center flex-shrink-0 text-[10px] text-gris-azulado">
                    {p.imagen_url ? (
                      <img src={resolverUrlImagen(p.imagen_url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      'Sin foto'
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blanco truncate max-w-[180px]">{p.nombre}</p>
                    <p className="text-[10px] text-gris-azulado">${Number(p.precio_oferta || p.precio).toLocaleString('es-AR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-verde">{p.vistas || 0} vistas</span>
                  <p className="text-[10px] text-rojo font-medium">{p.likes || 0} me gusta</p>
                </div>
              </div>
            ))}
            {productos.length === 0 && (
              <p className="text-xs text-gris-azulado text-center py-4">Aún no cargaste productos en tu catálogo.</p>
            )}
          </div>
        </div>

        {/* Opiniones y valoraciones recibidas de los clientes */}
        <div className="bg-gris-oscuro border border-borde rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borde">
            <h3 className="text-sm font-bold text-blanco uppercase tracking-wider">
              Valoraciones
            </h3>
            <span className="text-xs text-amarillo font-bold">
              {resumenVal?.promedio ? `${resumenVal.promedio} de 5 estrellas` : 'Sin opiniones'}
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {valoraciones.map((val) => (
              <div key={val.id} className="p-3.5 rounded-xl bg-negro/40 border border-borde/40 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blanco">{val.usuario?.nombre || 'Usuario'}</span>
                    <span className="text-amarillo text-xs font-bold">{val.puntuacion}/5</span>
                  </div>
                  <span className="text-[10px] text-gris-azulado">
                    {val.createdAt ? new Date(val.createdAt).toLocaleDateString('es-AR') : ''}
                  </span>
                </div>
                <p className="text-[11px] text-gris-azulado italic">"{val.comentario}"</p>
                {val.productoNombre && (
                  <p className="text-[10px] text-amarillo font-medium pt-1">
                    Sobre producto: {val.productoNombre}
                  </p>
                )}
              </div>
            ))}
            {valoraciones.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-8">
                Tus productos aún no han recibido valoraciones comunitarias.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. CATÁLOGO: CRUD DE PRODUCTOS (ALTA, EDICIÓN, ELIMINACIÓN CON FOTO)
   ========================================================================= */
function ProductosTab({ productos, onActualizar }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    precio_oferta: '',
    cuotas: '',
    categoria: CATEGORIAS_PRODUCTOS[0]
  });
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  const abrirCrear = () => {
    setProductoEditar(null);
    setForm({
      nombre: '',
      descripcion: '',
      precio: '',
      precio_oferta: '',
      cuotas: '',
      categoria: CATEGORIAS_PRODUCTOS[0]
    });
    setArchivoFoto(null);
    setPreviewFoto('');
    setErrorModal('');
    setModalAbierto(true);
  };

  const abrirEditar = (p) => {
    setProductoEditar(p);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio,
      precio_oferta: p.precio_oferta || '',
      cuotas: p.cuotas || '',
      categoria: p.categoria || CATEGORIAS_PRODUCTOS[0]
    });
    setArchivoFoto(null);
    setPreviewFoto(p.imagen_url ? resolverUrlImagen(p.imagen_url) : '');
    setErrorModal('');
    setModalAbierto(true);
  };

  const handleFoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoFoto(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    setCargando(true);
    setErrorModal('');

    try {
      const fd = new FormData();
      fd.append('nombre', form.nombre);
      fd.append('descripcion', form.descripcion);
      fd.append('precio', form.precio);
      if (form.precio_oferta) fd.append('precio_oferta', form.precio_oferta);
      if (form.cuotas) fd.append('cuotas', form.cuotas);
      fd.append('categoria', form.categoria);
      if (archivoFoto) fd.append('imagen', archivoFoto);

      if (productoEditar) {
        await api(`/productos/${productoEditar.id}`, { method: 'PUT', body: fd });
      } else {
        await api('/productos', { method: 'POST', body: fd });
      }

      setModalAbierto(false);
      onActualizar();
    } catch (err) {
      setErrorModal(err.message || 'Error al guardar el producto.');
    } finally {
      setCargando(false);
    }
  };

  const eliminarProducto = async (p) => {
    if (!confirm(`¿Eliminar "${p.nombre}" del catálogo?`)) return;
    try {
      await api(`/productos/${p.id}`, { method: 'DELETE' });
      onActualizar();
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const filtrados = productos.filter((p) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    const matchNombre = p.nombre ? p.nombre.toLowerCase().includes(q) : false;
    const matchCat = p.categoria ? p.categoria.toLowerCase().includes(q) : false;
    return matchNombre || matchCat;
  });

  return (
    <div className="mt-6 space-y-6">
      {/* BARRA SUPERIOR: BUSCADOR DE PRODUCTOS (REEMPLAZA EL DESPLEGABLE) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o categoría de producto..."
            className="w-full rounded-xl bg-negro/70 border border-borde px-4 py-2.5 pl-10 text-xs text-blanco placeholder:text-gris-azulado focus:outline-none focus:border-amarillo transition shadow-sm"
          />
          <svg className="w-4 h-4 text-gris-azulado absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <button
          onClick={abrirCrear}
          className="fondo-dorado text-negro font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-lg hover:brightness-110 flex items-center justify-center self-start sm:self-auto cursor-pointer"
        >
          Nuevo Producto
        </button>
      </div>

      {/* TABLA DE PRODUCTOS (SIN PRECIO DE OFERTA, CON ÚLTIMA MODIFICACIÓN) */}
      <div className="rounded-2xl bg-gris-oscuro border border-borde overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/30 border-b border-borde text-gris-azulado font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Producto</th>
                <th className="px-5 py-3.5">Rubro</th>
                <th className="px-5 py-3.5">Precio Regular</th>
                <th className="px-5 py-3.5">Última Modificación</th>
                <th className="px-5 py-3.5">Cuotas</th>
                <th className="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde/40">
              {filtrados.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-5 py-3.5 font-bold text-blanco flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-negro/60 border border-borde overflow-hidden flex items-center justify-center flex-shrink-0">
                      {p.imagen_url ? (
                        <img src={resolverUrlImagen(p.imagen_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gris-azulado">Sin foto</span>
                      )}
                    </div>
                    <div>
                      <p className="truncate max-w-xs text-blanco font-semibold">{p.nombre}</p>
                      <p className="text-[10px] text-gris-azulado font-normal">{p.vistas || 0} vistas comunitarias</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gris-azulado">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-borde text-[11px] text-blanco">
                      {p.categoria || 'Almacén'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-blanco">
                    ${Number(p.precio).toLocaleString('es-AR')}
                  </td>
                  <td className="px-5 py-3.5 text-blanco whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-blanco">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Reciente'}
                      </span>
                      <span className="text-[10px] text-gris-azulado">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs' : ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-verde font-semibold">{p.cuotas || 'Contado'}</td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-amarillo bg-amarillo/10 hover:bg-amarillo/20 border border-amarillo/20 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarProducto(p)}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-rojo bg-rojo/10 hover:bg-rojo/20 border border-rojo/20 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gris-azulado">
                    No hay productos para mostrar en este criterio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA CREAR O EDITAR PRODUCTO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111A2E] border border-white/15 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-white">
                {productoEditar ? 'Editar Producto' : 'Publicar Nuevo Producto en SpotMarket'}
              </h3>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-gris-azulado hover:text-blanco text-xs font-bold px-2 py-1 cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={guardarProducto} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Yerba Mate Especial 1 kg"
                  required
                  className="w-full rounded-xl bg-[#070C16] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Precio Regular ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    placeholder="0.00"
                    required
                    className="w-full rounded-xl bg-[#070C16] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#EF4444] mb-1">Precio de Oferta ($ opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precio_oferta}
                    onChange={(e) => setForm({ ...form, precio_oferta: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-xl bg-[#070C16] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Rubro</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full rounded-xl bg-[#070C16] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFB800]"
                  >
                    {CATEGORIAS_PRODUCTOS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Financiación en Cuotas</label>
                  <input
                    type="text"
                    value={form.cuotas}
                    onChange={(e) => setForm({ ...form, cuotas: e.target.value })}
                    placeholder="Ej: 3 cuotas sin interés"
                    className="w-full rounded-xl bg-[#070C16] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Detalles sobre presentación, procedencia o beneficios..."
                  className="w-full rounded-xl bg-[#070C16] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              {/* FOTO CON PREVIEW */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Foto del Producto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFoto}
                  className="block w-full text-[11px] text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-[#FFB800] file:text-black cursor-pointer"
                />
                {previewFoto && (
                  <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-black/40 border border-white/10">
                    <img src={previewFoto} alt="Preview" className="h-14 w-14 object-cover rounded-lg border border-white/20" />
                    <span className="text-[11px] text-emerald-400 font-semibold">Foto lista para guardar</span>
                  </div>
                )}
              </div>

              {errorModal && (
                <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
                  {errorModal}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 rounded-xl border border-white/15 text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="px-6 py-2 rounded-xl bg-[#FFB800] hover:bg-yellow-400 text-black font-extrabold shadow disabled:opacity-50"
                >
                  {cargando ? 'Guardando...' : productoEditar ? 'Guardar Cambios' : 'Publicar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   3. OFERTAS: CREAR, EDITAR, PAUSAR Y SINCRONIZAR PROMOCIONES TEMPORALES
   ========================================================================= */
function OfertasTab({ ofertas, productos, onActualizar }) {
  const [modalOferta, setModalOferta] = useState(false);
  const [ofertaEditar, setOfertaEditar] = useState(null);
  const [productoId, setProductoId] = useState(productos[0]?.id || '');
  const [precioOferta, setPrecioOferta] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const abrirCrear = () => {
    setOfertaEditar(null);
    setProductoId(productos[0]?.id || '');
    setPrecioOferta('');
    const finDefault = new Date();
    finDefault.setDate(finDefault.getDate() + 15);
    setFechaFin(finDefault.toISOString().split('T')[0]);
    setError('');
    setModalOferta(true);
  };

  const abrirEditar = (o) => {
    setOfertaEditar(o);
    setProductoId(o.productoId || o.producto?.id);
    setPrecioOferta(o.precio_oferta);
    setFechaFin(o.fecha_fin ? o.fecha_fin.split('T')[0] : '');
    setError('');
    setModalOferta(true);
  };

  const guardarOferta = async (e) => {
    e.preventDefault();
    if (!productoId) {
      setError('Debes seleccionar un producto del catálogo.');
      return;
    }
    if (!precioOferta || parseFloat(precioOferta) <= 0) {
      setError('Ingresá un precio de oferta válido mayor a 0.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const payload = {
        productoId: parseInt(productoId, 10),
        precio_oferta: parseFloat(precioOferta),
        fecha_inicio: new Date().toISOString(),
        fecha_fin: fechaFin
          ? new Date(fechaFin + 'T23:59:59').toISOString()
          : new Date(Date.now() + 7 * 86400000).toISOString()
      };

      if (ofertaEditar) {
        await api(`/ofertas/${ofertaEditar.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await api('/ofertas', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      setModalOferta(false);
      onActualizar();
    } catch (err) {
      const msg = err.detalles?.length
        ? err.detalles.map((d) => d.mensaje).join(', ')
        : (err.message || 'Error al guardar oferta.');
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  const eliminarOferta = async (o) => {
    if (!confirm('¿Eliminar esta oferta? El producto volverá a su precio regular.')) return;
    try {
      await api(`/ofertas/${o.id}`, { method: 'DELETE' });
      onActualizar();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Ofertas y Promociones Activas</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Las ofertas se reflejan al instante en la sección "Ofertas de la semana" de la portada.
          </p>
        </div>
        <button
          onClick={abrirCrear}
          disabled={productos.length === 0}
          className="bg-[#EF4444] hover:bg-red-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow-lg flex items-center gap-2 disabled:opacity-50"
        >
          Crear Nueva Oferta
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ofertas.map((o) => {
          const prod = o.producto;
          const vigente = new Date(o.fecha_fin) >= new Date();
          const descuento =
            prod?.precio && o.precio_oferta
              ? Math.round(((prod.precio - o.precio_oferta) / prod.precio) * 100)
              : null;

          return (
            <div
              key={o.id}
              className="bg-[#111A2E] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      vigente ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {vigente ? '● Activa en Inicio' : 'Vencida'}
                  </span>
                  {descuento && (
                    <span className="bg-[#EF4444] text-white font-black text-xs px-2 py-0.5 rounded-md shadow">
                      -{descuento}% OFF
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-black/40 overflow-hidden flex items-center justify-center flex-shrink-0 text-[10px] text-gray-500 font-semibold">
                    {prod?.imagen_url ? (
                      <img src={resolverUrlImagen(prod.imagen_url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      'Sin foto'
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm truncate max-w-[170px]">{prod?.nombre}</h4>
                    <p className="text-[11px] text-gray-400">Precio regular: ${Number(prod?.precio || 0).toLocaleString('es-AR')}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs text-gray-400">Precio de oferta:</p>
                  <p className="text-xl font-black text-[#EF4444]">${Number(o.precio_oferta).toLocaleString('es-AR')}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Vigente hasta: {new Date(o.fecha_fin).toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => abrirEditar(o)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold text-[#FFB800] bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/20"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarOferta(o)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {ofertas.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-[#111A2E]/50 border border-white/10 p-6">
          <h4 className="text-base font-bold text-white">No tenés ofertas creadas</h4>
          <p className="text-xs text-gray-400 mt-1">
            Creá una oferta sobre cualquiera de tus productos para destacarte en la portada de SpotMarket.
          </p>
        </div>
      )}

      {/* MODAL CREAR / EDITAR OFERTA */}
      {modalOferta && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111A2E] border border-white/15 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-extrabold text-white">
                {ofertaEditar ? 'Editar Oferta' : 'Crear Oferta Temporal'}
              </h3>
              <button onClick={() => setModalOferta(false)} className="text-gray-400 hover:text-white font-bold text-xs">Cerrar</button>
            </div>

            <form onSubmit={guardarOferta} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Producto</label>
                <select
                  value={productoId}
                  onChange={(e) => setProductoId(e.target.value)}
                  disabled={Boolean(ofertaEditar)}
                  className="w-full rounded-xl bg-[#070C16] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFB800]"
                >
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (${Number(p.precio).toLocaleString('es-AR')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#EF4444] mb-1">Precio Promocional ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={precioOferta}
                  onChange={(e) => setPrecioOferta(e.target.value)}
                  placeholder="Ej: 2499.00"
                  required
                  className="w-full rounded-xl bg-[#070C16] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">Fecha de Finalización (Vigencia)</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  required
                  className="w-full rounded-xl bg-[#070C16] border border-white/10 px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOferta(false)}
                  className="px-4 py-2 rounded-xl border border-white/15 text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  className="px-6 py-2 rounded-xl bg-[#EF4444] hover:bg-red-500 text-white font-extrabold shadow disabled:opacity-50"
                >
                  {cargando ? 'Guardando...' : ofertaEditar ? 'Guardar Cambios' : 'Activar Oferta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   4. PERFIL: DATOS DEL COMERCIO, WHATSAPP, HORARIO Y DIRECCIÓN
   ========================================================================= */
function PerfilTab({ comercio, onActualizar }) {
  const [form, setForm] = useState({
    nombre_local: comercio?.nombre_local || '',
    tipo_comercio: comercio?.tipo_comercio || 'Minorista',
    telefono: comercio?.telefono || '',
    whatsapp: comercio?.whatsapp || comercio?.telefono || '',
    horario_atencion: comercio?.horario_atencion || 'Lunes a Sábado de 08:00 a 13:00 y de 17:00 a 21:00 hs',
    direccion: comercio?.direccion || '',
    email: comercio?.email || ''
  });
  const [nuevasFotos, setNuevasFotos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [fotoModal, setFotoModal] = useState(null);
  const [eliminandoFotoId, setEliminandoFotoId] = useState(null);

  const handleEliminarFoto = async (fotoId) => {
    if (!confirm('¿Seguro que deseás eliminar esta foto del local?')) return;
    setEliminandoFotoId(fotoId);
    try {
      await api(`/comercios/fotos/${fotoId}`, { method: 'DELETE' });
      if (fotoModal?.id === fotoId) setFotoModal(null);
      setMensaje('Foto eliminada correctamente.');
      onActualizar();
    } catch (err) {
      alert(`Error al eliminar foto: ${err.message}`);
    } finally {
      setEliminandoFotoId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comercio?.id) return;
    setCargando(true);
    setMensaje('');

    try {
      if (nuevasFotos.length > 0) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        nuevasFotos.forEach((f) => fd.append('fotos', f));
        await api(`/comercios/${comercio.id}`, {
          method: 'PUT',
          body: fd
        });
      } else {
        await api(`/comercios/${comercio.id}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
      }
      setMensaje('Información comercial guardada exitosamente.');
      setNuevasFotos([]);
      onActualizar();
    } catch (err) {
      alert(`Error al actualizar: ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="mt-6 max-w-3xl bg-gris-oscuro border border-borde rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
      {/* Lightbox / Modal para visualizar foto ampliada */}
      {fotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setFotoModal(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-gris-oscuro border border-borde rounded-2xl p-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-borde mb-3">
              <h4 className="text-sm font-bold text-blanco">Fotografía del Local Comercial</h4>
              <button
                onClick={() => setFotoModal(null)}
                className="text-gris-azulado hover:text-blanco font-bold text-xs px-2 py-1 rounded"
              >
                Cerrar
              </button>
            </div>
            <div className="w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
              <img
                src={resolverUrlImagen(fotoModal.url)}
                alt="Foto ampliada"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
            <div className="mt-3 flex justify-between items-center text-xs">
              <span className="text-gris-azulado">SpotMarket Formosa</span>
              {fotoModal.id && (
                <button
                  type="button"
                  onClick={() => handleEliminarFoto(fotoModal.id)}
                  className="px-3 py-1.5 rounded-lg bg-rojo/20 text-rojo border border-rojo/30 hover:bg-rojo/30 font-semibold transition"
                >
                  Eliminar esta fotografía
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-bold text-base text-blanco">Canales de Contacto y Perfil Comercial</h3>
        <p className="text-xs text-gris-azulado mt-0.5">
          Los vecinos verán estos datos para ubicar tu negocio y enviarte mensajes.
        </p>
      </div>

      {mensaje && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-xl font-semibold">
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1">Nombre Comercial del Local</label>
          <input
            type="text"
            value={form.nombre_local}
            onChange={(e) => setForm({ ...form, nombre_local: e.target.value })}
            required
            className="w-full rounded-xl bg-negro/70 border border-borde px-3.5 py-2.5 text-blanco text-xs focus:outline-none focus:border-amarillo"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-amarillo mb-1">Tipo de Comercio</label>
            <select
              value={form.tipo_comercio}
              onChange={(e) => setForm({ ...form, tipo_comercio: e.target.value })}
              className="w-full rounded-xl bg-negro/70 border border-borde px-3.5 py-2.5 text-blanco text-xs font-medium focus:outline-none focus:border-amarillo"
            >
              {TIPOS_COMERCIO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="Minorista">Minorista</option>
              <option value="Mayorista">Mayorista</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1">Teléfono Directo</label>
            <input
              type="text"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="3704-XXXXXX"
              className="w-full rounded-xl bg-negro/70 border border-borde px-3.5 py-2.5 text-blanco text-xs focus:outline-none focus:border-amarillo"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-verde mb-1">
              WhatsApp Comercial (para pedidos y consultas)
            </label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="3704123456"
              className="w-full rounded-xl bg-negro/70 border border-borde px-3.5 py-2.5 text-blanco text-xs focus:outline-none focus:border-verde"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1">
              Horario de Atención al Público
            </label>
            <input
              type="text"
              value={form.horario_atencion}
              onChange={(e) => setForm({ ...form, horario_atencion: e.target.value })}
              placeholder="Ej: Lun a Sáb 8:00 - 13:00 / 17:00 - 21:00"
              className="w-full rounded-xl bg-negro/70 border border-borde px-3.5 py-2.5 text-blanco text-xs focus:outline-none focus:border-amarillo"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1">Dirección en Formosa Capital</label>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            required
            className="w-full rounded-xl bg-negro/70 border border-borde px-3.5 py-2.5 text-blanco text-xs focus:outline-none focus:border-amarillo"
          />
        </div>

        {/* ── FOTOGRAFÍAS DEL COMERCIO: VISUALIZAR, ELIMINAR Y AGREGAR NUEVAS ── */}
        <div className="pt-4 border-t border-borde space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase text-amarillo">
              Fotografías del Local Comercial ({comercio?.fotos?.length || 0})
            </label>
            <span className="text-[10px] text-gris-azulado">Hacé clic en cualquier foto para verla ampliada o eliminarla</span>
          </div>

          {comercio?.fotos && comercio.fotos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {comercio.fotos.map((f, idx) => (
                <div
                  key={f.id || idx}
                  onClick={() => setFotoModal(f)}
                  className="relative group rounded-xl overflow-hidden border border-borde bg-negro/60 aspect-square shadow hover:border-amarillo transition cursor-pointer"
                >
                  <img
                    src={resolverUrlImagen(f.url)}
                    alt={`Fachada ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-blanco text-[9px] px-2 py-0.5 rounded font-bold">
                    Foto #{idx + 1}
                  </span>
                  {f.id && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminarFoto(f.id);
                      }}
                      disabled={eliminandoFotoId === f.id}
                      className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-rojo text-blanco text-[10px] font-bold shadow hover:brightness-110 transition"
                      title="Eliminar foto"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gris-azulado italic bg-negro/40 p-3 rounded-xl border border-borde">
              Aún no tenés fotos de fachada registradas. Podés agregar fotos a continuación.
            </p>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase text-gris-azulado mb-1">
              Subir más fotos de fachada o local
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setNuevasFotos(Array.from(e.target.files || []))}
              className="w-full text-xs text-gris-azulado file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:fondo-dorado file:text-negro hover:file:brightness-110 cursor-pointer"
            />
            {nuevasFotos.length > 0 && (
              <p className="text-[10px] text-verde mt-1 font-semibold">
                {nuevasFotos.length} nueva(s) foto(s) lista(s) para subir al guardar.
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="fondo-dorado text-negro font-extrabold text-xs px-6 py-3 rounded-xl transition shadow-lg hover:brightness-110 disabled:opacity-50"
        >
          {cargando ? 'Guardando...' : 'Guardar Información Comercial'}
        </button>
      </form>
    </div>
  );
}
