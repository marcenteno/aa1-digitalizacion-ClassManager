
const cursoModel = require('../models/cursoModel');

// GET: Listar cursos con información de plazas ocupadas
const getAll = async (req, res, next) => {
  try {
    const cursos = await cursoModel.getAll();

    res.json({
      success: true,
      data: cursos
    });
  } catch (error) {
    next(error);
  }
};

// GET: Consultar un curso por ID
const getById = async (req, res, next) => {
  try {
    const curso = await cursoModel.getById(req.params.id);

    if (!curso) {
      return res.status(404).json({
        success: false,
        error: 'Curso no encontrado'
      });
    }

    res.json({
      success: true,
      data: curso
    });
  } catch (error) {
    next(error);
  }
};

// GET: Consultar los alumnos inscritos en un curso
const getAlumnosByCurso = async (req, res, next) => {
  try {
    const resultado = await cursoModel.getAlumnosByCurso(req.params.id);

    if (!resultado) {
      return res.status(404).json({
        success: false,
        error: 'Curso no encontrado'
      });
    }

    res.json({
      success: true,
      curso: resultado.curso,
      data: resultado.alumnos
    });
  } catch (error) {
    next(error);
  }
};

// POST: Crear un curso
const create = async (req, res, next) => {
  try {
    const { codigo, nombre, descripcion, horas, plazas_maximas } = req.body;

    if (
      typeof codigo !== 'string' || !codigo.trim() ||
      typeof nombre !== 'string' || !nombre.trim() ||
      horas === undefined || horas === null || horas === '' ||
      plazas_maximas === undefined || plazas_maximas === null || plazas_maximas === ''
    ) {
      return res.status(400).json({
        success: false,
        error: 'Código, nombre, horas y plazas máximas son obligatorios'
      });
    }

    if (
      !Number.isInteger(Number(horas)) || Number(horas) <= 0 ||
      !Number.isInteger(Number(plazas_maximas)) || Number(plazas_maximas) <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Las horas y las plazas máximas deben ser números enteros positivos'
      });
    }

    const id = await cursoModel.create({
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion || null,
      horas: Number(horas),
      plazas_maximas: Number(plazas_maximas)
    });

    res.status(201).json({
      success: true,
      message: 'Curso creado correctamente',
      id
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Ya existe un curso con ese código'
      });
    }

    next(error);
  }
};

// PUT: Modificar un curso
const update = async (req, res, next) => {
  try {
    const { codigo, nombre, descripcion, horas, plazas_maximas } = req.body;

    if (
      typeof codigo !== 'string' || !codigo.trim() ||
      typeof nombre !== 'string' || !nombre.trim() ||
      horas === undefined || horas === null || horas === '' ||
      plazas_maximas === undefined || plazas_maximas === null || plazas_maximas === ''
    ) {
      return res.status(400).json({
        success: false,
        error: 'Código, nombre, horas y plazas máximas son obligatorios'
      });
    }

    if (
      !Number.isInteger(Number(horas)) || Number(horas) <= 0 ||
      !Number.isInteger(Number(plazas_maximas)) || Number(plazas_maximas) <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: 'Las horas y las plazas máximas deben ser números enteros positivos'
      });
    }

    const resultado = await cursoModel.update(req.params.id, {
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion || null,
      horas: Number(horas),
      plazas_maximas: Number(plazas_maximas)
    });

    if (resultado === 0) {
      return res.status(404).json({
        success: false,
        error: 'Curso no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Curso actualizado correctamente'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Ya existe un curso con ese código'
      });
    }

    next(error);
  }
};

// DELETE: Eliminar un curso
const remove = async (req, res, next) => {
  try {
    const resultado = await cursoModel.remove(req.params.id);

    if (resultado === 0) {
      return res.status(404).json({
        success: false,
        error: 'Curso no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Curso eliminado correctamente'
    });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        error: 'No se puede eliminar el curso porque tiene matrículas asociadas'
      });
    }

    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getAlumnosByCurso,
  create,
  update,
  remove
};
