// Catálogo de Productos y Tiendas de SpotMarket Formosa Capital
// Con panel lateral de filtros (Tipo de Comercio y Rubros) y tarjetas horizontales.
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { productosCatalogo } from '../data/Catalogo.js';
import { datosTienda } from '../data/tiendas.js';
import PanelFiltros from '../components/PanelFiltros.jsx';
import TarjetaResultado from '../components/TarjetaResultado.jsx';

const NOMBRES_TIPO = {
  Cadena: 'Cadenas y supermercados',
  Feria: 'Ferias y mercados',
  Kiosco: 'Kioscos 24 hs',
  Mayorista: 'Mayoristas',
  Pyme: 'Pymes y comercios de barrio'
};

const TIPOS_MAP_REVERSO = {
  'Cadenas y supermercados': 'Cadena',
  'Ferias y mercados': 'Feria',
  'Kioscos 24 hs': 'Kiosco',
  'Mayoristas': 'Mayorista',
  'Pymes y comercios de barrio': 'Pyme'
};

const LISTA_RUBROS_BASE = [
  'Almacén',
  'Deportes',
  'Electrónica',
  'Farmacia',
  'Feria y mercado',
  'Ferretería',
  'Hogar y decoración',
  'Kiosco',
  'Librería',
  'Mascotas',
  'Mayorista',
  'Panadería',
  'Supermercado',
  'Tienda general',
  'Verdulería y frutería'
];

