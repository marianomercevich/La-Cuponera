const mysql = require('mysql2/promise');

// Configura la conexión a la base de datos MySQL
const db = mysql.createPool({
  host: 'sql11.freesqldatabase.com',
  user: 'sql11692986',
  password: 'PPDFIrba22',
  database: 'sql11692986'
});

module.exports = db;