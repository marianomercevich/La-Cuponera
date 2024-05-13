import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Importa las rutas de tu API
import userRoutes from './src/routes/cuponsRoutes.js';
import { MONGO_URI, MONGO_DB_NAME_PROD, MONGO_DB_NAME_TEST } from './src/config/config.js';

// Configuración de Express
const app = express();
const PORT = process.env.PORT || 5100;

const swaggerDocument = YAML.load('./src/doc/Cupones.yaml'); // Ruta a tu archivo de especificación Swagger

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Conexión a MongoDB 
mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME_PROD}`)
  .then(() => console.log('Conexión a MongoDB establecida'))
  .catch(err => console.error('Error al conectar con MongoDB:', err));

// Rutas de la API
app.use('/api/cupones', userRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Puedes agregar aquí más rutas si es necesario

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
