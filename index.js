import express from 'express';
import mongoose from 'mongoose';
/* import bodyParser from 'body-parser'; */
import cors from 'cors';
/* import swaggerUi from 'swagger-ui-express'; */
import vendedorRoutes from './src/routes/vendedoresRoutes.js';
import uploadPortadaRoutes from './src/routes/uploadPortadaRoutes.js'
import uploadLogoRoutes from './src/routes/uploadLogoRoutes.js';
import { MONGO_URI, MONGO_DB_NAME_PROD, MONGO_DB_NAME_TEST } from './src/config/config.js';
/* import fs from 'fs'; */
import { conexion_App  } from './src/config/database.js';


// Configuración de Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
/* app.use(bodyParser.json()); */
app.use(cors());
app.use(express.json());
/* app.use(express.urlencoded({ extended: true })); */
app.use('/public', express.static('public'));



// Conexión a MongoDB
mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME_PROD}`)
  .then(() => console.log('Conexión a MongoDB establecida'))
  .catch(err => console.error('Error al conectar con MongoDB:', err));

/*   const swaggerDocumentPath = 'src/doc/Vendedores.json';
  let swaggerDocument;
  try {
    console.log('Intentando leer el archivo JSON de Swagger...');
    const rawData = fs.readFileSync(swaggerDocumentPath);
    swaggerDocument = JSON.parse(rawData);
    console.log('Archivo JSON de Swagger cargado correctamente:', swaggerDocument);
  } catch (error) {
    console.error('Error al cargar el archivo JSON de Swagger:', error);
  } */

// Rutas de la API
app.use('/api/vendedores', vendedorRoutes);
app.use('/api/upload', uploadLogoRoutes, uploadPortadaRoutes );


/* // Usar Swagger UI
if (swaggerDocument) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
  console.error('No se pudo cargar el archivo JSON de Swagger.');
} */

// Mensaje de confirmación de conexión
conexion_App.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectar con la base de datos de la aplicación:', err.message);
  } else {
    console.log('Conexión establecida con la base de datos de la aplicación');
    connection.release();
  } 
});


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
