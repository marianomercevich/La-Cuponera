/* import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Company from '../models/company.js';

// Función para manejar el login de empresas
export const loginCompany = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar la empresa en la base de datos por su email
        const company = await Company.findOne({ email });

        // Verificar si la empresa existe y si la contraseña es válida
        if (!company || !bcrypt.compareSync(password, company.password)) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Generar un token de autenticación
        const token = jwt.sign({ companyId: company._id }, process.env.JWT_CLIENT_SECRET, { expiresIn: '1h' });

        // Devolver el token como respuesta
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error en loginCompany:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

    // Función para manejar el registro de empresas
    export const registerCompany = async (req, res) => {
        const { firstName, lastName, email, password } = req.body;

    try {
        // Verificar si el email ya está en uso
        const existingCompany = await Company.findOne({ email });
        if (existingCompany) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Crear una nueva empresa
        const newCompany = new Company({
            firstName,
            lastName,
            email,
            password: bcrypt.hashSync(password, 10)
        });

        // Guardar la nueva empresa en la base de datos
        await newCompany.save();

        // Generar un token de autenticación
        const token = jwt.sign({ companyId: newCompany._id }, process.env.JWT_CLIENT_SECRET, { expiresIn: '1h' });

        // Devolver el token como respuesta
        res.status(201).json({ token });
    } catch (error) {
        console.error('Error en registerCompany:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
 */