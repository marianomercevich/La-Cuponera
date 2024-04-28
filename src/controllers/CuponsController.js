import Coupon from '../models/coupon.js';
import multer from 'multer';

// Configuración de multer para la subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/public/img'); // Directorio donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Nombre del archivo guardado
  }
});

const upload = multer({ storage: storage });

// Función para manejar la creación de cupones
export const createCoupon = async (req, res) => {
    try {
        const { title, description, discount, expirationDate, createdBy } = req.body;

        // Verificar si se proporcionó una imagen en la solicitud
        let imagePath = '';
        if (req.file) {
            imagePath = req.file.path; // Ruta de la imagen guardada
        }

        // Crear un nuevo cupón
        const newCoupon = new Coupon({
            title,
            description,
            discount,
            expirationDate,
            createdBy,
            image: imagePath // Guardar la ruta de la imagen en el documento del cupón
        });

        // Guardar el nuevo cupón en la base de datos
        await newCoupon.save();

        // Devolver el cupón creado como respuesta
        res.status(201).json(newCoupon);
    } catch (error) {
        console.error('Error en createCoupon:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Función para manejar la actualización de cupones
export const updateCoupon = async (req, res) => {
    try {
        const { title, description, discount, expirationDate } = req.body;

        // Verificar si se proporcionó una imagen en la solicitud
        let imagePath = '';
        if (req.file) {
            imagePath = req.file.path; // Ruta de la imagen guardada
        }

        // Actualizar el cupón existente
        const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.id, {
            title,
            description,
            discount,
            expirationDate,
            image: imagePath // Guardar la ruta de la nueva imagen en el documento del cupón
        }, { new: true });

        if (!updatedCoupon) {
            return res.status(404).send('Cupón no encontrado');
        }

        // Devolver el cupón actualizado como respuesta
        res.json(updatedCoupon);
    } catch (error) {
        console.error('Error en updateCoupon:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
