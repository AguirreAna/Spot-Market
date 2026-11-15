import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Calificacion = sequelize.define(
  'Calificacion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'compradores',
        key: 'id'
      }
    },
    productor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'productores',
        key: 'id'
      }
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'productos',
        key: 'id'
      }
    },
    puntaje: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comentario: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'calificaciones',
    paranoid: true,
    validate: {
      unSoloDestino() {
        const destinos = [this.productor_id, this.producto_id].filter((v) => v !== null && v !== undefined);
        if (destinos.length !== 1) {
          throw new Error('La calificación debe apuntar a un comercio o a un producto (solo uno).');
        }
      }
    }
  }
);
