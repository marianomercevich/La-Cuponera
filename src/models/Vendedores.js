import mongoose from 'mongoose';

// Definir el esquema del usuario
const vendedorSchema = new mongoose.Schema({
  id: {type: Number, required: true}, // ID único del vendedor
  dirTiendaFisica: { type: String, required: true }, 
  telefono: { type: Number, required: true }, 
  descripcion: { type: String, required: true }, 
  email: { type: String, required: true, unique: true }, 
  contraseña: { type: String, required: true }, 
  registroFecha: {type: String, required: true }, 
  estadoVerificacion: { type: String, required: true, enum: ['Pendiente', 'Aprobada', 'Desaprobada'] }, 
  redesSociales: { type: Object }, // Redes sociales del vendedor (podría ser un objeto con nombres de redes y enlaces)
  paginaWeb: { type: String }, // Página web del vendedor (si la tiene)
  horariosTiendaFisica: { type: Object }, // Horarios de la tienda física (podría ser un objeto con días y horarios de apertura/cierre)
  representanteLegal: { type: String }, 
  NIT: { type: Number },  // Número de Identificación Tributaria del vendedor
  categorias: { type: Object } // Categorías a las que pertenece el vendedor y sus detalles asociados (podría ser un objeto con nombres de categorías y detalles adicionales)
});

// Exportar el modelo de usuario basado en el esquema
const Vendedor = mongoose.model('Vendedor', vendedorSchema);
export default Vendedor; 
