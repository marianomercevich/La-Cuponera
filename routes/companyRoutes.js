/* import express from 'express';
import bcrypt from 'bcryptjs';
import { loginCompany, registerCompany } from '../controllers/companyAuthController.js';
import Company from '../models/company.js';

const router = express.Router();

// Obtener todas las empresas
router.get('/', async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    console.error('Error al obtener empresas:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Obtener una empresa por su ID
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).send('Empresa no encontrada');
    }
    res.json(company);
  } catch (err) {
    console.error('Error al obtener empresa por ID:', err);
    res.status(500).send('Error interno del servidor');
  }
});
router.post('/login', loginCompany);
// Crear una nueva empresa
router.post('/', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newCompany = new Company({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
    });

    await newCompany.save();
    res.status(201).json(newCompany);
  } catch (err) {
    console.error('Error al crear empresa:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Actualizar una empresa existente

// hashear pasword
router.put('/:id', async (req, res) => {
  try {
    // Verificar si se proporcionó una nueva contraseña en la solicitud
    if (req.body.password) {
      // Hashear la nueva contraseña
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    // Actualizar la empresa en la base de datos
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!company) {
      return res.status(404).send('Empresa no encontrada');
    }
    res.json(company);
  } catch (err) {
    console.error('Error al actualizar empresa:', err);
    res.status(500).send('Error interno del servidor');
  }
});


// Eliminar una empresa
router.delete('/:id', async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).send('Empresa no encontrada');
    }
    res.json({ message: 'Empresa eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar empresa:', err);
    res.status(500).send('Error interno del servidor');
  }
});
router.post('/login', loginCompany);
router.post('/register', registerCompany);
export default router;
 */