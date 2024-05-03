import Coupon from '../models/coupon.js';
import upload from '../middlewares/upload.js';

// Función para manejar la creación de cupones
export const createCoupon = async (req, res) => {
    try {
        // Utiliza el middleware de Multer para manejar la subida de archivos
        upload.single('imagen')(req, res, async function (err) {
            if (err) {
                return res.status(400).json({ message: 'Error al subir la imagen' });
            }

            const { title, description, discount, expirationDate, createdBy } = req.body;

            // Verificar si se proporcionó una imagen en la solicitud
            let imagePath = '';
            if (req.file) {
                imagePath = req.file.filename; // Nombre del archivo guardado
            }

            // Crear un nuevo cupón
            const newCoupon = new Coupon({
                title,
                description,
                discount,
                expirationDate,
                createdBy,
                imagePath // Guardar el nombre del archivo en el documento del cupón
            });

            // Guardar el nuevo cupón en la base de datos
            await newCoupon.save();

            // Devolver el cupón creado como respuesta
            res.status(201).json(newCoupon);
        });
    } catch (error) {
        console.error('Error en createCoupon:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Función para manejar la actualización de cupones
export const updateCoupon = async (req, res) => {
    try {
        // Utiliza el middleware de Multer para manejar la subida de archivos
        upload.single('imagen')(req, res, async function (err) {
            if (err) {
                return res.status(400).json({ message: 'Error al subir la imagen' });
            }

            const { title, description, discount, expirationDate } = req.body;

            // Verificar si se proporcionó una imagen en la solicitud
            let imagePath = '';
            if (req.file) {
                imagePath = req.file.filename; // Nombre del archivo guardado
            }

            // Actualizar el cupón existente
            const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, {
                title,
                description,
                discount,
                expirationDate,
                imagePath // Guardar la ruta de la nueva imagen en el documento del cupón
            }, { new: true });

            if (!updatedCoupon) {
                return res.status(404).send('Cupón no encontrado');
            }

            // Devolver el cupón actualizado como respuesta
            res.json(updatedCoupon);
        });
    } catch (error) {
        console.error('Error en updateCoupon:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
