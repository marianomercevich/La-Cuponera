// Funciones para la tabla cupon_img

// Consultar todas las imagenes de cupones
const consultarCupon = async () => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM Cupon_img');
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error al consultar logos:', error);
    throw error;
  }
};

// Insertar un nueva img de cupon
const insertarCupon = async (nombre, imagen, descripcion) => {
  try {
    const connection = await getConnection();
    const query = 'INSERT INTO Cupon_img (nombre, imagen, descripcion, id_vendedor) VALUES (?, ?, ?)';
    const [result] = await connection.query(query, [nombre, imagen, descripcion, id_vendedor]);
    connection.release();
    return result.insertId;
  } catch (error) {
    console.error('Error al insertar imagen de cupon:', error);
    throw error;
  }
};

// Actualizar un Cupon existente
const actualizarCupon = async (id, nombre, imagen, descripcion,id_vendedor) => {
  try {
    const connection = await getConnection();
    const query = 'UPDATE Cupon_img SET nombre = ?, imagen = ?, descripcion = ?, id_vendedor = ?, WHERE id = ?';
    const [result] = await connection.query(query, [nombre, imagen, descripcion, id, id_vendedor]);
    connection.release();
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al actualizar imagen de cupon:', error);
    throw error;
  }
};

// Eliminar un logo existente
const eliminarCupon = async (id) => {
  try {
    const connection = await getConnection();
    const query = 'DELETE FROM Cupon_img WHERE id = ?';
    const [result] = await connection.query(query, idLogo);
    connection.release();
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al eliminar imagen de cupon:', error);
    throw error;
  }
};

export {
  consultarCupon, insertarCupon, actualizarCupon, eliminarCupon,

};
