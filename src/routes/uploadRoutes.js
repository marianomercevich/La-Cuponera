import express from 'express';
import multer from 'multer';
import mysql from 'mysql2/promise';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo inválido, solo se permiten imágenes!'), false);
    }
  }
});

const pool = mysql.createPool({
  host: process.env.HOST_APP_USER,
  database: process.env.DBNAME_APP_USER,
  user: process.env.APP_USER,
  password: process.env.APP_PASS,
  port: 3306
});

// Ruta para cargar una imagen de portada
router.post('/:id/portada', upload.single('imagen'), async (req, res) => {
  try {
    const vendedorId = req.params.id;
    const imagen = req.file.buffer; // Contenido de la imagen como buffer
    const nombre = req.file.originalname;
    const descripcion = req.body.descripcion || '';

    const connection = await pool.getConnection();

    const query = 'INSERT INTO Portada (nombre, imagen, descripcion) VALUES (?, ?, ?)';
    const [result] = await connection.execute(query, [nombre, imagen, descripcion]);

    connection.release();

    res.status(200).json({ id: result.insertId, nombre, descripcion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al guardar la imagen en la base de datos.' });
  }
});

// Ruta para cargar un logo
router.post('/:id/logo', upload.single('imagen'), async (req, res) => {
  try {
    const vendedorId = req.params.id;
    const imagen = req.file.buffer; // Contenido de la imagen como buffer
    const nombre = req.file.originalname;
    const descripcion = req.body.descripcion || '';

    const connection = await pool.getConnection();

    const query = 'INSERT INTO Logo (nombre, imagen, descripcion) VALUES (?, ?, ?)';
    const [result] = await connection.execute(query, [nombre, imagen, descripcion]);

    connection.release();

    res.status(200).json({ id: result.insertId, nombre, descripcion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al guardar la imagen en la base de datos.' });
  }
});

export default router;