import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import fs from "fs";

// Función para generar un token de validación simple
const generarTokenValidacion = () => {
  const timestamp = Date.now().toString();
  const token = timestamp.substring(timestamp.length - 6);
  return token;
};

const configuracionTransporter = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "digital.lacuponera@gmail.com", /* "maritodev81@gmail.com" */
    pass: "pxgr bkzg offx gzzr",  /* "kwkt eiyc sdcc biuh" */ 
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

// Función para enviar correo de registro
export const enviarCorreoRegistro = async (usuarioEmail, tokenValidacion) => {
  const transporter = crearTransporter();

  // Lee el archivo CSS
  const cssPath = '/src/nodemailer/css.css';
  let cssFile;
  try {
    cssFile = fs.readFileSync(cssPath, 'utf8');
  } catch (error) {
    console.error(`Error al leer el archivo CSS: ${error.message}`);
    throw error;
  }

  const contenidoHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${cssFile}</style>
      </head>
      <body>
        <div class="email-container">
          <header class="email-header">
            <img class="logo" src="cid:logo" alt="La Cuponera Logo">
          </header>
          <main class="email-body">
            <h2>¡Hola ${usuarioEmail.full_name}!</h2>
            <p>¡Bienvenido a La Cuponera! Gracias por registrarte en nuestra plataforma.</p>
            <p>¡Puedes iniciar sesión colocando este token de validación (${tokenValidacion}) en la aplicación para empezar a crear tu tienda!</p>
          </main>
        </div>
      </body>
    </html>
  `;

  const mensaje = {
    from: "digital.lacuponera@gmail.com", 
    to: usuarioEmail.email,
    subject: "¡Bienvenido a La Cuponera!",
    html: contenidoHTML,
    attachments: [
      {
        filename: 'Logo.png',
        path: './public/img/Logo.png',
        cid: 'logo' 
      }
    ]
  };

  try {
    const email = await transporter.sendMail(mensaje);
    console.log("Correo enviado:", email.messageId);
    return email;
  } catch (error) {
    console.error(`Error enviando correo de registro a ${usuarioEmail.email}: ${error.message}`);
    throw error;
  }
};


/* export const enviarCorreoRestablecerContraseña = async (usuarioEmail, tokenLink) => {
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
 */