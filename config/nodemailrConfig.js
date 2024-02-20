const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')

// Configura el transporte de Nodemailer
const transporter = nodemailer.createTransport(
  smtpTransport({
    service: 'Gmail',
    auth: {
      user: 'pruebastechct@gmail.com', // Reemplaza con tu dirección de correo
      pass: 'ntdk osnq xsgm fcwd'
    }
  })
)

module.exports = transporter
