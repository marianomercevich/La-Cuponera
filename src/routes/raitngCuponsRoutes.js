import express from 'express';
import mysql from 'mysql2/promise';

const router = express.Router();

// Configuración de la conexión a la base de datos MySQL
const pool = mysql.createPool({
  host: process.env.HOST_DIGITAL_USER,
  database: process.env.DBNAME_DIGITAL_USER,
  user: process.env.DIGITAL_USER,
  password: process.env.DIGITAL_PASS,
  port: 3306
});

const upload = () => (req, res, next) => { next(); };

// Ruta para agregar el raiting del cupon (Post)
router.post('/raiting/:id', upload(), async (req, res) => {
  try {
    const id_vendedor = req.params.id;
    const user_id = req.body.user_id; // Obtener user_id del cuerpo de la solicitud
    const id_cupon = req.params.id; // Obtener id_cupon de los parámetros de la solicitud
    const raiting = req.body.raiting; // Obtener raiting del cuerpo de la solicitud
    const comentarios = req.body.comentarios || '';

    const connection = await pool.getConnection();

    const query = 'INSERT INTO Raiting_coupons (comentarios, raiting, user_id, id_vendedor, id_cupon) VALUES (?, ?, ?, ?, ?)';
    const [result] = await connection.execute(query, [comentarios, raiting, user_id, id_vendedor, id_cupon]);

    connection.release();

    res.status(200).json({ comentarios, raiting, user_id, id_vendedor, id_cupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al guardar el raiting en la base de datos.' });
  }
});

// Ruta para obtener el raiting de un cupon por ID (GET)
router.get('/raiting/:id', async (req, res) => {
  const id_cupon = req.params.id;
  
  try {
    const connection = await pool.getConnection();
    
    const [rows] = await connection.query('SELECT raiting, comentarios, id_cupon FROM Raiting_coupons WHERE id_cupon = ?', [id_cupon]);
    
    connection.release();
    
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener el raiting desde la base de datos.' });
  }
});

// Ruta para eliminar un raiting por ID (DELETE)
router.delete('/raiting/:id', async (req, res) => {
    try {
      const id = req.params.id;
  
      // Validar si el ID es un número entero válido
      if (!Number.isInteger(Number(id))) {
        return res.status(400).json({ error: 'El ID proporcionado no es válido.' });
      }
  
      const connection = await pool.getConnection();
  
      const query = 'DELETE FROM Raiting_coupons WHERE id = ?';
      const [result] = await connection.execute(query, [id]);
  
      connection.release();
  
      // Verificar si se eliminó algún registro
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Raiting no encontrado para eliminar.' });
      }
  
      res.status(200).json({ message: 'Raiting eliminado correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ocurrió un error al eliminar el raiting desde la base de datos.' });
    }
  });
  

export default router;
