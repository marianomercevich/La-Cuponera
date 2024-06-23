import mongoose from 'mongoose';

// Definir el esquema del usuario
const userSchema = new mongoose.Schema({
  id: {type: Number, required: false},
  nombre: { type: String, required: false },
  apellido: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  registroFecha: {type: String, required: false },
  estadoVerificacion: { type: String, required: false, enum: ['Pendiente', 'Aprobada', 'Desaprobada'] }, 
  cart:{type: Array, default: [], required: false },
  tokenValidacion: {type: Number},
});

// Exportar el modelo de usuario basado en el esquema
const User = mongoose.model('User', userSchema);
export default User; 