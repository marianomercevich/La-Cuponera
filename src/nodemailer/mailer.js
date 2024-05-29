import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { NODEMAILER_PASS, NODEMAILER_USER } from "../../config/config.js";
import { devLogger } from "../../utils/logger.js";

const configuracionTransporter = {
  service: "gmail",
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASS,
  },
};

const crearTransporter = () => nodemailer.createTransport(configuracionTransporter);

const configuracionMailGenerator = {
  theme: "default",
  product: {
    name: "La Cuponera",
    link: "http://localhost:5000",
  },
};

const mailGenerator = new Mailgen(configuracionMailGenerator);

export const enviarCorreoRegistro = async (usuarioEmail, token) => {
  const transporter = crearTransporter();

  const contenido = {
    body: {
      name: usuarioEmail.full_name,
      intro: `¡Bienvenido a La Cuponera! Gracias por registrarte en nuestra plataforma.`,
      outro: `¡Puedes iniciar sesión colocando este token (${token}) en la aplicación para empezar a utilizar nuestros cupones!`,
      signature: false,
    },
  };

  const correo = mailGenerator.generate(contenido);

  const mensaje = {
    from: NODEMAILER_USER,
    to: usuarioEmail.email,
    subject: "¡Bienvenido a La Cuponera!",
    html: correo,
  };

  try {
    const email = await transporter.sendMail(mensaje);
    return email;
  } catch (error) {
    devLogger.error(`Error enviando correo de registro a ${usuarioEmail.email}: ${error.message}`);
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
    from: NODEMAILER_USER,
    to: usuarioEmail.email,
    subject: "Correo de recuperación de contraseña",
    html: correo,
  };

  try {
    const email = await transporter.sendMail(mensaje);
    return email;
  } catch (error) {
    devLogger.error(`Error enviando correo de restablecimiento de contraseña a ${usuarioEmail.email}: ${error.message}`);
    throw error;
  }
};
