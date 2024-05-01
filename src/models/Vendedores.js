import mongoose from 'mongoose';

// Definir el esquema del usuario
const vendedorSchema = new mongoose.Schema({
  id: {type: Number, required: true}, // ID único del vendedor
  nombreTienda:  { type: String, required: true },
  dirTiendaFisica: { type: String, required: true}, 
  telefono: { type: Number, required: true }, 
  descripcion: { type: String, required: true }, 
  email: { type: String, required: true, unique: true }, 
  contraseña: { type: String, required: true }, 
  registroFecha: {type: String, required: true }, 
  estadoVerificacion: { type: String, enum: ['Pendiente', 'Aprobada', 'Desaprobada'], required: true  }, 
  redesSociales: { type: Object, required: true }, // Redes sociales del vendedor (podría ser un objeto con nombres de redes y enlaces)
  paginaWeb: { type: String, required: true }, // Página web del vendedor (si la tiene)
  horariosTiendaFisica: { type: Object, required: true }, // Horarios de la tienda física (podría ser un objeto con días y horarios de apertura/cierre)
  representanteLegal: { type: String, required: true }, 
  Nit: { type: Number, required: true  },  // Número de Identificación Tributaria del vendedor
  categorias: { type: Object, required: true } // Categorías a las que pertenece el vendedor y sus detalles asociados (podría ser un objeto con nombres de categorías y detalles adicionales)
});

// Exportar el modelo de usuario basado en el esquema
const Vendedor = mongoose.model('Vendedor', vendedorSchema);
export default Vendedor; 