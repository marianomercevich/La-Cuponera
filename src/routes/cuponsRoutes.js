import express from 'express';
import Coupon from '../models/cupons.js';


const router = express.Router();



// Obtener todos los cupones
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    console.error('Error al obtener cupones:', err);
    res.status(500).send('Error interno del servidor');
  }
});


// Obtener un cupón por su ID
router.get('/:id', async (req, res) => {
  try {
    const id_vendedor = req.params.id;

    // Obtener una conexión del pool de conexiones
    const connection = await pool.getConnection();

    // Consulta SQL para seleccionar la imagen del cupón por su ID
    const query = 'SELECT imagen FROM Cupon_img WHERE id_vendedor = ?';
    const [results] = await connection.execute(query, [id_vendedor]);

    // Liberar la conexión de vuelta al pool
    connection.release();

    // Verifica si se encontraron resultados
    if (results.length === 0 || !results[0].imagen) {
      return res.status(404).send('Imagen del Cupon no encontrada');
    }

    // Obtén la imagen binaria desde los resultados
    const imagenBinaria = results[0].imagen;

    // Establece el tipo de contenido en la respuesta HTTP
    res.setHeader('Content-Type', 'image/jpeg'); // Ajusta según el tipo de imagen que estás almacenando en MySQL

    // Devuelve la imagen binaria como respuesta
    res.status(200).send(imagenBinaria);
  } catch (err) {
    console.error('Error al obtener cupón por ID:', err);
    res.status(500).send('Error interno del servidor');
  }
});


// Crear un nuevo cupón
router.post('/', async (req, res) => {
  try {
    const newCoupon = new Coupon(req.body);
    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (err) {
    console.error('Error al crear cupón:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Actualizar un cupón existente
router.put('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) {
      return res.status(404).send('Cupón no encontrado');
    }
    res.json(coupon);
  } catch (err) {
    console.error('Error al actualizar cupón:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Eliminar un cupón
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).send('Cupón no encontrado');
    }
    res.json({ message: 'Cupón eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar cupón:', err);
    res.status(500).send('Error interno del servidor');
  }
});

export default router;

