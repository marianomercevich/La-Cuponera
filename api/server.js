const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig');
const multer = require("multer");
const path = require('path');
const app = express()
const port = 9000
const crypto = require('crypto');
const mercadopago = require("mercadopago");

// Asignar el token de acceso directamente
mercadopago.access_token = "Api-key";

app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const secretKey = '07902df9221790375c6f5a1fa8c85c3a9d5915fe29999ad85443800c1138f259';
const sessionSecretKey = crypto.randomBytes(64).toString('hex');
const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000,
  createDatabaseTable: true,
  connectionLimit: 1,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, db);

app.post("/api/pay", (req, res) => {
  let preference = {
    items: [
      {
        title: req.body.description,
        unit_price: Number(req.body.price),
        quantity: Number(req.body.quantity),
      }
    ],
    back_urls: {
      "success": "http://localhost:9080/feedback",
      "failure": "http://localhost:9080/feedback",
      "pending": "http://localhost:9080/feedback"
    },
    auto_return: "approved",
  };

  mercadopago.preferences.create(preference)
    .then(function (response) {
      res.json({
        id: response.body.id
      });
    }).catch(function (error) {
      console.log(error);
    });
});

app.get('/feedback', function (req, res) {
  res.json({
    Payment: req.query.payment_id,
    Status: req.query.status,
    MerchantOrder: req.query.merchant_order_id
  });
});

app.use(session({
  secret: sessionSecretKey,
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));

// Endpoint de registro de usuario
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el correo electrónico ya existe en la base de datos
    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Generar un ID único para el nuevo usuario
    const id = uuidv4();

    // Insertar el usuario en la base de datos con el ID único generado
    await db.query('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', [id, email, password]);
    
    res.json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});


// Endpoint de inicio de sesión
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario en la base de datos
    const [results] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

    if (results.length === 1) {
      // Generar un token
      const token = jwt.sign({ userId: results[0].id }, secretKey);
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('Error al buscar el usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});


// Endpoint protegido
app.get('/recurso-protegido', verifyToken, (req, res) => {
  res.json({ message: 'Bienvenido, usuario autenticado' });
});


// Middleware para verificar el token en las solicitudes protegidas
async function verifyToken(req, res, next) {
  // Obtén el token del encabezado Authorization
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verifica el token
    const decoded = jwt.verify(token, secretKey);
    req.userId = decoded.userId;

    // Pasar al siguiente middleware
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido' });
  }
}

app.get('/', (req, res) => {
  const email = req.session.userEmail
  if (email) {
    res.send(`Logeado como ${email}`)
  } else {
    res.send('Not logged in')
  }
})


// Endpoint de logout
app.post('/logout', (req, res) => {
  // Eliminar el token de sesión del almacenamiento en el servidor
  // Por ejemplo, si estás utilizando variables de sesión
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      res.status(500).json({ message: 'Error al cerrar sesión' });
    } else {
      // Envía una respuesta al cliente indicando que la sesión se ha cerrado correctamente
      res.json({ message: 'Sesión cerrada exitosamente' });
    }
  });
});


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
// Endpoint POST para recibir la imagen y otros datos y almacenarlos en la base de datos (Blog)
app.post('/Ticket', upload.single('img'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
  }

  const { titulo, descripcion, Subtitulo } = req.body;
  const imgPath = req.file.path;

  const sql = 'INSERT INTO blog (titulo, img, descripcion, Subtitulo) VALUES (?, ?, ?, ?)';
  db.execute(sql, [titulo, imgPath, descripcion, Subtitulo], (err, result) => {
    if (err) {
      console.error('Error al insertar el blog:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Blog insertado correctamente');
    res.status(200).json({ message: 'Blog insertado correctamente' });
  });
});

// Endpoint GET para obtener los datos almacenados y enviarlos al cliente
app.get('/Ticket', (req, res) => {
  const sql = 'SELECT * FROM blog';
  db.execute(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener los blog:', err);
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

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});