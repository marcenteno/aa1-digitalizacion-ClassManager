
const pool = require('../config/db');
const matriculaModel = require('../models/matriculaModel');

// GET: Listar todas las matrículas
const getAll = async (req, res, next) => {
  try {
    const matriculas = await matriculaModel.getAll();

    res.json({
      success: true,
      data: matriculas
    });
  } catch (error) {
    next(error);
  }
};

// POST: Matricular un alumno en un curso
const create = async (req, res, next) => {
  let connection;

  try {
    const { alumno_id, curso_id } = req.body;

    if (
      !Number.isInteger(Number(alumno_id)) || Number(alumno_id) <= 0 ||
      !Number.isInteger(Number(curso_id)) || Number(curso_id) <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'El ID del alumno y del curso son obligatorios y deben ser números enteros positivos'
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Comprobar que existe el alumno
    const existeAlumno = await matriculaModel.alumnoExiste(
      connection,
      alumno_id
    );

    if (!existeAlumno) {
      const error = new Error('El alumno no existe');
      error.status = 404;
      throw error;
    }

    // Obtener y bloquear el curso durante la transacción
    const curso = await matriculaModel.getCursoForUpdate(
      connection,
      curso_id
    );

    if (!curso) {
      const error = new Error('El curso no existe');
      error.status = 404;
      throw error;
    }

    // Comprobar si ya existe una matrícula activa
    const tieneMatricula = await matriculaModel.tieneMatriculaActiva(
      connection,
      alumno_id,
      curso_id
    );

    if (tieneMatricula) {
      const error = new Error(
        'El alumno ya tiene una matrícula activa en este curso'
      );
      error.status = 409;
      throw error;
    }

    // Comprobar las plazas disponibles
    const ocupacion = await matriculaModel.contarMatriculasActivas(
      connection,
      curso_id
    );

    if (ocupacion >= curso.plazas_maximas) {
      const error = new Error(
        'El curso ha alcanzado su número máximo de plazas'
      );
      error.status = 409;
      throw error;
    }

    // Crear una nueva matrícula conservando el historial anterior
    const id = await matriculaModel.create(
      connection,
      alumno_id,
      curso_id
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Matrícula creada correctamente',
      id
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        error: error.message
      });
    }

    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// PUT: Cambiar el estado o la calificación de una matrícula
const updateEstado = async (req, res, next) => {
  try {
    const { estado, calificacion } = req.body;

    const estadosPermitidos = ['active', 'completed', 'canceled'];

    if (!estado || !estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        error: 'El estado debe ser active, completed o canceled'
      });
    }

    if (
      calificacion !== undefined &&
      calificacion !== null &&
      (
        calificacion === '' ||
        !Number.isFinite(Number(calificacion)) ||
        Number(calificacion) < 0 ||
        Number(calificacion) > 10
      )
    ) {
      return res.status(400).json({
        success: false,
        error: 'La calificación debe estar entre 0 y 10'
      });
    }

    const resultado = await matriculaModel.updateEstado(
      req.params.id,
      estado,
      calificacion === undefined ? null : calificacion
    );

    if (resultado === 0) {
      return res.status(404).json({
        success: false,
        error: 'Matrícula no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Matrícula actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE: Eliminar una matrícula
const remove = async (req, res, next) => {
  try {
    const resultado = await matriculaModel.remove(req.params.id);

    if (resultado === 0) {
      return res.status(404).json({
        success: false,
        error: 'Matrícula no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Matrícula eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  create,
  updateEstado,
  remove
};
