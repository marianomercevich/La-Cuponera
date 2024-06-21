import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import vendedorRoutes from './src/routes/vendedoresRoutes.js';
import uploadPortadaRoutes from './src/routes/uploadPortadaRoutes.js'
import uploadLogoRoutes from './src/routes/uploadLogoRoutes.js';
import { MONGO_URI, MONGO_DB_NAME_PROD, MONGO_DB_NAME_TEST } from './src/config/config.js';

import { conexion_App  } from './src/config/database.js';


// Configuración de Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));



// Conexión a MongoDB
mongoose.connect(`${MONGO_URI}${MONGO_DB_NAME_PROD}`)
  .then(() => console.log('Conexión a MongoDB establecida'))
  .catch(err => console.error('Error al conectar con MongoDB:', err));

// Rutas de la API
app.use('/api/vendedores', vendedorRoutes);
app.use('/api/upload', uploadLogoRoutes, uploadPortadaRoutes );




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
