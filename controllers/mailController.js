const transporter = require('../config/nodemailrConfig')

const mailController = {}
const result = {}

mailController.sendTokenByEmail = async (email, token) => {
  const mailOptions = {
    from: 'pruebastechct@gmail.com',
    to: email,
    subject: 'Código de verificación',
    text: `Tu código de verificación es: ${token}`
  }

  const send = await transporter.sendMail(mailOptions)

  if (send) {
    result.code = 200
    result.message = 'Email enviado correctamente.'
    return result
  } else {
    result.code = 500
    result.message = 'Error enviando el email.'
    return result
  }
}

module.exports = mailController
