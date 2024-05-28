import mongoose from 'mongoose';

// Definir el esquema del usuario
const vendedorSchema = new mongoose.Schema({
  id_tienda: {type: Number, required: false}, // ID único del vendedor
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
  raiting: {type: Number, require: false},  //float 0.0 0.5 1.0 1.5 2.0 2.5 3.0 3.5 4.0 4.5 5.0 (del 0 al 5 para las estrellas)
  portada:{}, //file
  logo: {}, //file
  seguidores: {}, //lista de seguidores (id)
  type:{}//vendedor
  //geolocalizacion segun su direccion

});

// Exportar el modelo de usuario basado en el esquema
const Vendedor = mongoose.model('Vendedor', vendedorSchema);
export default Vendedor; 