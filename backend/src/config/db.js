// Configuración de la base de datos con Sequelize para SpotMarket.
// Por defecto conecta a MySQL (XAMPP phpMyAdmin en localhost:3306).
// Si el usuario configura DB_DIALECT=sqlite en .env, utiliza SQLite local.
import fs from 'node:fs';
import path from 'node:path';
import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import { env } from './env.js';

const opcionesComunes = {
  logging: env.NODE_ENV === 'development' ? false : false,
  define: {
    underscored: true,
    timestamps: true
  }
};

let sequelize;

if (env.DB_DIALECT === 'sqlite') {
  const rutaDb = path.resolve(process.cwd(), env.DB_STORAGE);
  fs.mkdirSync(path.dirname(rutaDb), { recursive: true });
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: rutaDb,
    ...opcionesComunes
  });
} else {
  // MySQL (XAMPP / phpMyAdmin)
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

// Asegura la existencia de la base de datos en MySQL antes de conectar Sequelize
const asegurarBaseDeDatosMySQL = async () => {
  try {
    const conexion = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASS
    });
    await conexion.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await conexion.end();
    console.log(`[MYSQL] Base de datos '${env.DB_NAME}' verificada en phpMyAdmin / XAMPP.`);
  } catch (err) {
    console.warn(`[MYSQL AVISO] No se pudo verificar la creación automática: ${err.message}`);
  }
};

export const testConnection = async () => {
  if (env.DB_DIALECT === 'mysql') {
    await asegurarBaseDeDatosMySQL();
  }

  try {
    await sequelize.authenticate();
    return {
      ok: true,
      message: `Conexión a la base de datos (${sequelize.getDialect()} - ${env.DB_NAME}) establecida correctamente.`
    };
  } catch (error) {
    if (env.DB_DIALECT === 'mysql') {
      console.error(`\n[ERROR MYSQL] No se pudo conectar a MySQL en ${env.DB_HOST}:${env.DB_PORT}.`);
      console.error(`- Si usás XAMPP, abrí el 'XAMPP Control Panel' y hacé click en 'Start' en el módulo MySQL.`);
      console.error(`- Verificá que en tu archivo .env los datos coincidan (usuario: ${env.DB_USER}, base: ${env.DB_NAME}).\n`);
    }
    return {
      ok: false,
      message: error.message
    };
  }
};
