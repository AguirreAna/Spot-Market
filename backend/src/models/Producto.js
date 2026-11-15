// Modelo Producto: publicado por un Comercio local de Formosa Capital.
// No maneja stock ni negociación de precios (SpotMarket es informativo, no e-commerce transaccional).
// Soporta precio regular, precio de oferta, cuotas, categoría e imagen.
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Producto = sequelize.define(
  'Producto',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(160),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    especificaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    precio_oferta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    tipo_precio: {
      type: DataTypes.ENUM('diario', 'mensual'),
      allowNull: false,
      defaultValue: 'diario'
    },
    cuotas: {
      // Información de financiación, ej: "12 cuotas de $3.833" o "3 cuotas sin interés"
      type: DataTypes.STRING(80),
      allowNull: true
    },
    destacado: {
      // Para la sección "Productos destacados" (más solicitados y vendidos)
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    likes: {
      // Contador de interés comunitario
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    imagen_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    imagen_public_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    vistas: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    categoria: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    comercioId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  },
  {
    tableName: 'productos',
    timestamps: true
  }
);
