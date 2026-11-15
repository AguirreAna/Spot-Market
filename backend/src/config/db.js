// Configuración de la conexión a la base de datos con Sequelize.
// Soporta tanto MySQL (requerido para producción / cursada) como SQLite (desarrollo rápido / fallback).
import fs from 'node:fs';
import path from 'node:path';
import { Sequelize } from 'sequelize';
import { env } from './env.js';

const opcionesComunes = {
  logging: env.NODE_ENV === 'development' ? console.log : false,
  define: {
    underscored: true,
    timestamps: true
  }
};

let sequelize;

// Inicialización según el dialecto configurado
if (env.DB_DIALECT === 'sqlite') {
  const rutaDb = path.resolve(process.cwd(), env.DB_STORAGE);
  fs.mkdirSync(path.dirname(rutaDb), { recursive: true });

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: rutaDb,
    ...opcionesComunes
  });
} else {
  sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    ...opcionesComunes
  });
}

export { sequelize };

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    return {
      ok: true,
      message: `Conexión a la base de datos (${sequelize.getDialect()}) establecida correctamente.`
    };
  } catch (error) {
    // Si falla MySQL y estamos en desarrollo, conmutar transparentemente a SQLite para evitar caídas
    if (env.DB_DIALECT !== 'sqlite' && env.NODE_ENV === 'development') {
      console.warn(`[DB WARNING] No se pudo conectar a MySQL (${error.message}). Conmutando automáticamente a SQLite para desarrollo...`);
      const rutaDb = path.resolve(process.cwd(), './data/spotmarket.sqlite');
      fs.mkdirSync(path.dirname(rutaDb), { recursive: true });
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: rutaDb,
        ...opcionesComunes
      });
      await sequelize.authenticate();
      return {
        ok: true,
        message: 'Conexión fallback a SQLite establecida correctamente.'
      };
    }
    return { ok: false, message: `Error de conexión a la base de datos: ${error.message}` };
  }
};
