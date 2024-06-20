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
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ error: 'Cupón no encontrado' });
    }
    res.json(coupon);
  } catch (err) {
    console.error('Error al obtener cupón por ID:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
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

