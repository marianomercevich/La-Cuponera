import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la conexión a la base de datos MySQL
const dbConfigApp = {
  host: process.env.HOST_APP_USER,
  database: process.env.DBNAME_APP_USER,
  user: process.env.APP_USER,
  password: process.env.APP_PASS,
  port: 3306
};

// Función para conectar a la base de datos
const conectarDB = async () => {
  try {
    const connection = await mysql.createConnection(dbConfigApp);
    console.log('Conexión a la base de datos APP exitosa');
    return connection;
  } catch (error) {
    console.error('Error al conectar a la base de datos APP:', error.message);
    throw error;
  }
};

// Función para obtener la imagen desde MySQL
const obtenerImagenDesdeMySQL = async () => {
  const connection = await conectarDB(); // Conectamos a la base de datos
  try {
    const [rows] = await connection.query('SELECT imagen FROM Logo WHERE id = 2');
    if (rows.length > 0) {
      return Buffer.from(rows[0].imagen); // Devolvemos la imagen como un Buffer
    } else {
      throw new Error('No se encontró ninguna imagen en la base de datos.');
    }
  } catch (error) {
    console.error('Error al obtener la imagen desde MySQL:', error.message);
    throw error;
  } finally {
    await connection.end(); // Cerramos la conexión después de usarla
  }
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

// Configuración del generador de correo
const configuracionMailGenerator = {
  theme: 'default',
  product: {
    name: 'La Cuponera',
    link: 'https://lacuponera.app/',
  },
};

const mailGenerator = new Mailgen(configuracionMailGenerator);

// Función para enviar correo de registro
export const enviarCorreoRegistro = async (usuario, tokenValidacion) => {
  const transporter = crearTransporter();

  try {
    // Obtener la imagen desde MySQL
    const imagenBuffer = await obtenerImagenDesdeMySQL();

    const cssContent = `
      .email-container {
        font-family: Arial, sans-serif;
        background: linear-gradient(140deg, #0088ff 50%, #f9ec00 50%);
        padding: 20px;
        border-radius: 10px;
        width: 700px;
        margin: 0 auto;
      }
      .logo {
        display: flex;
        justify-content: flex-start;
        width: 300px;
        height: 75px;
      }
      .email-header {
        text-align: center;
        padding-bottom: 20px;
      }
      .email-body {
        padding: 20px;
        border-radius: 10px;
      }
      .email-body h2 {
        font-size: 30px;
        font-weight: 700;
      }
      .email-body p {
        font-size: 20px;
        font-weight: 700;
      }
      .email-footer {
        text-align: center;
        font-size: 12px;
        color: #777;
      }
      @media only screen and (max-width: 400px) {
        .email-body h2 {
          font-size: 18px;
        }
        .email-body p {
          font-size: 12px;
        }
        .email-container {
          padding: 10px;
        }
      }
    `;

    // Configurar el contenido HTML del correo
    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssContent}</style>
        </head>
        <body>
          <div class="email-container">
            <header class="email-header">
              <img class="logo" src="cid:logo" alt="La Cuponera Logo"></img>
            </header>
            <main class="email-body">
              <h2>¡Hola ${usuario.full_name}!</h2>
              <p>¡Bienvenido a La Cuponera! Gracias por registrarte en nuestra plataforma.</p>
              <p>¡Puedes iniciar sesión colocando este token de validación (${tokenValidacion}) en la aplicación para empezar a crear tu tienda!</p>
            </main>
          </div>
        </body>
      </html>
    `;

    // Configurar el mensaje de correo
    const mensaje = {
      from: process.env.USER_EMAIL,
      to: usuario.email,
      subject: '¡Bienvenido a La Cuponera!',
      html: contenidoHTML,
      attachments: [
        {
          filename: 'Logo.png',
          content: imagenBuffer, // Adjuntar la imagen como un Buffer
          cid: 'logo'
        }
      ]
    };

    const email = await transporter.sendMail(mensaje); // Enviar el correo
    console.log('Correo enviado:', email.messageId);
    return email;
  } catch (error) {
    console.error(`Error enviando correo de registro a ${usuario.email}: ${error.message}`);
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