import mongoose from 'mongoose';

// Definir el esquema del usuario
const userSchema = new mongoose.Schema({
  id: {type: Number, required: true},
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  registroFecha: {type: String, required: true },
  estadoVerificacion:{type: String, required: true }
});

// Exportar el modelo de usuario basado en el esquema
const User = mongoose.model('User', userSchema);
export default User; 