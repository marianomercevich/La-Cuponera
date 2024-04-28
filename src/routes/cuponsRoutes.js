import express from 'express';
import Coupon from '../models/coupon.js';

const router = express.Router();

// Obtener todos los cupones de una empresa específica
router.get('/:companyId', async (req, res) => {
  try {
    const coupons = await Coupon.find({ createdBy: req.params.companyId });
    res.json(coupons);
  } catch (err) {
    console.error('Error al obtener cupones:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Obtener un cupón por su ID
router.get('/:companyId/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ _id: req.params.id, createdBy: req.params.companyId });
    if (!coupon) {
      return res.status(404).send('Cupón no encontrado');
    }
    res.json(coupon);
  } catch (err) {
    console.error('Error al obtener cupón por ID:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Crear un nuevo cupón para una empresa específica
router.post('/:companyId', async (req, res) => {
  try {
    const newCoupon = new Coupon({
      title: req.body.title,
      description: req.body.description,
      discount: req.body.discount,
      location: req.body.location,
      expirationDate: req.body.expirationDate,
      createdBy: req.params.companyId,
    });

    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (err) {
    console.error('Error al crear cupón:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Actualizar un cupón existente de una empresa específica
router.put('/:companyId/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.params.companyId },
      req.body,
      { new: true }
    );

    if (!coupon) {
      return res.status(404).send('Cupón no encontrado');
    }
    res.json(coupon);
  } catch (err) {
    console.error('Error al actualizar cupón:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Eliminar un cupón de una empresa específica
router.delete('/:companyId/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findOneAndDelete({ _id: req.params.id, createdBy: req.params.companyId });
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
