const mysql = require('mysql2');

// Configura la conexión a la base de datos MySQL
const db = mysql.createConnection( {
  host: 'roundhouse.proxy.rlwy.net',
  port: 19806,
  user: 'root',
  password: '5f315BaG6B5bFA-GDAdDDgF1be2cehCd',
  database: 'railway',
  });

  db.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
    } else {
      console.log('Conexión a la base de datos exitosa');
    }
  });

module.exports = db;
