import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
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


// Middleware
app.use(bodyParser.json());
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

  const swaggerDocumentPath = 'src/doc/Vendedores.json';
  let swaggerDocument;
  try {
    console.log('Intentando leer el archivo JSON de Swagger...');
    const rawData = fs.readFileSync(swaggerDocumentPath);
    swaggerDocument = JSON.parse(rawData);
    console.log('Archivo JSON de Swagger cargado correctamente:', swaggerDocument);
  } catch (error) {
    console.error('Error al cargar el archivo JSON de Swagger:', error);
  }

// Rutas de la API
app.use('/api/vendedores', vendedorRoutes);
app.use('/upload', uploadRoutes);
// Usar Swagger UI
if (swaggerDocument) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.error('No se pudo cargar el archivo JSON de Swagger.');
}

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
