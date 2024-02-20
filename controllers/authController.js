const db = require('../config/dbConfig')
const nodemailer = require('../config/nodemailrConfig')
const speakeasy = require('speakeasy')
const uuid = require('uuid')

const authController = {}

authController.createToken = (secret) => {
  return speakeasy.totp({
    secret: secret.base32,
    encoding: 'base32'
  })
}

// Controlador para registrar un usuario
authController.register = (req, res) => {
  const id = uuid.v4()
  try {
    const email = req.body.email
    const path = `/user/${id}`

    // Generar una clave secreta temporal con Speakeasy
    const temp_secret = speakeasy.generateSecret()

    // Crear un usuario en la base de datos
    const sql = 'INSERT INTO users (id, email, temp_secret) VALUES (?, ?, ?)'
    db.query(sql, [id, email, temp_secret.base32], (err, result) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ message: 'Error registrando usuario' })
      }

      // Enviar un correo electrónico con la clave secreta temporal al usuario
      const mailOptions = {
        from: 'pruebastechct@gmail.com', // Cambia esto a tu dirección de correo electrónico
        to: email,
        subject: 'Registro exitoso',
        text: `Tu registro ha sido exitoso. Aquí está tu clave secreta temporal: ${temp_secret.base32}`
      }

      nodemailer.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error al enviar el correo electrónico: ' + error)
          res.status(500).json({ message: 'Error al enviar el correo electrónico' })
        } else {
          console.log('Correo electrónico enviado: ' + info.response)
          res.json({ id, secret: temp_secret.base32 })
        }
      })
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error generando clave secreta' })
  }
}

// Controlador para verificar el código TOTP
authController.verify = (req, res) => {
  const { userId, token } = req.body
  const path = `/user/${userId}`

  db.query('SELECT temp_secret FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ message: 'Error recuperando clave secreta' })
    }

    const secret = results[0].temp_secret
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token
    })

    if (verified) {
      // Actualizar la clave secreta en la base de datos
      const sql = 'UPDATE users SET secret = ?, temp_secret = NULL WHERE id = ?'
      db.query(sql, [secret, userId], (err, result) => {
        if (err) {
          console.error(err)
          return res.status(500).json({ message: 'Error actualizando clave secreta' })
        }

        res.json({ verified: true })
      })
    } else {
      res.json({ verified: false })
    }
  })
}

module.exports = authController
