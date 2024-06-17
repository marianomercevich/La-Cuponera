import { consultarLogos, insertarLogo, actualizarLogo, eliminarLogo } from '../models/Logo.js';
import { consultarPortadas, insertarPortada, actualizarPortada, eliminarPortada } from '../models/Portada.js';

// Obtener todos los logos
const obtenerLogos = (req, res) => {
  consultarLogos((error, results) => {
    if (error) {
      console.error('Error al obtener logos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
};

// Subir un nuevo logo
const subirLogo = (req, res) => {
  const nuevoLogo = req.body;

  // Validar que los datos obligatorios estén presentes
  if (!nuevoLogo.nombre || !nuevoLogo.imagen || !nuevoLogo.descripcion || !nuevoLogo.id_vendedor) {
    return res.status(400).json({ error: 'Debe proporcionar nombre, imagen, descripcion y id_vendedor para el logo' });
  }

  insertarLogo(nuevoLogo, (error, results) => {
    if (error) {
      console.error('Error al subir logo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(201).json(results);
    }
  });
};

// Actualizar un logo existente
const cambiarLogo = (req, res) => {
  const idLogo = req.params.id;
  const datosActualizados = req.body;

  // Validar que los datos obligatorios estén presentes para la actualización
  if (!datosActualizados.nombre && !datosActualizados.imagen && !datosActualizados.descripcion && !datosActualizados.id_vendedor) {
    return res.status(400).json({ error: 'Debe proporcionar nombre, imagen, descripcion o id_vendedor para actualizar el logo' });
  }

  actualizarLogo(idLogo, datosActualizados, (error, results) => {
    if (error) {
      console.error('Error al actualizar logo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
};

// Eliminar un logo existente
const sacarLogo = (req, res) => {
  const idLogo = req.params.id;

  eliminarLogo(idLogo, (error, results) => {
    if (error) {
      console.error('Error al eliminar logo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
};

// Obtener todas las portadas
const obtenerPortadas = (req, res) => {
  consultarPortadas((error, results) => {
    if (error) {
      console.error('Error al obtener portadas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
};

// Subir una nueva portada
const subirPortada = (req, res) => {
  const nuevaPortada = req.body;

  // Validar que los datos obligatorios estén presentes
  if (!nuevaPortada.nombre || !nuevaPortada.imagen || !nuevaPortada.descripcion || !nuevaPortada.id_vendedor) {
    return res.status(400).json({ error: 'Debe proporcionar nombre, imagen, descripcion y id_vendedor para la portada' });
  }

  insertarPortada(nuevaPortada, (error, results) => {
    if (error) {
      console.error('Error al subir portada:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(201).json(results);
    }
  });
};

// Actualizar una portada existente
const cambiarPortada = (req, res) => {
  const idPortada = req.params.id;
  const datosActualizados = req.body;

  // Validar que los datos obligatorios estén presentes para la actualización
  if (!datosActualizados.nombre && !datosActualizados.imagen && !datosActualizados.descripcion && !datosActualizados.id_vendedor) {
    return res.status(400).json({ error: 'Debe proporcionar nombre, imagen, descripcion o id_vendedor para actualizar la portada' });
  }

  actualizarPortada(idPortada, datosActualizados, (error, results) => {
    if (error) {
      console.error('Error al actualizar portada:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
};

// Eliminar una portada existente
const sacarPortada = (req, res) => {
  const idPortada = req.params.id;

  eliminarPortada(idPortada, (error, results) => {
    if (error) {
      console.error('Error al eliminar portada:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
};

export { obtenerLogos, subirLogo, cambiarLogo, sacarLogo, obtenerPortadas, subirPortada, cambiarPortada, sacarPortada };
