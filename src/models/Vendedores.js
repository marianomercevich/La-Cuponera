import mongoose from 'mongoose';
import path from 'path';

// Definir el esquema del usuario
const vendedorSchema = new mongoose.Schema({
  id_tienda: {type: Number, required: false}, 
  nombreTienda:  { type: String, required: true },
  dirTiendaFisica: { type: String, required: true}, 
  telefono: { type: Number, required: true }, 
  descripcion: { type: String, required: true }, 
  email: { type: String, required: true, unique: true }, 
  contraseña: { type: String, required: true }, 
  registroFecha: {type: Date, default: Date.now,},
  estadoVerificacion: {type: String, enum: ['Pendiente', 'Aprobada', 'Desaprobada'], required: true, default: 'Pendiente',},
  redesSociales: { type: String, required: true }, 
  paginaWeb: { type: String, required: true}, 
  horariosTiendaFisica: { type: String, required: true },
  representanteLegal: { type: String, required: true }, 
  Nit: { type: Number, required: true  },  
  categorias: { type: Object, required: false }, 
  raiting: {type: Number, require: false},  
  portada:{type: String}, 
  logo: {type: String}, 
  seguidores: {type: Array, default: []}, 
  type:{type: String, default: 'vendedor'}, 
  geolocalizacion:{type: String} 

});

// Exportar el modelo de usuario basado en el esquema
const Vendedor = mongoose.model('Vendedor', vendedorSchema);
export default Vendedor; 