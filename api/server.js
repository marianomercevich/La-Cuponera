const express = require('express')
const bodyParser = require('body-parser')
const speakeasy = require('speakeasy')
const uuid = require('uuid')
const cors = require('cors')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const userController = require('../controllers/userController')
const mailController = require('../controllers/mailController')
const authController = require('../controllers/authController')
const db = require('../config/dbConfig')
const multer = require('multer');



const app = express()
const port = 9000

app.use(cors()) // Habilita el middleware de CORS
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const sessionStore = new MySQLStore({
  createDatabaseTable: true,
  expiration: 100000,
  clearExpired: true,
  schema: {
    tableName: 'sessions'
  }
}, db)

app.use(session({
  key: 'Api2Token',
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}))

// Punto de acceso para el registro de usuario
app.post('/register', async (req, res) => {
  const email = req.body.email
  const codigoReferido = req.body.codigo_referido
  const id = uuid.v4()

  // Id Referido
  let idReferido

  // Generar una clave secreta temporal con Speakeasy
  const tempSecret = speakeasy.generateSecret()

  // Generamos el codigo de referido para el nuevo usuario
  const userRefeerCode = userController.generateRefereeCode()

  if (codigoReferido) {
    idReferido = await userController.getUserByReferee(codigoReferido)
    if (!idReferido) {
      return res.status(404).json({
        message: 'No se encuentra el referido por código'
      })
    }
  }

  const user = await userController.create(id, email, tempSecret.base32, userRefeerCode)

  if (user.code === 201) {
    if (codigoReferido) {
      userController.createReferee(idReferido, id)
    }

    // Usuario creado. Generamos token
    const token = authController.createToken(tempSecret)

    const sendEmail = await mailController.sendTokenByEmail(email, token)

    if (sendEmail.code === 200) {
      // El mail con el codigo se envia correctamente
      return res.json(sendEmail)
    } else {
      return res.status(sendEmail.code).json(sendEmail)
    }
  } else {
    return res.json(user)
  }
})

// Verificación del usuario creado
app.post('/verify', async (req, res) => {
  const email = req.body.email
  const userToken = req.body.token

  const verifyUser = await userController.verify(email, userToken)

  return res.status(verifyUser.code).json(verifyUser)
})

// Login de usuario
app.post('/login', async (req, res) => {
  const email = req.body.email
  const user = await userController.getUser(email)

  if (user.length === 0) {
    res.json({
      code: 404,
      message: 'El usuario no existe.'
    })
  } else {
    // El usuario existe. Enviamos mail con el token
    const userSecret = user[0].secret

    if (!userSecret) {
      // Si el secret no existe, es usuario no fue validado
      return res.json({
        message: 'El usuario no fue validado aun.'
      })
    }

    const token = authController.createToken(userSecret)

    const sendEmail = await mailController.sendTokenByEmail(email, token)

    if (sendEmail.code === 200) {
      // El mail con el codigo se envia correctamente
      return res.json(sendEmail)
    } else {
      return res.status(sendEmail.code).json(sendEmail)
    }
  }
})

// Verificacion del login de usuario
app.post('/verify_login', async (req, res) => {
  const email = req.body.email
  const userToken = req.body.token

  const verifyUser = await userController.verifyLogin(email, userToken)

  if (verifyUser.code === 200) {
    req.session.userEmail = email
  }

  return res.status(verifyUser.code).json(verifyUser)
})

app.get('/', (req, res) => {
  const email = req.session.userEmail
  if (email) {
    res.send(`Logeado como ${email}`)
  } else {
    res.send('Not logged in')
  }
})

// Elimina la sesion creada para el usuario
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Error haciendo el logout' })
    }

    res.json({ message: 'Logged out!' })
  })
})
// Configuración de multer para gestionar la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directorio donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Renombrar archivos con la fecha actual
  }
});

const upload = multer({ storage });

// Ruta POST para manejar la solicitud de publicación de servicios
app.post('/api/services', upload.single('image'), (req, res) => {
  const { availableDates, country, price, section } = req.body;
  const image = req.file.filename;

  // Insertar los datos en la base de datos utilizando la conexión configurada en dbConfig.js
  const sql = 'INSERT INTO servicios (imagen, fechas_disponibles, pais, precio, seccion) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [image, availableDates, country, price, section], (err, result) => {
    if (err) {
      console.error('Error inserting service into database:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Servicio añadido a la base de datos');
    res.json({ message: 'Servicio publicado correctamente' });
  });
});

app.listen(port, () => {
  console.log(`App is running on PORT: ${port}.`)
})
