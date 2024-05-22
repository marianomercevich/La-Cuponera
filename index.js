import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';


// Importa las rutas de tu API
import cuponesRoutes from './src/routes/cuponsRoutes.js';
import { MONGO_URI, MONGO_DB_NAME_PROD, MONGO_DB_NAME_TEST } from './src/config/config.js';

// Configuración de Express
const app = express();
const PORT = process.env.PORT || 5100;



// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Conexión a MongoDB 
mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME_PROD}`)
  .then(() => console.log('Conexión a MongoDB establecida'))
  .catch(err => console.error('Error al conectar con MongoDB:', err));

// Rutas de la API
app.use('/api/cupones', cuponesRoutes);

const swaggerDocumentPath = './src/doc/cupones.json';
let swaggerDocument;
try {
  console.log('Intentando leer el archivo JSON de Swagger...');
  const rawData = fs.readFileSync(swaggerDocumentPath);
  swaggerDocument = JSON.parse(rawData);
  console.log('Archivo JSON de Swagger cargado correctamente:', swaggerDocument);
} catch (error) {
  console.error('Error al cargar el archivo JSON de Swagger:', error);
}


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
