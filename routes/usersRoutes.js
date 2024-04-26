import express from 'express';
import bcrypt from 'bcryptjs';
import { loginUser, registerUser } from '../controllers/userAuthController.js';
import User from '../models/user.js';

const router = express.Router();

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Obtener un usuario por su ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json(user);
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
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
    });

    // Guardar el usuario en la base de datos
    await newUser.save();
    res.status(201).json(newUser);
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
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.json(user);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).send('Error interno del servidor');
  }
});


// Eliminar un usuario
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
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
