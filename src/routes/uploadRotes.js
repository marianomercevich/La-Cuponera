import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configuración de Multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directorio donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    // Genera un nombre único para cada imagen cargada
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Ruta para cargar una imagen
router.post('/', upload.single('imagen'), (req, res) => {
  // La imagen se ha cargado con éxito
  // Guarda la ruta de la imagen en la base de datos
  const imagePath = req.file.path;
  // Guarda `imagePath` en tu base de datos
  // Respondemos con la ruta de la imagen para que el cliente pueda mostrarla
  res.send(imagePath);
});

export default router;