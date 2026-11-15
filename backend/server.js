import { app } from './app.js';
import { env } from './src/config/env.js';
import { sequelize, testConnection } from './src/config/db.js';
import './src/models/index.js';

const iniciarServidor = async () => {
  const resultado = await testConnection();
  console.log(resultado.message);

  if (!resultado.ok) {
    console.error('No se pudo conectar a la base de datos. Verifica el archivo .env');
    process.exit(1);
  }

  try {
    const alterar = env.DB_DIALECT !== 'sqlite' && env.NODE_ENV === 'development';
    await sequelize.sync({ alter: alterar });
    console.log('Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('Error al sincronizar los modelos:', error.message);
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(`=======================================================`);
    console.log(`  Spot Market Backend API corriendo en puerto ${env.PORT}`);
    console.log(`  Endpoints base: http://localhost:${env.PORT}/api`);
    console.log(`  Salud: http://localhost:${env.PORT}/api/salud`);
    console.log(`=======================================================`);
  });
};

iniciarServidor();
