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
const multer = require("multer")
const path = require('path');
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


// Configuración de multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Usa path.extname para obtener la extensión del archivo
  }
});

const upload = multer({ storage: storage });
// Endpoint POST para recibir la imagen y otros datos y almacenarlos en la base de datos
app.post('/imagen', upload.single('img'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
  }

  const { titulo, descripcion, price } = req.body;
  const imgPath = req.file.path;

  const sql = 'INSERT INTO productos (titulo, img, descripcion, price) VALUES (?, ?, ?, ?)';
  db.query(sql, [titulo, imgPath, descripcion, price], (err, result) => {
    if (err) {
      console.error('Error al insertar el producto:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Producto insertado correctamente');
    res.status(200).json({ message: 'Producto insertado correctamente' });
  });
});

// Endpoint GET para obtener los datos almacenados y enviarlos al cliente
app.get('/productos', (req, res) => {
  const sql = 'SELECT * FROM productos';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener los productos:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Servir archivos estáticos desde la carpeta de 'uploads'
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

app.put('/productos/:id', upload.single('newImage'), (req, res) => {
  const productId = req.params.id;
  const { titulo, descripcion, price } = req.body;
  const newImage = req.file;

  // Verificar la existencia del producto
  const sqlCheckProduct = 'SELECT * FROM productos WHERE id = ?';
  db.query(sqlCheckProduct, [productId], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error al verificar el producto:', checkErr);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    if (checkResult.length === 0) {
      return res.status(404).json({ error: 'El producto no fue encontrado' });
    }

    // Realizar la actualización en la base de datos
    let sqlUpdateProduct;
    let paramsToUpdate;

    if (newImage) {
      // Si se proporciona una nueva imagen, actualizarla junto con otros datos
      sqlUpdateProduct = 'UPDATE productos SET titulo = ?, descripcion = ?, price = ?, img = ? WHERE id = ?';
      paramsToUpdate = [titulo, descripcion, price, newImage.path, productId];
    } else {
      // Si no se proporciona una nueva imagen, mantener la imagen existente y actualizar otros datos
      sqlUpdateProduct = 'UPDATE productos SET titulo = ?, descripcion = ?, price = ? WHERE id = ?';
      paramsToUpdate = [titulo, descripcion, price, productId];
    }

    db.query(sqlUpdateProduct, paramsToUpdate, (updateErr, updateResult) => {    
      if (updateErr) {
        console.error('Error al editar el producto:', updateErr);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      console.log('Producto editado correctamente');
      res.status(200).json({ message: 'Producto editado correctamente' });
    });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});