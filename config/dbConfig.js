const mysql = require('mysql2');

// Configura la conexión a la base de datos MySQL
const db = mysql.createConnection( {
  host: 'sql3.freesqldatabase.com',
  port: 3306,
  user: 'sql3688522',
  password: 'fPU6yVaTIH',
  database: 'sql3688522',
  });

  db.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
    } else {
      console.log('Conexión a la base de datos exitosa');
    }
  });

module.exports = db;
