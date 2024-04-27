const db = require('../config/dbConfig.js')
const speakeasy = require('speakeasy')
const util = require('util')

const query = util.promisify(db.query).bind(db)

const userController = {}
const result = {}

// Controler para crear usuario
userController.create = async (id, email, tempSecret, codigoReferido) => {
  try {
    const user = await userController.getUser(email)

    if (user.length === 0) {
      // Usuario no existe. Se crea en la db
      const createUserQuery = 'INSERT INTO users (id, email, temp_secret, codigo_referido) VALUES (?, ?, ?, ?)'

      const createdUser = await query(createUserQuery, [id, email, tempSecret, codigoReferido])

      if (createdUser) {
        result.code = 201
        result.message = 'Usuario creado en la db.'
        return result
      } else {
        result.code = 500
        result.message = 'Error creando el usuario en la db.'
        return result
      }
    } else {
      // El usuario ya existe. No se crea
      result.code = 204
      result.message = 'El usuario ya existe.'
      return result
    }
  } catch (error) {
    result.code = 500
    result.message = 'Error al crear el usuario en la db.'

    error.sqlMessage
      ? result.error = error.sqlMessage
      : result.error = error

    return result
  }
}

// Controler para obtener usuario por email
userController.getUser = async (email) => {
  const getUserSql = 'SELECT * FROM users WHERE email = ?'
  const user = await query(getUserSql, email)
  return user
}

// Controler para obtener id del usuario que refiere por email
userController.getUserByReferee = async (codigoReferido) => {
  const getUserSql = 'SELECT * FROM users WHERE codigo_referido = ?'
  const referido = await query(getUserSql, codigoReferido)
  let idReferido

  if (referido.length !== 0) {
    idReferido = referido[0].id
  }

  return idReferido
}

// Controlador para validar un token TOTP
userController.verify = async (email, token) => {
  try {
    const user = await userController.getUser(email)

    if (user.length === 0) {
      // El usuario no existe
      result.code = 404
      result.message = 'El usuario no existe.'
      return result
    } else {
      // El usuario existe
      const userTempSecret = user[0].temp_secret

      if (!userTempSecret) {
        // Si no existe el temp_secret, el usuario ya se valido
        result.code = 200
        result.message = 'El usuario ya se encuentra validado'
        return result
      }

      // Realiza la verificación del código TOTP
      const verified = speakeasy.totp.verify({
        secret: userTempSecret,
        encoding: 'base32',
        token,
        window: 5
      })

      if (verified) {
        const updateSql = 'UPDATE users SET secret = ?, temp_secret = NULL WHERE email = ?'
        const update = await query(updateSql, [userTempSecret, email])

        if (update) {
          result.code = 200
          result.message = 'Usuario validado correctamente.'
          return result
        }
      } else {
        result.code = 401
        result.message = 'No se pudo validar el usuario correctamente'
        return result
      }
    }
  } catch (error) {
    result.code = 500
    result.message = 'Error al validar el usuario.'
    result.error = error
    return result
  }
}

userController.verifyLogin = async (email, token) => {
  try {
    const user = await userController.getUser(email)

    if (user.length === 0) {
      // El usuario no existe
      result.code = 404
      result.message = 'El usuario no existe.'
      return result
    } else {
      // El usuario existe
      const userSecret = user[0].secret

      if (!userSecret) {
        // Si el usuario no tiene el secret actualizado, no fue validado correctamente.
        result.code = 401
        result.message = 'El usuario no fue validado correctamente'
        return result
      }

      // Realiza la verificación del código TOTP
      const verified = speakeasy.totp.verify({
        secret: userSecret.base32,
        encoding: 'base32',
        token,
        window: 5
      })

      if (verified) {
        result.code = 200
        result.message = 'Usuario logeado correctamente.'
        return result
      } else {
        result.code = 401
        result.message = 'No se pudo validar el usuario correctamente'
        return result
      }
    }
  } catch (error) {
    result.code = 500
    result.message = 'Error al validar el usuario.'
    result.error = error
    return result
  }
}

// Metodo que crea la relacion entre un usuario y quien lo refirio
userController.createReferee = async (user, referee) => {
  try {
    const createReferee = 'INSERT INTO referidos (user, referido) VALUES (?, ?)'

    const createdReferee = await query(createReferee, [user, referee])

    console.log(createdReferee)
  } catch (error) {
    result.code = 500
    result.message = 'Error al crear el referido en la db.'

    error.sqlMessage
      ? result.error = error.sqlMessage
      : result.error = error

    return result
  }
}

userController.generateRefereeCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let code = ''

  for (let i = 0; i < 15; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }

  return code
}

module.exports = userController
