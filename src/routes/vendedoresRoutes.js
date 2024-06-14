import express from 'express';
import bcrypt from 'bcrypt';
import { loginVendedor, registerVendedor } from '../controllers/vendedorAuthController.js';
import Vendedor from '../models/Vendedores.js';

const router = express.Router();

// Middleware para validar ObjectId
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send('ID inválido');
  }
  next();
};

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
router.get('/:id', validateObjectId, async (req, res) => {
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
    const hashedPassword = await bcrypt.hash(req.body.contraseña, 10);

    // Crear un nuevo usuario
    const newVendedor = new Vendedor({
      id: req.body.id,
      nombreTienda: req.body.nombreTienda,
      dirTiendaFisica: req.body.dirTiendaFisica, 
      telefono: req.body.telefono,
      descripcion: req.body.descripcion,
      email: req.body.email,
      contraseña: hashedPassword,
      segundoRegistro: req.body.segundoRegistro,
      registroFecha: req.body.registroFecha, 
      estadoVerificacion: req.body.estadoVerificacion,
      redesSociales: req.body.redesSociales,
      paginaWeb: req.body.paginaWeb, 
      horariosTiendaFisica: req.body.horariosTiendaFisica, 
      representanteLegal: req.body.representanteLegal, 
      Nit: req.body.Nit, 
      categorias: req.body.categorias
    });

    // Guardar el usuario en la base de datos
    await newVendedor.save();
    res.status(201).json(newVendedor);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// Actualizar un usuario
router.put('/:id', validateObjectId, async (req, res) => {
  try {
    // Verificar si se proporcionó una nueva contraseña en la solicitud
    if (req.body.contraseña) {
      // Hashear la nueva contraseña
      req.body.contraseña = await bcrypt.hash(req.body.contraseña, 10);
    }

    // Actualizar el usuario en la base de datos
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
router.delete('/:id', validateObjectId, async (req, res) => {
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
router.post('/login', loginVendedor);
router.post('/register', registerVendedor);

export default router;
