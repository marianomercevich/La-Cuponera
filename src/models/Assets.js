// asset.js

import { getConnection } from '../config/database.js';

// Funciones para la tabla logo

// Consultar todos los logos
const consultarLogos = async () => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM logo');
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error al consultar logos:', error);
    throw error;
  }
};

// Insertar un nuevo logo
const insertarLogo = async (nombre, imagen, descripcion) => {
  try {
    const connection = await getConnection();
    const query = 'INSERT INTO logo (nombre, imagen, descripcion) VALUES (?, ?, ?)';
    const [result] = await connection.query(query, [nombre, imagen, descripcion]);
    connection.release();
    return result.insertId;
  } catch (error) {
    console.error('Error al insertar logo:', error);
    throw error;
  }
};

// Actualizar un logo existente
const actualizarLogo = async (idLogo, nombre, imagen, descripcion) => {
  try {
    const connection = await getConnection();
    const query = 'UPDATE logo SET nombre = ?, imagen = ?, descripcion = ? WHERE id = ?';
    const [result] = await connection.query(query, [nombre, imagen, descripcion, idLogo]);
    connection.release();
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al actualizar logo:', error);
    throw error;
  }
};

// Eliminar un logo existente
const eliminarLogo = async (idLogo) => {
  try {
    const connection = await getConnection();
    const query = 'DELETE FROM logo WHERE id = ?';
    const [result] = await connection.query(query, idLogo);
    connection.release();
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al eliminar logo:', error);
    throw error;
  }
};

// Funciones para la tabla portada

// Consultar todas las portadas
const consultarPortadas = async () => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM portada');
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error al consultar portadas:', error);
    throw error;
  }
};

// Insertar una nueva portada
const insertarPortada = async (nombre, imagen, descripcion) => {
  try {
    const connection = await getConnection();
    const query = 'INSERT INTO portada (nombre, imagen, descripcion) VALUES (?, ?, ?)';
    const [result] = await connection.query(query, [nombre, imagen, descripcion]);
    connection.release();
    return result.insertId;
  } catch (error) {
    console.error('Error al insertar portada:', error);
    throw error;
  }
};

// Actualizar una portada existente
const actualizarPortada = async (idPortada, nombre, imagen, descripcion) => {
  try {
    const connection = await getConnection();
    const query = 'UPDATE portada SET nombre = ?, imagen = ?, descripcion = ? WHERE id = ?';
    const [result] = await connection.query(query, [nombre, imagen, descripcion, idPortada]);
    connection.release();
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al actualizar portada:', error);
    throw error;
  }
};

// Eliminar una portada existente
const eliminarPortada = async (idPortada) => {
  try {
    const connection = await getConnection();
    const query = 'DELETE FROM portada WHERE id = ?';
    const [result] = await connection.query(query, idPortada);
    connection.release();
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al eliminar portada:', error);
    throw error;
  }
};

// Funciones para la tabla videos

// Consultar todos los videos
const consultarVideos = async () => {
  try {
    const connection = await getConnection();
    const [rows] = await connection.query('SELECT * FROM videos');
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error al consultar videos:', error);
    throw error;
  }
};

// Insertar un nuevo video
const insertarVideo = async (nombre, video, descripcion) => {
  try {
    const connection = await getConnection();
    const query = 'INSERT INTO videos (nombre, video, descripcion) VALUES (?, ?, ?)';
    const [result] = await connection.query(query, [nombre, video, descripcion]);
    connection.release();
    return result.insertId;
  } catch (error) {
    console.error('Error al insertar video:', error);
    throw error;
  }
};

// Actualizar un video existente
const actualizarVideo = async (idVideo, nombre, video, descripcion) => {
  try {
    const connection = await getConnection();
    const query = 'UPDATE videos SET nombre = ?, video = ?, descripcion = ? WHERE id = ?';
    const [result] = await connection.query(query, [nombre, video, descripcion, idVideo]);
    connection.release();
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al actualizar video:', error);
    throw error;
  }
};

// Eliminar un video existente
const eliminarVideo = async (idVideo) => {
  try {
    const connection = await getConnection();
    const query = 'DELETE FROM videos WHERE id = ?';
    const [result] = await connection.query(query, idVideo);
    connection.release();
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error al eliminar video:', error);
    throw error;
  }
};

export {
  consultarLogos, insertarLogo, actualizarLogo, eliminarLogo,
  consultarPortadas, insertarPortada, actualizarPortada, eliminarPortada,
  consultarVideos, insertarVideo, actualizarVideo, eliminarVideo
};

