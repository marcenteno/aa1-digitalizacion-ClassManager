
const alumnoModel = require('../models/alumnoModel');

// GET: Listar todos los alumnos y permitir búsquedas
const getAll = async (req, res, next) => {
  try {
    const { q } = req.query;

    const alumnos = await alumnoModel.getAll(q || '');

    res.json({
      success: true,
      data: alumnos
    });
  } catch (error) {
    next(error);
  }
};

// GET: Consultar un alumno por ID
const getById = async (req, res, next) => {
  try {
    const alumno = await alumnoModel.getById(req.params.id);

    if (!alumno) {
      return res.status(404).json({
        success: false,
        error: 'Alumno no encontrado'
      });
    }

    res.json({
      success: true,
      data: alumno
    });
  } catch (error) {
    next(error);
  }
};

// POST: Registrar un alumno
const create = async (req, res, next) => {
  try {
    const { dni, nombre, apellidos, email, telefono } = req.body;

    if (
      !dni || typeof dni !== 'string' ||
      !nombre || typeof nombre !== 'string' ||
      !apellidos || typeof apellidos !== 'string' ||
      !email || typeof email !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        error: 'DNI, nombre, apellidos y email son obligatorios'
      });
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'El formato del email no es válido'
      });
    }

    const id = await alumnoModel.create({
      dni: dni.trim(),
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.trim(),
      telefono: typeof telefono === 'string' ? telefono.trim() : null
    });

    res.status(201).json({
      success: true,
      message: 'Alumno creado correctamente',
      id
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'El DNI o el email ya están registrados'
      });
    }

    next(error);
  }
};

// PUT: Modificar un alumno
const update = async (req, res, next) => {
  try {
    const { dni, nombre, apellidos, email, telefono } = req.body;

    if (
      !dni || typeof dni !== 'string' ||
      !nombre || typeof nombre !== 'string' ||
      !apellidos || typeof apellidos !== 'string' ||
      !email || typeof email !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        error: 'DNI, nombre, apellidos y email son obligatorios'
      });
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValido.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'El formato del email no es válido'
      });
    }

    const resultado = await alumnoModel.update(req.params.id, {
      dni: dni.trim(),
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.trim(),
      telefono: typeof telefono === 'string' ? telefono.trim() : null
    });

    if (resultado === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alumno no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Alumno actualizado correctamente'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'El DNI o el email ya están registrados'
      });
    }

    next(error);
  }
};

// DELETE: Eliminar un alumno
const remove = async (req, res, next) => {
  try {
    const resultado = await alumnoModel.remove(req.params.id);

    if (resultado === 0) {
      return res.status(404).json({
        success: false,
        error: 'Alumno no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Alumno eliminado correctamente'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        error: 'No se puede eliminar el alumno porque tiene matrículas asociadas'
      });
    }

    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
