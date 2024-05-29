import express from 'express';
import multer from 'multer';
import path from 'path';

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

// Filtro para validar el tipo de archivo
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const mimeType = fileTypes.test(file.mimetype);
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // Limite de tamaño del archivo a 5MB
});

// Ruta para cargar una imagen
router.post('/', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen o el formato no es permitido.' });
  }

  // La imagen se ha cargado con éxito
  const imagePath = req.file.path;
  // Guarda `imagePath` en tu base de datos
  // Respondemos con la ruta de la imagen para que el cliente pueda mostrarla
  res.status(200).json({ imagePath: imagePath });
});

// Manejo de errores de Multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

export default router;
