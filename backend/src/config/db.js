import fs from 'node:fs';
import path from 'node:path';
import { Sequelize } from 'sequelize';
import { env } from './env.js';

const opcionesComunes = {
  logging: env.SQL_LOG ? console.log : false,
  define: {
    underscored: true,
    timestamps: true
  }
};

let sequelize;

if (env.DB_DIALECT === 'sqlite') {
  const ruta = path.resolve(process.cwd(), env.DB_STORAGE);
  fs.mkdirSync(path.dirname(ruta), { recursive: true });

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ruta,
    ...opcionesComunes
  });
} else {
  sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: env.DB_DIALECT,
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
      message: `Conexión a la base de datos (${env.DB_DIALECT}) establecida correctamente.`
    };
  } catch (error) {
    return { ok: false, message: `Error de conexión a la base de datos: ${error.message}` };
  }
};
