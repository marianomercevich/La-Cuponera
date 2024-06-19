import express from 'express';
import multer from 'multer';
import {
  consultarCupon,
  insertarCupon,
  actualizarCupon,
  eliminarCupon,
  consultarCuponPorId
} from '../controllers/assetsController';

const router = express.Router();

// Configuración de multer para almacenar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB para el archivo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Aceptar solo archivos de imagen
    } else {
      cb(new Error('Tipo de archivo inválido, solo se permiten imágenes!'), false);
    }
  }
});

// Rutas CRUD
router.get('/', consultarCupon);
router.get('/:id', consultarCuponPorId);
router.post('/', upload.single('imagen'), insertarCupon);
router.put('/:id', upload.single('imagen'), actualizarCupon);
router.delete('/:id', eliminarCupon);

export default router;

