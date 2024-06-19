import express from 'express';
import multer from 'multer';
import mysql from 'mysql2/promise';

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
// Configuración de la conexión a la base de datos MySQL
const pool = mysql.createPool({
  host: process.env.HOST_APP_USER,
  database: process.env.DBNAME_APP_USER,
  user: process.env.APP_USER,
  password: process.env.APP_PASS,
  port: 3306
});


// Ruta para cargar una portada
router.post('/portadas/:id', upload.single('imagen'), async (req, res) => {
  try {
    const id_vendedor = req.params.id;
    const imagen = req.file.buffer; // Contenido de la imagen como buffer
    const nombre = req.file.originalname;
    const descripcion = req.body.descripcion || '';

    const connection = await pool.getConnection();

    const query = 'INSERT INTO Portada (nombre, imagen, descripcion, id_vendedor) VALUES (?, ?, ?, ?)';
    const [result] = await connection.execute(query, [nombre, imagen, descripcion, id_vendedor]);

    connection.release();

    res.status(200).json({ id_vendedor, nombre, descripcion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al guardar la portada en la base de datos.' });
  }
});

// Ruta para editar una portada
router.put('/portadas/:id', upload.single('imagen'), async (req, res) => {
  try {
    const id_vendedor = req.params.id;
    const imagen = req.file.buffer; // Contenido de la imagen como buffer
    const nombre = req.file.originalname;
    const descripcion = req.body.descripcion || '';
    
    const connection = await pool.getConnection();

    const query = 'UPDATE Portada SET nombre = ?, imagen = ?, descripcion = ?, id_vendedor = ? WHERE id = ?';
    const [result] = await connection.execute(query, [nombre, descripcion, id_vendedor]);

    connection.release();

    res.status(200).json({ id, nombre, descripcion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar la Portada en la base de datos.' });
  }
});


// Ruta para obtener un portada por ID (GET)
router.get('/portadas/:id', async (req, res) => {
  try {
    const id_vendedor = req.params.id;

    const connection = await pool.getConnection();

    const query = 'SELECT id, nombre, descripcion, id_vendedor FROM Portada WHERE id_vendedor = ?';
    const [results] = await connection.execute(query, [id_vendedor]);

    connection.release();

    if (results.length === 0) {
      return res.status(404).json({ error: 'Portada no encontrada.' });
    }

    const portada = results[0];
    res.status(200).json(portada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener la portada desde la base de datos.' });
  }
});

// Ruta para eliminar un Portada por ID (DELETE)
router.delete('/portadas/:id', async (req, res) => {
  try {
    const id_vendedor = req.params.id;

    const connection = await pool.getConnection();

    const query = 'DELETE FROM Portada WHERE id_vendedor = ?';
    const [result] = await connection.execute(query, [id_vendedor]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'portada no encontrada para eliminar.' });
    }

    res.status(200).json({ message: 'portada eliminada correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al eliminar la portada desde la base de datos.' });
  }
});


export default router;