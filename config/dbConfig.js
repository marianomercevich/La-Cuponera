const mysql = require('mysql2/promise');

// Configura la conexión a la base de datos MySQL
const db = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'hash'
});

module.exports = db;