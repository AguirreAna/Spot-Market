import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Productor = sequelize.define(
  'Productor',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    nombre_local: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    telefono: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ubicacion: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    latitud: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    longitud: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    categoria: {
      type: DataTypes.ENUM('mayorista', 'minorista', 'ambos'),
      allowNull: false,
      defaultValue: 'minorista'
    },
    tipos_productos: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    fotos: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    suscripcion: {
      type: DataTypes.ENUM('premium', 'estandar'),
      allowNull: false,
      defaultValue: 'estandar'
    }
  },
  {
    tableName: 'productores',
    paranoid: true
  }
);
