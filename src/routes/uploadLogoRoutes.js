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



// Ruta para actualizar un logo (PUT)
router.post('/logos/:id', upload.single('imagen'), async (req, res) => {
  try {
    const id_vendedor = req.params.id;
    const imagen = req.file.buffer; // Contenido de la imagen como buffer
    const nombre = req.file.originalname;
    const descripcion = req.body.descripcion || '';
    
    const connection = await pool.getConnection();

    const query = 'INSERT INTO Logo (nombre, imagen, descripcion, id_vendedor) VALUES (?, ?, ?, ?)';
    const [result] = await connection.execute(query, [nombre, imagen, descripcion, id_vendedor]);


    connection.release();

    res.status(200).json({ id_vendedor, nombre, descripcion, imagen });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al guardar el logo en la base de datos.' });
  }
});

// Ruta para actualizar un logo (PUT)
router.put('/logos/:id', upload.single('imagen'), async (req, res) => {
  try {
    const id_vendedor = req.params.id;
    const imagen = req.file.buffer; // Contenido de la imagen como buffer
    const nombre = req.file.originalname;
    const descripcion = req.body.descripcion || '';
    
    const connection = await pool.getConnection();

    const query = 'UPDATE Logo SET nombre = ?, imagen = ?, descripcion = ?, id_vendedor = ? WHERE id = ?';
    const [result] = await connection.execute(query, [nombre, descripcion, id_vendedor, imagen]);

    connection.release();

    res.status(200).json({ id, nombre, descripcion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar el logo en la base de datos.' });
  }
});


// Ruta para obtener un logo por ID (GET)
router.get('/logos/:id', async (req, res) => {
  const id_vendedor = req.params.id;
  
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query('SELECT imagen FROM Logo WHERE id_vendedor = ?', [id_vendedor]);
    
    if (rows.length > 0) {
      // Devolvemos la imagen como un Buffer
      res.set('Content-Type', 'image/jpeg'); // Ajusta el tipo MIME según el tipo de imagen que manejes (ej. 'image/jpeg', 'image/png', etc.)
      res.send(Buffer.from(rows[0].imagen));
    } else {
      throw new Error('No se encontró ninguna imagen en la base de datos.');
    }
  } catch (error) {
    console.error('Error al obtener la imagen desde MySQL:', error.message);
    res.status(404).json({ error: 'No se encontró la imagen en la base de datos.' });
  }
});

// Ruta para eliminar un logo por ID (DELETE)
router.delete('/logos/:id', async (req, res) => {
  try {
    const id_vendedor = req.params.id;

    const connection = await pool.getConnection();

    const query = 'DELETE FROM Logo WHERE id_vendedor = ?';
    const [result] = await connection.execute(query, [id_vendedor]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Logo no encontrado para eliminar.' });
    }

    res.status(200).json({ message: 'Logo eliminado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al eliminar el logo desde la base de datos.' });
  }
});


export default router;