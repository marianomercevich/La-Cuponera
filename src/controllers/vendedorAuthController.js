import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Vendedor from '../models/Vendedores.js';
import { enviarCorreoRegistro } from '../nodemailer/mailer.js';

// Función para manejar el login de usuarios
export const loginVendedor = async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        // Buscar el usuario en la base de datos por su email
        const vendedor = await Vendedor.findOne({ email });

        // Verificar si el usuario existe y si la contraseña es válida
        if (!vendedor || !bcrypt.compareSync(contraseña, vendedor.contraseña)) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar un token de autenticación
        const token = jwt.sign({ vendedorId: vendedor._id }, process.env.JWT_CLIENT_SECRET, { expiresIn: '1h' });

        // Devolver el token como respuesta
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error en loginVendedor:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Función para manejar el registro de usuarios
export const registerVendedor = async (req, res) => {
    const {           id,
        nombreTienda,
        dirTiendaFisica,
        telefono,
        descripcion,
        email,
        contraseña,
        registroFecha,
        estadoVerificacion, 
        redesSociales,
        paginaWeb, 
        horariosTiendaFisica, 
        representanteLegal, 
        Nit,  
        segundoRegistro,
        categorias} = req.body;

    try {
        // Verificar si el email ya está en uso
        const existingVendedor = await Vendedor.findOne({ email });
        if (existingVendedor) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Crear un nuevo usuario
        const newVendedor = new Vendedor({
          id,
          nombreTienda,
          dirTiendaFisica,
          telefono,
          descripcion,
          email,
          contraseña: bcrypt.hashSync(contraseña, 10),
          registroFecha,
          estadoVerificacion, 
          redesSociales,
          paginaWeb, 
          horariosTiendaFisica, 
          representanteLegal, 
          Nit, 
          segundoRegistro,
          categorias

        });

        // Guardar el nuevo usuario en la base de datos
        await newVendedor.save();
        
        // Enviar correo de registro
        await enviarCorreoRegistro({
          full_name: nombreTienda,
          email: email,
        });

        // Generar un token de autenticación
        const token = jwt.sign({ vendedorId: newVendedor._id }, process.env.JWT_CLIENT_SECRET, { expiresIn: '1h' });

        // Devolver el token como respuesta
        res.status(201).json({ token });
    } catch (error) {
        console.error('Error en registerVendedor:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
