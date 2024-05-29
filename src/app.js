import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import  vendedorRoutes  from './routes/vendedoresRoutes.js';
import {MONGO_URI, MONGO_DB_NAME_PROD, MONGO_DB_NAME_TEST} from "./config/config.js"
import uploadRoutes from './routes/uploadRotes.js'; // Importa las rutas de carga de imágenes

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

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