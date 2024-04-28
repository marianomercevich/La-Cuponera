import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Coupon from '../models/coupon.js';

// Función para manejar el login de cupones
export const loginCoupon = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar el cupón en la base de datos por su email
        const coupon = await Coupon.findOne({ email });

        // Verificar si el cupón existe y si la contraseña es válida
        if (!coupon || !bcrypt.compareSync(password, coupon.password)) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar un token de autenticación
        const token = jwt.sign({ couponId: coupon._id }, process.env.JWT_COUPON_SECRET, { expiresIn: '1h' });

        // Devolver el token como respuesta
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error en loginCoupon:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Función para manejar el registro de cupones
export const registerCoupon = async (req, res) => {
    const { title, description, discount, location, expirationDate, createdBy } = req.body;

    try {
        // Crear un nuevo cupón
        const newCoupon = new Coupon({
            title,
            description,
            discount,
            location,
            expirationDate,
            createdBy,
        });

        // Guardar el nuevo cupón en la base de datos
        await newCoupon.save();

        // Devolver el cupón creado como respuesta
        res.status(201).json(newCoupon);
    } catch (error) {
        console.error('Error en registerCoupon:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