export default function Productos() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategoria = searchParams.get('categoria') || '';
  const urlBuscar = searchParams.get('buscar') || searchParams.get('q') || '';
  const urlGrupo = searchParams.get('grupo') || '';
  const urlSub = searchParams.get('sub') || '';

  const [textoBusqueda, setTextoBusqueda] = useState(urlBuscar);
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [rubrosSeleccionados, setRubrosSeleccionados] = useState([]);
  const [orden, setOrden] = useState('menor');

  // Cargar productos del backend si están disponibles
  const { data: dataBackend, cargando } = useFetch('/productos', []);
  const prodsBackend = dataBackend?.productos || [];

  // Fuente de datos combinada: si hay productos en la BD se integran, y se combinan con el catálogo base
  const todosLosProductos = useMemo(() => {
    if (prodsBackend.length > 0) {
      // Normalizar productos de la BD para que tengan la estructura esperada
      const adaptados = prodsBackend.map((p) => {
        const tiendaInfo = datosTienda(p.comercio?.nombre_local || '');
        return {
          id: p.id,
          nombre: p.nombre,
          precio: Number(p.precio_oferta || p.precio),
          precio_anterior: p.precio_oferta ? Number(p.precio) : null,
          en_oferta: Boolean(p.precio_oferta),
          imagen_url: p.imagen_url,
          distancia: p.distancia || '1,2 km',
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          comercio: p.comercio,
          tienda: { nombre: p.comercio?.nombre_local || 'Comercio local' },
          categorias: [{ nombre: p.categoria || 'General' }],
          categoria: p.categoria || 'General',
          rubro: tiendaInfo.rubro || p.categoria || 'Tienda general',
          tipo: tiendaInfo.tipo || 'Pyme',
          cuotas: p.cuotas
        };
      });
      return [...adaptados, ...productosCatalogo];
    }
    return productosCatalogo;
  }, [prodsBackend]);

  // Sincronizar filtros cuando cambie la URL (?categoria=... o ?buscar=...)
  useEffect(() => {
    const cat = searchParams.get('categoria') || '';
    const bus = searchParams.get('buscar') || searchParams.get('q') || '';
    setTextoBusqueda(bus);

    if (cat && cat !== 'Todas') {
      // Si la categoría de la URL coincide con un rubro conocido, seleccionarlo
      const coincidencia = LISTA_RUBROS_BASE.find(
        (r) => r.toLowerCase() === cat.toLowerCase()
      );
      if (coincidencia) {
        setRubrosSeleccionados([coincidencia]);
      } else if (cat.toLowerCase() === 'otros') {
        // En la referencia, /catalogo?categoria=Otros muestra Electrónica, Supermercado, Tienda general
        setRubrosSeleccionados(['Electrónica', 'Supermercado', 'Tienda general']);
        setTiposSeleccionados(['Pymes y comercios de barrio']);
      }
    }
  }, [searchParams]);

  // 1) Base de productos según búsqueda y categoría en URL
  const base = useMemo(() => {
    return todosLosProductos.filter((p) => {
      const catNombre = p.categoria || p.categorias?.[0]?.nombre || '';
      const coincideCat = !urlCategoria || urlCategoria === 'Todas' || catNombre.toLowerCase() === urlCategoria.toLowerCase();
      const coincideGrupo = !urlGrupo || p.grupo === urlGrupo;
      const coincideSub = !urlSub || p.subcategoria === urlSub;

      const texto = `${p.nombre} ${p.marca || ''} ${p.tienda?.nombre || p.comercio?.nombre_local || ''}`.toLowerCase();
      const coincideBusqueda = !textoBusqueda.trim() || texto.includes(textoBusqueda.trim().toLowerCase());

      return coincideCat && coincideGrupo && coincideSub && coincideBusqueda;
    });
  }, [todosLosProductos, urlCategoria, urlGrupo, urlSub, textoBusqueda]);

  // Contadores para Tipo de Comercio
  const tiposOpciones = useMemo(() => {
    const conteo = {
      'Cadenas y supermercados': 0,
      'Ferias y mercados': 0,
      'Kioscos 24 hs': 0,
      'Mayoristas': 0,
      'Pymes y comercios de barrio': 0
    };

    base.forEach((p) => {
      const tienda = datosTienda(p.tienda?.nombre || p.comercio?.nombre_local || '');
      const tipoReal = p.tipo || tienda.tipo;
      const label = NOMBRES_TIPO[tipoReal] || 'Pymes y comercios de barrio';
      if (conteo[label] !== undefined) {
        conteo[label] += 1;
      }
    });

    return Object.entries(conteo).map(([etiqueta, cantidad]) => ({
      nombre: etiqueta,
      etiqueta,
      cantidad
    }));
  }, [base]);

  // Contadores para Rubro
  const rubrosOpciones = useMemo(() => {
    const conteo = {};
    LISTA_RUBROS_BASE.forEach((r) => {
      conteo[r] = 0;
    });

    base.forEach((p) => {
      const tienda = datosTienda(p.tienda?.nombre || p.comercio?.nombre_local || '');
      const rubro = p.rubro || tienda.rubro || p.categoria;
      if (conteo[rubro] !== undefined) {
        conteo[rubro] += 1;
      } else if (rubro) {
        conteo[rubro] = (conteo[rubro] || 0) + 1;
      }
    });

    return Object.entries(conteo)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [base]);

  // Filtrado final aplicando checkboxes de tipos y rubros
  const filtrados = useMemo(() => {
    return base.filter((p) => {
      const tienda = datosTienda(p.tienda?.nombre || p.comercio?.nombre_local || '');
      const tipoReal = p.tipo || tienda.tipo;
      const tipoLabel = NOMBRES_TIPO[tipoReal] || 'Pymes y comercios de barrio';
      const rubroReal = p.rubro || tienda.rubro || p.categoria;

      const coincideTipo =
        tiposSeleccionados.length === 0 || tiposSeleccionados.includes(tipoLabel);
      const coincideRubro =
        rubrosSeleccionados.length === 0 || rubrosSeleccionados.includes(rubroReal);

      return coincideTipo && coincideRubro;
    });
  }, [base, tiposSeleccionados, rubrosSeleccionados]);

  // Ordenamiento
  const resultados = useMemo(() => {
    const copia = [...filtrados];
    if (orden === 'menor') {
      copia.sort((a, b) => (a.precio_oferta || a.precio) - (b.precio_oferta || b.precio));
    } else if (orden === 'mayor') {
      copia.sort((a, b) => (b.precio_oferta || b.precio) - (a.precio_oferta || a.precio));
    } else if (orden === 'nuevos') {
      copia.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return copia;
  }, [filtrados, orden]);

  // Toggles de filtros
  const alternarTipo = (tipo) => {
    setTiposSeleccionados((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  const alternarRubro = (rubro) => {
    setRubrosSeleccionados((prev) =>
      prev.includes(rubro) ? prev.filter((r) => r !== rubro) : [...prev, rubro]
    );
  };

  const limpiarFiltros = () => {
    setTiposSeleccionados([]);
    setRubrosSeleccionados([]);
    setTextoBusqueda('');
    setSearchParams({});
  };

  const hayFiltrosActivos =
    tiposSeleccionados.length > 0 ||
    rubrosSeleccionados.length > 0 ||
    Boolean(urlCategoria) ||
    Boolean(textoBusqueda);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Encabezado y barra de control de orden */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-borde">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blanco">
            {urlCategoria && urlCategoria !== 'Todas' ? `Catálogo: ${urlCategoria}` : 'Catálogo General de Productos'}
          </h1>
          <p className="text-xs text-gris-azulado mt-1">
            {resultados.length} {resultados.length === 1 ? 'producto encontrado' : 'productos encontrados'} en comercios de Formosa Capital.
          </p>
        </div>

        {/* Selector de ordenamiento */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <label className="text-xs text-gris-azulado font-semibold hidden sm:inline">Ordenar por:</label>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="rounded-lg bg-gris-oscuro border border-borde px-3 py-1.5 text-xs text-blanco focus:outline-none focus:border-amarillo cursor-pointer"
          >
            <option value="menor">Menor precio</option>
            <option value="mayor">Mayor precio</option>
            <option value="nuevos">Más recientes</option>
          </select>
        </div>
      </div>

      {/* CUERPO PRINCIPAL: SIDEBAR DE FILTROS + LISTA DE PRODUCTOS */}
      <div className="mt-8 flex flex-col md:flex-row items-start gap-8">
        {/* COLUMNA IZQUIERDA: PANEL DE FILTROS */}
        <PanelFiltros
          tiposOpciones={tiposOpciones}
          tiposSeleccionados={tiposSeleccionados}
          alCambiarTipo={alternarTipo}
          rubrosOpciones={rubrosOpciones}
          rubrosSeleccionados={rubrosSeleccionados}
          alCambiarRubro={alternarRubro}
          alLimpiarFiltros={limpiarFiltros}
          hayFiltrosActivos={hayFiltrosActivos}
        />

        {/* COLUMNA DERECHA: RESULTADOS HORIZONTALES */}
        <div className="flex-1 w-full space-y-3">
          {cargando && prodsBackend.length === 0 && (
            <p className="text-center text-xs text-gris-azulado py-10">Cargando catálogo...</p>
          )}

          {resultados.map((p) => (
            <TarjetaResultado key={p.id} producto={p} />
          ))}

          {resultados.length === 0 && !cargando && (
            <div className="rounded-xl border border-borde bg-gris-oscuro p-10 text-center">
              <h3 className="text-base font-bold text-blanco">No se encontraron productos</h3>
              <p className="text-xs text-gris-azulado mt-1">
                No hay coincidencias con los tipos de comercio o rubros seleccionados.
              </p>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-4 px-4 py-2 rounded-lg fondo-dorado text-negro text-xs font-bold shadow hover:brightness-110 cursor-pointer"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
