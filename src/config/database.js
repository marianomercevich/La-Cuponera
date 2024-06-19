import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de las conexiones
const dbConfigApp = {
  host: process.env.HOST_APP_USER,
  database: process.env.DBNAME_APP_USER,
  user: process.env.APP_USER,
  password: process.env.APP_PASS,
  port: 3306
};

async function testAppConnection() {
  try {
    const connection = await mysql.createConnection(dbConfigApp);
    console.log('Conexión a la base de datos APP exitosa');
    await connection.end();
  } catch (error) {
    console.error('Error al conectar a la base de datos APP:', error.message);
  }
}

testAppConnection();



// Configura la conexión a la base de datos MySQL para la aplicación
const conexion_App = mysql.createPool({
  host: dbConfigApp.host,
  user: dbConfigApp.user,
  password: dbConfigApp.password,
  database: dbConfigApp.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});




export { conexion_App };