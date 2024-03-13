const express = require('express')
const bodyParser = require('body-parser')
const speakeasy = require('speakeasy')
const uuid = require('uuid')
const cors = require('cors')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const jwt = require('jsonwebtoken');
const db = require('../config/dbConfig')
const multer = require("multer")
const path = require('path');
const bcrypt = require('bcrypt');
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
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
  db.query(sql, [email, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error al registrar usuario:', err);
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }
    console.log('Usuario registrado correctamente');
    res.status(200).json({ message: 'Usuario registrado correctamente' });
  });
});

// Endpoint de inicio de sesión
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error al iniciar sesión' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ email: user.email }, 'secret_key', { expiresIn: '1h' });
    res.status(200).json({ token });
  });
});

// Endpoint para obtener token
app.get('/token', (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    res.status(200).json({ email: decoded.email });
  });
});

app.get('/', (req, res) => {
  const email = req.session.userEmail
  if (email) {
    res.send(`Logeado como ${email}`)
  } else {
    res.send('Not logged in')
  }
})

// Elimina la sesion creada para el usuario

// Endpoint de logout
// Endpoint de logout
app.post('/logout', (req, res) => {
  // Destruye la sesión del usuario
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    console.log('Sesión cerrada correctamente');
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
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
  db.query(sql, [titulo, imgPath, descripcion, Subtitulo], (err, result) => {
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
  db.query(sql, (err, results) => {
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

app.put('/blog/:id', upload.single('newImage'), (req, res) => {
  const productId = req.params.id;
  const { titulo, descripcion, Subtitulo } = req.body;
  const newImage = req.file;

  // Verificar la existencia del blog
  const sqlCheckProduct = 'SELECT * FROM blog WHERE id = ?';
  db.query(sqlCheckProduct, [productId], (checkErr, checkResult) => {
    if (checkErr) {
      console.error('Error al verificar el blog:', checkErr);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    if (checkResult.length === 0) {
      return res.status(404).json({ error: 'El blog no fue encontrado' });
    }

    // Realizar la actualización en la base de datos
    let sqlUpdateProduct;
    let paramsToUpdate;

    if (newImage) {
      // Si se proporciona una nueva imagen, actualizarla junto con otros datos
      sqlUpdateProduct = 'UPDATE blog SET titulo = ?, descripcion = ?, Subtitulo = ?, img = ? WHERE id = ?';
      paramsToUpdate = [titulo, descripcion, Subtitulo, newImage.path, productId];
    } else {
      // Si no se proporciona una nueva imagen, mantener la imagen existente y actualizar otros datos
      sqlUpdateProduct = 'UPDATE blog SET titulo = ?, descripcion = ?, Subtitulo = ? WHERE id = ?';
      paramsToUpdate = [titulo, descripcion, Subtitulo, productId];
    }

    db.query(sqlUpdateProduct, paramsToUpdate, (updateErr, updateResult) => {    
      if (updateErr) {
        console.error('Error al editar el blog:', updateErr);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      console.log('blog editado correctamente');
      res.status(200).json({ message: 'blog editado correctamente' });
    });
  });
});



//Price-Hotel.jsx
// Endpoint POST para agregar una entrada
app.post('/PriceHotel', (req, res) => {
  const { priceDay, stars, reviews, cantNights, serviceCharge } = req.body;

  const Total = priceDay * cantNights;
  const TotalFull = Total + serviceCharge;

  const sql = 'INSERT INTO priceHotel (priceDay, stars, reviews, cantNights, serviceCharge, Total, TotalFull) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [priceDay, stars, reviews, cantNights, serviceCharge, Total, TotalFull], (err, result) => {
    if (err) {
      console.error('Error al insertar los datos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Datos insertados correctamente');
    res.status(200).json({ message: 'Datos insertados correctamente' });
  });
});

// Endpoint GET para obtener los datos almacenados y enviarlos al cliente
app.get('/PriceHotel', (req, res) => {
  const sql = 'SELECT * FROM PriceHotel';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener los datos:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});
// Endpoint PUT para actualizar una entrada en PriceHotel
app.put('/PriceHotel/:id', (req, res) => {
  const entryId = req.params.id;
  const { priceDay, stars, reviews, cantNights, serviceCharge } = req.body;

  const Total = priceDay * cantNights;
  const TotalFull = Total + serviceCharge;

  const sql = 'UPDATE priceHotel SET priceDay = ?, stars = ?, reviews = ?, cantNights = ?, serviceCharge = ?, Total = ?, TotalFull = ? WHERE id = ?';
  db.query(sql, [priceDay, stars, reviews, cantNights, serviceCharge, Total, TotalFull, entryId], (err, result) => {
    if (err) {
      console.error('Error al actualizar los datos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Datos actualizados correctamente');
    res.status(200).json({ message: 'Datos actualizados correctamente' });
  });
});

//Room-Rates-jsx
// Endpoint POST para agregar tarifas de habitación
app.post('/roomRates', (req, res) => {
  const { minNights, maxNights, priceMonThu, priceFriSun, DescMonth } = req.body;

  const sql = 'INSERT INTO roomRates (minNights, maxNights, priceMonThu, priceFriSun, DescMonth) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [minNights, maxNights, priceMonThu, priceFriSun, DescMonth], (err, result) => {
    if (err) {
      console.error('Error al insertar las tarifas de habitación:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Tarifas de habitación insertadas correctamente');
    res.status(200).json({ message: 'Tarifas de habitación insertadas correctamente' });
  });
});

// Endpoint GET para obtener tarifas de habitación
app.get('/roomRates', (req, res) => {
  const sql = 'SELECT * FROM roomRates';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener las tarifas de habitación:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Endpoint PUT para actualizar tarifas de habitación
app.put('/roomRates/:id', (req, res) => {
  const roomId = req.params.id;
  const { minNights, maxNights, priceMonThu, priceFriSun, DescMonth } = req.body;

  const sql = 'UPDATE roomRates SET minNights = ?, maxNights = ?, priceMonThu = ?, priceFriSun = ?, DescMonth = ? WHERE id = ?';
  db.query(sql, [minNights, maxNights, priceMonThu, priceFriSun, DescMonth, roomId], (err, result) => {
    if (err) {
      console.error('Error al actualizar las tarifas de habitación:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Tarifas de habitación actualizadas correctamente');
    res.status(200).json({ message: 'Tarifas de habitación actualizadas correctamente' });
  });
});



//Titulo.Hotel.jsx
// Endpoint POST para agregar información del hotel
app.post('/tituloHotel', (req, res) => {
  const { Title, stars, ubicacion, reviews, NombreProp, cantPerson, cantBeds, cantBaths } = req.body;

  const sql = 'INSERT INTO tituloHotel (Title, stars, ubicacion, reviews, NombreProp, cantPerson, cantBeds, cantBaths) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [Title, stars, ubicacion, reviews, NombreProp, cantPerson, cantBeds, cantBaths], (err, result) => {
    if (err) {
      console.error('Error al insertar la información del hotel:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información del hotel insertada correctamente');
    res.status(200).json({ message: 'Información del hotel insertada correctamente' });
  });
});
// Endpoint GET para obtener información del hotel
app.get('/tituloHotel', (req, res) => {
  const sql = 'SELECT * FROM tituloHotel';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener la información del hotel:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});
// Endpoint PUT para actualizar información del hotel
app.put('/tituloHotel/:id', (req, res) => {
  const hotelId = req.params.id;
  const { Title, stars, ubicacion, reviews, NombreProp, cantPerson, cantBeds, cantBaths } = req.body;

  const sql = 'UPDATE tituloHotel SET Title = ?, stars = ?, ubicacion = ?, reviews = ?, NombreProp = ?, cantPerson = ?, cantBeds = ?, cantBaths = ? WHERE id = ?';
  db.query(sql, [Title, stars, ubicacion, reviews, NombreProp, cantPerson, cantBeds, cantBaths, hotelId], (err, result) => {
    if (err) {
      console.error('Error al actualizar la información del hotel:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información del hotel actualizada correctamente');
    res.status(200).json({ message: 'Información del hotel actualizada correctamente' });
  });
});


//Price-Car.jsx
// Endpoint POST para agregar información de precios de coches
app.post('/priceCar', (req, res) => {
  const { pricDay, stars, reviews, cantDays } = req.body;

  const Total = pricDay * cantDays;

  const sql = 'INSERT INTO priceCar (pricDay, stars, reviews, cantDays, Total) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [pricDay, stars, reviews, cantDays, Total], (err, result) => {
    if (err) {
      console.error('Error al insertar la información de precios de coches:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información de precios de coches insertada correctamente');
    res.status(200).json({ message: 'Información de precios de coches insertada correctamente' });
  });
});
// Endpoint GET para obtener información de precios de coches
app.get('/priceCar', (req, res) => {
  const sql = 'SELECT * FROM priceCar';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener la información de precios de coches:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});
// Endpoint PUT para actualizar información de precios de coches
app.put('/priceCar/:id', (req, res) => {
  const carId = req.params.id;
  const { pricDay, stars, reviews, cantDays } = req.body;

  const Total = pricDay * cantDays;

  const sql = 'UPDATE priceCar SET pricDay = ?, stars = ?, reviews = ?, cantDays = ?, Total = ? WHERE id = ?';
  db.query(sql, [pricDay, stars, reviews, cantDays, Total, carId], (err, result) => {
    if (err) {
      console.error('Error al actualizar la información de precios de coches:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información de precios de coches actualizada correctamente');
    res.status(200).json({ message: 'Información de precios de coches actualizada correctamente' });
  });
});


//Pickup
// Endpoint POST para agregar información de recogida de automóviles
app.post('/pickup', (req, res) => {
  const { DatePick, DateDrop, LocationPick, LocationDrop } = req.body;

  const sql = 'INSERT INTO pickup (DatePick, DateDrop, LocationPick, LocationDrop) VALUES (?, ?, ?, ?)';
  db.query(sql, [DatePick, DateDrop, LocationPick, LocationDrop], (err, result) => {
    if (err) {
      console.error('Error al insertar la información de recogida de automóviles:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información de recogida de automóviles insertada correctamente');
    res.status(200).json({ message: 'Información de recogida de automóviles insertada correctamente' });
  });
});
// Endpoint GET para obtener información de recogida de automóviles
app.get('/pickup', (req, res) => {
  const sql = 'SELECT * FROM pickup';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener la información de recogida de automóviles:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});
// Endpoint PUT para actualizar información de recogida de automóviles
app.put('/pickup/:id', (req, res) => {
  const pickupId = req.params.id;
  const { DatePick, DateDrop, LocationPick, LocationDrop } = req.body;

  const sql = 'UPDATE pickup SET DatePick = ?, DateDrop = ?, LocationPick = ?, LocationDrop = ? WHERE id = ?';
  db.query(sql, [DatePick, DateDrop, LocationPick, LocationDrop, pickupId], (err, result) => {
    if (err) {
      console.error('Error al actualizar la información de recogida de automóviles:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información de recogida de automóviles actualizada correctamente');
    res.status(200).json({ message: 'Información de recogida de automóviles actualizada correctamente' });
  });
});


//Parameters
// Endpoint POST para agregar parámetros de automóviles
app.post('/parameters', (req, res) => {
  const { velocidad, Motor, Audio, Lights, Prop1, Prop2, Prop3, Prop4 } = req.body;

  const sql = 'INSERT INTO Parameters (velocidad, Motor, Audio, Lights, Prop1, Prop2, Prop3, Prop4) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [velocidad, Motor, Audio, Lights, Prop1, Prop2, Prop3, Prop4], (err, result) => {
    if (err) {
      console.error('Error al insertar los parámetros de automóviles:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Parámetros de automóviles insertados correctamente');
    res.status(200).json({ message: 'Parámetros de automóviles insertados correctamente' });
  });
});
// Endpoint GET para obtener parámetros de automóviles
app.get('/parameters', (req, res) => {
  const sql = 'SELECT * FROM Parameters';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener los parámetros de automóviles:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});
// Endpoint PUT para actualizar parámetros de automóviles
app.put('/parameters/:id', (req, res) => {
  const paramId = req.params.id;
  const { velocidad, Motor, Audio, Lights, Prop1, Prop2, Prop3, Prop4 } = req.body;

  const sql = 'UPDATE Parameters SET velocidad = ?, Motor = ?, Audio = ?, Lights = ?, Prop1 = ?, Prop2 = ?, Prop3 = ?, Prop4 = ? WHERE id = ?';
  db.query(sql, [velocidad, Motor, Audio, Lights, Prop1, Prop2, Prop3, Prop4, paramId], (err, result) => {
    if (err) {
      console.error('Error al actualizar los parámetros de automóviles:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Parámetros de automóviles actualizados correctamente');
    res.status(200).json({ message: 'Parámetros de automóviles actualizados correctamente' });
  });
});

//Owner
// Endpoint POST para agregar información del propietario del auto
app.post('/owner', (req, res) => {
  const { TitleCar, stars, reviews, location, Propiet, Seats, claseAuto, Baul } = req.body;

  const sql = 'INSERT INTO Owner (TitleCar, stars, reviews, location, Propiet, Seats, claseAuto, Baul) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [TitleCar, stars, reviews, location, Propiet, Seats, claseAuto, Baul], (err, result) => {
    if (err) {
      console.error('Error al insertar la información del propietario del auto:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información del propietario del auto insertada correctamente');
    res.status(200).json({ message: 'Información del propietario del auto insertada correctamente' });
  });
});
// Endpoint GET para obtener información del propietario del auto
app.get('/owner', (req, res) => {
  const sql = 'SELECT * FROM Owner';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener la información del propietario del auto:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});
// Endpoint PUT para actualizar información del propietario del auto
app.put('/owner/:id', (req, res) => {
  const ownerId = req.params.id;
  const { TitleCar, stars, reviews, location, Propiet, Seats, claseAuto, Baul } = req.body;

  const sql = 'UPDATE Owner SET TitleCar = ?, stars = ?, reviews = ?, location = ?, Propiet = ?, Seats = ?, claseAuto = ?, Baul = ? WHERE id = ?';
  db.query(sql, [TitleCar, stars, reviews, location, Propiet, Seats, claseAuto, Baul, ownerId], (err, result) => {
    if (err) {
      console.error('Error al actualizar la información del propietario del auto:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información del propietario del auto actualizada correctamente');
    res.status(200).json({ message: 'Información del propietario del auto actualizada correctamente' });
  });
});
//infoKnow
// Endpoint POST para agregar información en la tabla infoKnow
app.post('/infoKnow', (req, res) => {
  const { InfoCancelPolicy, InfoSpecial } = req.body;

  const sql = 'INSERT INTO infoKnow (InfoCancelPolicy, InfoSpecial) VALUES (?, ?)';
  db.query(sql, [InfoCancelPolicy, InfoSpecial], (err, result) => {
    if (err) {
      console.error('Error al insertar la información en la tabla infoKnow:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información insertada correctamente en la tabla infoKnow');
    res.status(200).json({ message: 'Información insertada correctamente en la tabla infoKnow' });
  });
});
// Endpoint GET para obtener información de la tabla infoKnow
app.get('/infoKnow', (req, res) => {
  const sql = 'SELECT * FROM infoKnow';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener la información de la tabla infoKnow:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});
// Endpoint PUT para actualizar información en la tabla infoKnow
app.put('/infoKnow/:id', (req, res) => {
  const infoKnowId = req.params.id;
  const { InfoCancelPolicy, InfoSpecial } = req.body;

  const sql = 'UPDATE infoKnow SET InfoCancelPolicy = ?, InfoSpecial = ? WHERE id = ?';
  db.query(sql, [InfoCancelPolicy, InfoSpecial, infoKnowId], (err, result) => {
    if (err) {
      console.error('Error al actualizar la información en la tabla infoKnow:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información actualizada correctamente en la tabla infoKnow');
    res.status(200).json({ message: 'Información actualizada correctamente en la tabla infoKnow' });
  });
});
//description
// Endpoint POST para agregar información en la tabla Description
app.post('/Description', (req, res) => {
  const { carDescrip, carInfo } = req.body;

  const sql = 'INSERT INTO Description (carDescrip, carInfo) VALUES (?, ?)';
  db.query(sql, [carDescrip, carInfo], (err, result) => {
    if (err) {
      console.error('Error al insertar la información en la tabla Description:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información insertada correctamente en la tabla Description');
    res.status(200).json({ message: 'Información insertada correctamente en la tabla Description' });
  });
});
// Endpoint GET para obtener información de la tabla Description
app.get('/Description', (req, res) => {
  const sql = 'SELECT * FROM Description';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener la información de la tabla Description:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});
// Endpoint PUT para actualizar información en la tabla Description
app.put('/Description/:id', (req, res) => {
  const descriptionId = req.params.id;
  const { carDescrip, carInfo } = req.body;

  const sql = 'UPDATE Description SET carDescrip = ?, carInfo = ? WHERE id = ?';
  db.query(sql, [carDescrip, carInfo, descriptionId], (err, result) => {
    if (err) {
      console.error('Error al actualizar la información en la tabla Description:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información actualizada correctamente en la tabla Description');
    res.status(200).json({ message: 'Información actualizada correctamente en la tabla Description' });
  });
});
// Endpoint POST para agregar información del carrusel
app.post('/carousel', (req, res) => {
  const { ubicacion, tituEvent, precio, stars, reviews } = req.body;

  const sql = 'INSERT INTO Carousel (ubicacion, tituEvent, precio, stars, reviews) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [ubicacion, tituEvent, precio, stars, reviews], (err, result) => {
    if (err) {
      console.error('Error al insertar la información del carrusel:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información del carrusel insertada correctamente');
    res.status(200).json({ message: 'Información del carrusel insertada correctamente' });
  });
});
// Endpoint GET para obtener información del carrusel
app.get('/carousel', (req, res) => {
  const sql = 'SELECT * FROM Carousel';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener la información del carrusel:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});
// Endpoint PUT para actualizar información del carrusel
app.put('/carousel/:id', (req, res) => {
  const carouselId = req.params.id;
  const { ubicacion, tituEvent, precio, stars, reviews } = req.body;

  const sql = 'UPDATE Carousel SET ubicacion = ?, tituEvent = ?, precio = ?, stars = ?, reviews = ? WHERE id = ?';
  db.query(sql, [ubicacion, tituEvent, precio, stars, reviews, carouselId], (err, result) => {
    if (err) {
      console.error('Error al actualizar la información del carrusel:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    console.log('Información del carrusel actualizada correctamente');
    res.status(200).json({ message: 'Información del carrusel actualizada correctamente' });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});