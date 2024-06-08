import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import vendedorRoutes from './src/routes/vendedoresRoutes.js';
import uploadRoutes from './src/routes/uploadRotes.js';
import { MONGO_URI, MONGO_DB_NAME_PROD, MONGO_DB_NAME_TEST } from './src/config/config.js';
import fs from 'fs';
import mysql from 'mysql';

// Configuración de Express
const app = express();
const PORT = process.env.PORT || 5000;

// Cargar el archivo JSON de Swagger
const swaggerDocument = JSON.parse(fs.readFileSync('./src/doc/Vendedores.json', 'utf8'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static('public'));

// Conexión a MySQL
const conexion_App = mysql.createConnection({
  host: 'srv451.hstgr.io',
  database: 'u244509176_LaCuponeraApp',
  user: 'u244509176_LaCuponeraApp',
  password: 'LaCuponeraApp01',
});

const conexion_Digital = mysql.createConnection({
  host: 'srv451.hstgr.io',
  database: 'u244509176_AlE3i',
  user: 'u244509176_GGEuw',
  password: 'LaCuponeraDigital01',
});

conexion_App.connect(function(error) {
  if (error) {
    throw error;
  } else {
    console.log('CONEXIÓN A MYSQL_APP EXITOSA');
  }
});
conexion_App.end();

conexion_Digital.connect(function(error) {
  if (error) {
    throw error;
  } else {
    console.log('CONEXIÓN A MYSQL_DIGITAL EXITOSA');
  }
});
conexion_Digital.end();

// Conexión a MongoDB
mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME_PROD}`)
  .then(() => console.log('Conexión a MongoDB establecida'))
  .catch(err => console.error('Error al conectar con MongoDB:', err));

// Rutas de la API
app.use('/api/vendedores', vendedorRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/upload', uploadRoutes);

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  const error = new Error('Ruta no encontrada app');
  error.status = 404;
  next(error);
});

// Manejo de errores
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en el puerto ${PORT}`);
});
