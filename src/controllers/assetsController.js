
import { consultarAssets, insertarAsset, actualizarAsset, eliminarAsset } from '../models/Assets.js';

// Obtener todos los activos
const obtenerAssets = (req, res) => {
  consultarAssets((error, results) => {
    if (error) {
      console.error('Error al obtener activos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
};

// Subir un nuevo activo
const subirAsset = (req, res) => {
  const nuevoAsset = req.body;

  // Validar que los datos obligatorios estén presentes
  if (!nuevoAsset.nombre || !nuevoAsset.tipo) {
    return res.status(400).json({ error: 'Debe proporcionar nombre y tipo para el activo' });
  }

  insertarAsset(nuevoAsset, (error, results) => {
    if (error) {
      console.error('Error al subir activo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(201).json(results);
    }
  });
};

// Actualizar un activo existente
const cambiarAsset = (req, res) => {
  const idAsset = req.params.id;
  const datosActualizados = req.body;

  // Validar que los datos obligatorios estén presentes para la actualización
  if (!datosActualizados.nombre && !datosActualizados.tipo) {
    return res.status(400).json({ error: 'Debe proporcionar nombre o tipo para actualizar el activo' });
  }

  actualizarAsset(idAsset, datosActualizados, (error, results) => {
    if (error) {
      console.error('Error al actualizar activo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
};

// Eliminar un activo existente
const sacarAsset = (req, res) => {
  const idAsset = req.params.id;

  eliminarAsset(idAsset, (error, results) => {
    if (error) {
      console.error('Error al eliminar activo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
};

export { obtenerAssets, subirAsset, cambiarAsset, sacarAsset };
