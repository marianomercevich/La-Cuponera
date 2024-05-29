import nodemailer from "nodemailer";
import Mailgen from "mailgen";

// Función para generar un token de validación simple
const generarTokenValidacion = () => {
  const timestamp = Date.now().toString(); // Usamos la marca de tiempo actual como base del token
  const token = timestamp.substring(timestamp.length - 6); // Tomamos los últimos 6 dígitos de la marca de tiempo
  return token;
};

const configuracionTransporter = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "maritodev81@gmail.com",
    pass: "kwkt eiyc sdcc biuh",
  },
};

const crearTransporter = () => nodemailer.createTransport(configuracionTransporter);

const configuracionMailGenerator = {
  theme: "default",
  product: {
    name: "La Cuponera",
    link: "https://lacuponera.app/",
  },
};

const mailGenerator = new Mailgen(configuracionMailGenerator);

export const enviarCorreoRegistro = async (usuarioEmail) => {
  const transporter = crearTransporter();

  const tokenValidacion = generarTokenValidacion(); // Generar el token de validación

  const contenido = {
    body: {
      name: usuarioEmail.full_name,
      intro: `¡Bienvenido a La Cuponera! Gracias por registrarte en nuestra plataforma.`,
      outro: `¡Puedes iniciar sesión colocando este token de validación (${tokenValidacion}) en la aplicación para empezar a utilizar nuestros cupones!`,
      signature: false,
    },
  };

  const correo = mailGenerator.generate(contenido);

  const mensaje = {
    from: "maritodev81@gmail.com",
    to: usuarioEmail.email,
    subject: "¡Bienvenido a La Cuponera!",
    html: correo,
  };

  try {
    const email = await transporter.sendMail(mensaje);
    return email;
  } catch (error) {
    console.error(`Error enviando correo de registro a ${usuarioEmail.email}: ${error.message}`);
    throw error;
  }
};


export const enviarCorreoRestablecerContraseña = async (usuarioEmail, tokenLink) => {
  const transporter = crearTransporter();

  const contenido = {
    body: {
      name: usuarioEmail.full_name,
      intro: "Has recibido este correo electrónico porque se recibió una solicitud para restablecer la contraseña de tu cuenta.",
      action: {
        instructions: "Haz clic en el siguiente botón para restablecer tu contraseña:",
        button: {
          color: "#DC4D2F",
          text: "Restablecer tu contraseña",
          link: `http://localhost:5000/api/jwt/passwordReset/${tokenLink}`,
        },
      },
      outro: "Si no solicitaste restablecer tu contraseña, no es necesario que realices ninguna otra acción.",
      signature: false,
    },
  };

  const correo = mailGenerator.generate(contenido);

  const mensaje = {
    from: "maritodev81@gmail.com",
    to: usuarioEmail.email,
    subject: "Correo de recuperación de contraseña",
    html: correo,
  };

  try {
    const email = await transporter.sendMail(mensaje);
    return email;
  } catch (error) {
    error(`Error enviando correo de restablecimiento de contraseña a ${usuarioEmail.email}: ${error.message}`);
    throw error;
  }
};
