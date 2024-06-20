import mongoose from 'mongoose';

// Definir el esquema del usuario
const userSchema = new mongoose.Schema({
  id: {type: Number, required: false},
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  registroFecha: {type: String, required: false },
  estadoVerificacion: { type: String, required: false, enum: ['Pendiente', 'Aprobada', 'Desaprobada'] }, 
  cart:{type: String },
  tokenValidacion: {type: Number},
});

// Exportar el modelo de usuario basado en el esquema
const User = mongoose.model('User', userSchema);
export default User; 