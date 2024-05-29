import { enviarCorreoRegistro } from '../src/nodemailer/mailer.js'; // Asegúrate de que la ruta es correcta

const usuarioPrueba = {
  full_name: "mariano",
  email: "marianomercevich@gmail.com" // Reemplaza con un correo válido para la prueba
};

const tokenPrueba = "token_de_prueba";

enviarCorreoRegistro(usuarioPrueba, tokenPrueba)
  .then(response => {
    console.log('Correo enviado:', response);
  })
  .catch(error => {
    console.error('Error al enviar el correo:', error);
  });
