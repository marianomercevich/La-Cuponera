const mysql = require('mysql2/promise');

// Configura la conexión a la base de datos MySQL
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cuponera'
});

module.exports = db;