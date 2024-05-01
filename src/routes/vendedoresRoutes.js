import express from 'express';
import bcrypt from 'bcrypt';
import { loginUser, registerUser } from '../controllers/vendedorAuthController.js';
import Vendedor from '../models/Vendedores.js';

const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const vendedor = await Vendedor.find();
    res.json(vendedor);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Obtener un usuario por su ID
router.get('/:id', async (req, res) => {
  try {
    const vendedor = await Vendedor.findById(req.params.id);
    if (!vendedor) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json(vendedor);
  } catch (err) {
    console.error('Error al obtener usuario por ID:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Crear un nuevo usuario
router.post('/', async (req, res) => {
  try {
    // Hashear la contraseña antes de guardarla en la base de datos
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Crear un nuevo usuario
    const newVendedor = new Vendedor({

      id: req.body.id,
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      email: req.body.email,
      contraseña: hashedPassword,
      registroFecha: req.body.registroFecha, 
      estadoVerificacion: req.body.estadoVerificacion
    });

    // Guardar el usuario en la base de datos
    await newVendedor.save();
    res.status(201).json(newVendedor);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).send('Error interno del servidor');
  }
});


router.put('/:id', async (req, res) => {
  try {
    // Verificar si se proporcionó una nueva contraseña en la solicitud
    if (req.body.password) {
      // Hashear la nueva contraseña
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    // Actualizar la empresa en la base de datos
    const vendedor = await Vendedor.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!vendedor) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json(vendedor);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).send('Error interno del servidor');
  }
});


// Eliminar un usuario
router.delete('/:id', async (req, res) => {
  try {
    const vendedor = await Vendedor.findByIdAndDelete(req.params.id);
    if (!vendedor) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Rutas para la autenticación de usuarios
router.post('/login', loginUser);
router.post('/register', registerUser);

export default router;
