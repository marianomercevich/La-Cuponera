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

const dbConfigDigital = {
  host: process.env.HOST_DIGITAL_USER,
  database: process.env.DBNAME_DIGITAL_USER,
  user: process.env.DIGITAL_USER,
  password: process.env.DIGITAL_PASS,
  port: 3306 // Puerto estándar de MySQL
};

async function testDigitalConnection() {
  try {
    const connection = await mysql.createConnection(dbConfigDigital);
    console.log('Conexión a la base de datos DIGITAL exitosa');
    await connection.end();
  } catch (error) {
    console.error('Error al conectar a la base de datos DIGITAL:', error.message);
  }
}

testDigitalConnection();

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

// Configura la conexión a la base de datos MySQL para la base digital
const conexion_Digital = mysql.createPool({
  host: dbConfigDigital.host,
  user: dbConfigDigital.user,
  password: dbConfigDigital.password,
  database: dbConfigDigital.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});



export { conexion_App, conexion_Digital };

