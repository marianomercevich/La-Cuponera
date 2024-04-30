import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Función para manejar el login de usuarios
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar el usuario en la base de datos por su email
        const user = await User.findOne({ email });

        // Verificar si el usuario existe y si la contraseña es válida
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar un token de autenticación
        const token = jwt.sign({ userId: user._id }, process.env.JWT_CLIENT_SECRET, { expiresIn: '1h' });

        // Devolver el token como respuesta
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error en loginUser:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Función para manejar el registro de usuarios
export const registerUser = async (req, res) => {
    const { id,
        nombre,
        apellido,
        email,
        contraseña,
        registroFecha,
        estadoVerificacion } = req.body;

    try {
        // Verificar si el email ya está en uso
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Crear un nuevo usuario
        const newUser = new User({
          id,
          nombre,
          apellido,
          email,
          contraseña: bcrypt.hashSync(contraseña, 10),
          registroFecha,
          estadoVerificacion
        });

        // Guardar el nuevo usuario en la base de datos
        await newUser.save();

        // Generar un token de autenticación
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_CLIENT_SECRET, { expiresIn: '1h' });

        // Devolver el token como respuesta
        res.status(201).json({ token });
    } catch (error) {
        console.error('Error en registerUser:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
/* falta la logica de login y persistencia de datos de login */