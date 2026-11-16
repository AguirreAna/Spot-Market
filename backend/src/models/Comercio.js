// Modelo Comercio: perfil público del local de un comerciante.
// Guarda tipo de comercio ('minorista', 'mayorista') y categoría de productos.
// Guarda ubicación (lat/lng) para el mapa interactivo y cálculo de cercanía.
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Comercio = sequelize.define(
  'Comercio',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    nombre_local: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    tipo_comercio: {
      // 'minorista' | 'mayorista'
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: 'minorista'
    },
    categoria_productos: {
      // Categorías de productos que comercializa en orden alfabético
      type: DataTypes.TEXT,
      allowNull: true
    },
    tipos_productos: {
      // Alias de compatibilidad
      type: DataTypes.TEXT,
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(160),
      allowNull: true,
      validate: { isEmail: true }
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    latitud: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    longitud: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    usuarioId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true
    }
  },
  {
    tableName: 'comercios',
    timestamps: true
  }
);
