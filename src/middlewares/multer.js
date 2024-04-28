import multer from 'multer';
import path from 'path';

// Configura el almacenamiento de archivos con Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img');
  },
  filename: function (req, file, cb) {
    // Genera un nombre de archivo único para evitar colisiones
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Crea el middleware Multer
const upload = multer({ storage: storage });

export default upload;
