const express = require('express');
const bodyParser = require('body-parser');
const speakeasy = require('speakeasy');
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


app.use(cors()) // Habilita el middleware de CORS
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
const secretKey = '07902df9221790375c6f5a1fa8c85c3a9d5915fe29999ad85443800c1138f259';
const sessionSecretKey = crypto.randomBytes(64).toString('hex');
const sessionStore = new MySQLStore({
  clearExpired: true,
  checkExpirationInterval: 900000, // Tiempo de intervalo en milisegundos (15 minutos)
  expiration: 86400000, // Duración de la sesión en milisegundos (1 día)
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
}, db); // Pasa la conexión de base de datos aquí

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
app.post('/blog', upload.single('img'), (req, res) => {
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
app.get('/blog', (req, res) => {
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

//Price-Hotel.jsx
// Endpoint POST para agregar una entrada
app.post('/PriceHotel', (req, res) => {
  const { priceDay, stars, reviews, cantNights, serviceCharge } = req.body;

  const Total = priceDay * cantNights;
  const TotalFull = Total + serviceCharge;

  const sql = 'INSERT INTO pricehotel (priceDay, stars, reviews, cantNights, serviceCharge, Total, TotalFull) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.execute(sql, [priceDay, stars, reviews, cantNights, serviceCharge, Total, TotalFull])
    .then(() => {
      console.log('Datos insertados correctamente');
      res.status(200).json({ message: 'Datos insertados correctamente' });
    })
    .catch((err) => {
      console.error('Error al insertar los datos:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    });
});

// Endpoint GET para obtener los datos almacenados y enviarlos al cliente
app.get('/PriceHotel', (req, res) => {
  const sql = 'SELECT * FROM pricehotel';
  db.execute(sql)
  .then(results => {
    res.status(200).json(results[0]);
  })
  .catch(err => {
    console.error('Error al obtener los blog:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

});

//Room-Rates-jsx
// Endpoint POST para agregar tarifas de habitación
app.post('/roomRates', (req, res) => {
  const { minNights, maxNights, priceMonThu, priceFriSun, DescMonth } = req.body;

  const sql = 'INSERT INTO roomrates (minNights, maxNights, priceMonThu, priceFriSun, DescMonth) VALUES (?, ?, ?, ?, ?)';
  db.execute(sql, [minNights, maxNights, priceMonThu, priceFriSun, DescMonth])
    .then(() => {
      console.log('Tarifas de habitación insertadas correctamente');
      res.status(200).json({ message: 'Tarifas de habitación insertadas correctamente' });
    })
    .catch((err) => {
      console.error('Error al insertar las tarifas de habitación:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    });
});

// Endpoint GET para obtener tarifas de habitación
app.get('/roomRates', (req, res) => {
  const sql = 'SELECT * FROM roomrates';
  db.execute(sql)
    .then(results => {
      res.status(200).json(results); // Devuelve solo 'results'
    })
    .catch(err => {
      console.error('Error al obtener las tarifas de habitación:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    });
});


//Titulo.Hotel.jsx
// Endpoint POST para agregar información del hotel
app.post('/tituloHotel', (req, res) => {
  const { Title, stars, ubicacion, reviews, NombreProp, cantPerson, cantBeds, cantBaths } = req.body;

  const sql = 'INSERT INTO titulohotel (Title, stars, ubicacion, reviews, NombreProp, cantPerson, cantBeds, cantBaths) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.execute(sql, [Title, stars, ubicacion, reviews, NombreProp, cantPerson, cantBeds, cantBaths], (err, result) => {
    if (err) {
      console.error('Error al insertar la información del hotel:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información del hotel insertada correctamente');
    res.status(200).json({ message: 'Información del hotel insertada correctamente' });
  });
});
// Endpoint GET para obtener información del hotel
app.get('/tituloHotel', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM titulohotel');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener la información del hotel:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//Price-Car.jsx
// Endpoint POST para agregar información de precios de coches
app.post('/priceCar', (req, res) => {
  const { pricDay, stars, reviews, cantDays } = req.body;

  const Total = pricDay * cantDays;

  const sql = 'INSERT INTO pricecar (pricday, stars, reviews, cantDays, Total) VALUES (?, ?, ?, ?, ?)';
  db.execute(sql, [pricDay, stars, reviews, cantDays, Total], (err, result) => {
    if (err) {
      console.error('Error al insertar la información de precios de coches:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información de precios de coches insertada correctamente');
    res.status(200).json({ message: 'Información de precios de coches insertada correctamente' });
  });
});
// Endpoint GET para obtener información de precios de coches
app.get('/priceCar', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM pricecar');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener la información de precios de coches:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//Pickup
// Endpoint POST para agregar información de recogida de automóviles
app.post('/pickup', (req, res) => {
  const { DatePick, DateDrop, LocationPick, LocationDrop } = req.body;

  const sql = 'INSERT INTO pickup (DatePick, DateDrop, LocationPick, LocationDrop) VALUES (?, ?, ?, ?)';
  db.execute(sql, [DatePick, DateDrop, LocationPick, LocationDrop], (err, result) => {
    if (err) {
      console.error('Error al insertar la información de recogida de automóviles:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información de recogida de automóviles insertada correctamente');
    res.status(200).json({ message: 'Información de recogida de automóviles insertada correctamente' });
  });
});
// Endpoint GET para obtener información de recogida de automóviles
app.get('/pickup', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM pickup');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener la información de recogida de automóviles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



//Parameters
// Endpoint POST para agregar parámetros de automóviles
app.post('/parameters', (req, res) => {
  const { velocidad, Motor, Audio, Lights, Prop1, Prop2, Prop3, Prop4 } = req.body;

  const sql = 'INSERT INTO parameters (velocidad, Motor, Audio, Lights, Prop1, Prop2, Prop3, Prop4) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.execute(sql, [velocidad, Motor, Audio, Lights, Prop1, Prop2, Prop3, Prop4], (err, result) => {
    if (err) {
      console.error('Error al insertar los parámetros de automóviles:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Parámetros de automóviles insertados correctamente');
    res.status(200).json({ message: 'Parámetros de automóviles insertados correctamente' });
  });
});
// Endpoint GET para obtener parámetros de automóviles
app.get('/parameters', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM parameters');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener los parámetros de automóviles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


//Owner
// Endpoint POST para agregar información del propietario del auto
app.post('/owner', (req, res) => {
  const { TitleCar, stars, reviews, location, Propiet, Seats, claseAuto, Baul } = req.body;

  const sql = 'INSERT INTO owner (TitleCar, stars, reviews, location, Propiet, Seats, claseAuto, Baul) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.execute(sql, [TitleCar, stars, reviews, location, Propiet, Seats, claseAuto, Baul], (err, result) => {
    if (err) {
      console.error('Error al insertar la información del propietario del auto:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información del propietario del auto insertada correctamente');
    res.status(200).json({ message: 'Información del propietario del auto insertada correctamente' });
  });
});
// Endpoint GET para obtener información del propietario del auto
app.get('/owner', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM owner');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener la información del propietario del auto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//infoKnow
// Endpoint POST para agregar información en la tabla infoKnow
app.post('/infoKnow', (req, res) => {
  const { InfoCancelPolicy, InfoSpecial } = req.body;

  const sql = 'INSERT INTO infoknow (InfoCancelPolicy, InfoSpecial) VALUES (?, ?)';
  db.execute(sql, [InfoCancelPolicy, InfoSpecial], (err, result) => {
    if (err) {
      console.error('Error al insertar la información en la tabla infoKnow:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información insertada correctamente en la tabla infoKnow');
    res.status(200).json({ message: 'Información insertada correctamente en la tabla infoKnow' });
  });
});
// Endpoint GET para obtener información de la tabla infoKnow
app.get('/infoKnow', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM infoknow');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener la información de la tabla infoKnow:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

//description
// Endpoint POST para agregar información en la tabla Description
app.post('/Description', (req, res) => {
  const { carDescrip, carInfo } = req.body;

  const sql = 'INSERT INTO description (carDescrip, carInfo) VALUES (?, ?)';
  db.execute(sql, [carDescrip, carInfo], (err, result) => {
    if (err) {
      console.error('Error al insertar la información en la tabla Description:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información insertada correctamente en la tabla Description');
    res.status(200).json({ message: 'Información insertada correctamente en la tabla Description' });
  });
});
// Endpoint GET para obtener información de la tabla Description
app.get('/Description', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM description');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener la información de la tabla Description:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Endpoint POST para agregar información del carrusel
app.post('/carousel', (req, res) => {
  const { ubicacion, tituEvent, precio, stars, reviews } = req.body;

  const sql = 'INSERT INTO carousel (ubicacion, tituEvent, precio, stars, reviews) VALUES (?, ?, ?, ?, ?)';
  db.execute(sql, [ubicacion, tituEvent, precio, stars, reviews], (err, result) => {
    if (err) {
      console.error('Error al insertar la información del carrusel:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información del carrusel insertada correctamente');
    res.status(200).json({ message: 'Información del carrusel insertada correctamente' });
  });
});
// Endpoint GET para obtener información del carrusel
app.get('/carousel', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM carousel');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener la información del carrusel:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/search/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const updatedData = req.body;
    let sql;
    let paramsToUpdate;

    switch (table) {
    case 'blog':
      const { titulo, descripcion, Subtitulo } = updatedData;
      sql = 'UPDATE blog SET titulo = ?, descripcion = ?, Subtitulo = ? WHERE id = ?';
      paramsToUpdate = [titulo, descripcion, Subtitulo, id];
      break;

    case 'PriceHotel':
      const { priceDay, starsPriceHotel, reviewsPriceHotel, cantNights, serviceCharge } = updatedData;
      const TotalPriceHotel = priceDay * cantNights;
      const TotalFullPriceHotel = TotalPriceHotel + serviceCharge;
      sql = 'UPDATE pricehotel SET priceDay = ?, stars = ?, reviews = ?, cantNights = ?, serviceCharge = ?, Total = ?, TotalFull = ? WHERE id = ?';
      paramsToUpdate = [priceDay, starsPriceHotel, reviewsPriceHotel, cantNights, serviceCharge, TotalPriceHotel, TotalFullPriceHotel, id];
      break;

    case 'roomRates':
      const { minNightsRoomRates, maxNightsRoomRates, priceMonThu, priceFriSun, DescMonth } = updatedData;
      sql = 'UPDATE roomrates SET minNights = ?, maxNights = ?, priceMonThu = ?, priceFriSun = ?, DescMonth = ? WHERE id = ?';
      paramsToUpdate = [minNightsRoomRates, maxNightsRoomRates, priceMonThu, priceFriSun, DescMonth, id];
      break;

    case 'tituloHotel':
      const { Title, starsTituloHotel, ubicacion, reviewsTituloHotel, NombreProp, cantPerson, cantBeds, cantBaths } = updatedData;
      sql = 'UPDATE titulohotel SET Title = ?, stars = ?, ubicacion = ?, reviews = ?, NombreProp = ?, cantPerson = ?, cantBeds = ?, cantBaths = ? WHERE id = ?';
      paramsToUpdate = [Title, starsTituloHotel, ubicacion, reviewsTituloHotel, NombreProp, cantPerson, cantBeds, cantBaths, id];
      break;

    case 'priceCar':
      const { pricDay, starsPriceCar, reviewsPriceCar, cantDays } = updatedData;
      const TotalPriceCar = pricDay * cantDays;
      sql = 'UPDATE pricecar SET pricDay = ?, stars = ?, reviews = ?, cantDays = ?, Total = ? WHERE id = ?';
      paramsToUpdate = [pricDay, starsPriceCar, reviewsPriceCar, cantDays, TotalPriceCar, id];
      break;

    case 'pickup':
      const { DatePick, DateDrop, LocationPick, LocationDrop } = updatedData;
      sql = 'UPDATE pickup SET DatePick = ?, DateDrop = ?, LocationPick = ?, LocationDrop = ? WHERE id = ?';
      paramsToUpdate = [DatePick, DateDrop, LocationPick, LocationDrop, id];
      break;

    case 'parameters':
      const { velocidad, Motor, Audio, Lights, Prop1, Prop2, Prop3, Prop4 } = updatedData;
      sql = 'UPDATE parameters SET velocidad = ?, Motor = ?, Audio = ?, Lights = ?, Prop1 = ?, Prop2 = ?, Prop3 = ?, Prop4 = ? WHERE id = ?';
      paramsToUpdate = [velocidad, Motor, Audio, Lights, Prop1, Prop2, Prop3, Prop4, id];
      break;

    case 'owner':
      const { TitleCar, starsOwner, reviewsOwner, location, Propiet, Seats, claseAuto, Baul } = updatedData;
      sql = 'UPDATE owner SET TitleCar = ?, stars = ?, reviews = ?, location = ?, Propiet = ?, Seats = ?, claseAuto = ?, Baul = ? WHERE id = ?';
      paramsToUpdate = [TitleCar, starsOwner, reviewsOwner, location, Propiet, Seats, claseAuto, Baul, id];
      break;

    case 'infoKnow':
      const { InfoCancelPolicy, InfoSpecial } = updatedData;
      sql = 'UPDATE infoknow SET InfoCancelPolicy = ?, InfoSpecial = ? WHERE id = ?';
      paramsToUpdate = [InfoCancelPolicy, InfoSpecial, id];
      break;

    case 'Description':
      const { carDescrip, carInfo } = updatedData;
      sql = 'UPDATE description SET carDescrip = ?, carInfo = ? WHERE id = ?';
      paramsToUpdate = [carDescrip, carInfo, id];
      break;

    case 'carousel':
      const { ubicacionCarousel, tituEvent, precio, starsCarousel, reviewsCarousel } = updatedData;
      sql = 'UPDATE carousel SET ubicacion = ?, tituEvent = ?, precio = ?, stars = ?, reviews = ? WHERE id = ?';
      paramsToUpdate = [ubicacionCarousel, tituEvent, precio, starsCarousel, reviewsCarousel, id];
      break;

    default:
      return res.status(404).json({ error: 'Tabla no encontrada' });
  }
  paramsToUpdate = paramsToUpdate.map(value => (value !== undefined ? value : null));

  const [rows, fields] = await db.execute(sql, paramsToUpdate);
    console.log('Datos actualizados correctamente');
    res.status(200).json({ message: 'Datos actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar los datos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});