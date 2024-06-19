import mongoose from 'mongoose';
import { type } from 'os';
import path from 'path';

// Definir el esquema del usuario
const vendedorSchema = new mongoose.Schema({
  id_tienda: {type: Number, required: false}, 
  nombreTienda:  { type: String, required: true },
  dirTiendaFisica: { type: String, required: false}, 
  telefono: { type: Number, required: false }, 
  descripcion: { type: String, required: false}, 
  email: { type: String, required: true, unique: true }, 
  contraseña: { type: String, required: true }, 
  registroFecha: {type: Date, default: Date.now,},
  
  segundoRegistro: {type: Boolean, default: false },

  tokenValidacion: {type: Number},
    
  estadoVerificacion: {type: String, enum: ['Pendiente', 'Aprobada', 'Desaprobada'], required: false, default: 'Pendiente',},
  redesSociales: { type: String, required: false }, 
  paginaWeb: { type: String, required: false}, 
  horariosTiendaFisica: { type: String, required: false },
  representanteLegal: { type: String, required: false }, 
  Nit: { type: Number, required: false  },  
  categorias: { type: Object, required: false }, 
  raiting: {type: Number, require: false},  
  portada:{type: String}, 
  logo: {type: String}, 
  seguidores: {type: Array, default: []}, 
  type:{type: String, default: 'vendedor'}, 
   location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  }

});

// Exportar el modelo de usuario basado en el esquema
const Vendedor = mongoose.model('Vendedor', vendedorSchema);
export default Vendedor; 
