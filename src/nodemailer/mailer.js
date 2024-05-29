import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { NODEMAILER_PASS, NODEMAILER_USER } from "../../config/config.js";
import { devLogger } from "../../utils/logger.js";

export const sendEmailRegister = async (userEmail) => {
  let config = {
    service: "gmail",
    auth: {
      user: NODEMAILER_USER,
      pass: NODEMAILER_PASS,
    },
  };

  let transporter = nodemailer.createTransport(config);

  let Mailgenerator = new Mailgen({
    theme: "default",
    product: {
      name: "La Cuponera",
      link: "http://localhost:8080",
    },
  });

  let content = {
    body: {
      name: userEmail.full_name,
      intro: `¡Bienvenido a La Cuponera! Gracias por registrarte en nuestra plataforma.`,
      outro: `¡Puedes iniciar sesión colocando este token en la aplicación para empezar a utilizar nuestros cupones!`,
      signature: false,
    },
  };

  let mail = Mailgenerator.generate(content);

  let message = {
    from: NODEMAILER_USER,
    to: userEmail.email,
    subject: "¡Bienvenido a La Cuponera!",
    html: mail,
  };
  try {
    const email = await transporter.sendMail(message);
    return email;
  } catch (error) {
    devLogger.error(error);
    throw error;
  }
};

export const emailResetPassword = async (userEmail, tokenLink) => {
  let config = {
    service: "gmail",
    auth: {
      user: NODEMAILER_USER,
      pass: NODEMAILER_PASS,
    },
  };
  let transporter = nodemailer.createTransport(config);

  let Mailgenerator = new Mailgen({
    theme: "default",
    product: {
      name: "La Cuponera",
      link: "http://localhost:8080",
    },
  });

  let content = {
    body: {
      name: `${userEmail.full_name}`,
      intro:
        "Has recibido este correo electrónico porque se recibió una solicitud para restablecer la contraseña de tu cuenta.",
      action: {
        instructions: "Haz clic en el siguiente botón para restablecer tu contraseña:",
        button: {
          color: "#DC4D2F",
          text: "Restablecer tu contraseña",
          link: `http://localhost:8080/api/jwt/passwordReset/${tokenLink}`,
        },
      },
      outro:
        "Si no solicitaste restablecer tu contraseña, no es necesario que realices ninguna otra acción.",
      signature: false,
    },
  };

  let mail = Mailgenerator.generate(content);

  let message = {
    from: NODEMAILER_USER,
    to: userEmail.email,
    subject: "Correo de recuperación de contraseña",
    html: mail,
  };
  try {
    const email = await transporter.sendMail(message);
    return email;
  } catch (error) {
    devLogger.error(error);
    throw error;
  }
};
