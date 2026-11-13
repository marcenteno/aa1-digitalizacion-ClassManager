
const pool = require('../config/db');

// Obtener todas las matrículas con información de alumnos y cursos
const getAll = async () => {
  const [matriculas] = await pool.execute(`
    SELECT
      m.id,
      m.alumno_id,
      m.curso_id,
      m.fecha_matricula,
      m.estado,
      m.calificacion,
      a.dni,
      a.nombre AS nombre_alumno,
      a.apellidos AS apellidos_alumno,
      c.codigo AS codigo_curso,
      c.nombre AS nombre_curso
    FROM matriculas m
    INNER JOIN alumnos a ON m.alumno_id = a.id
    INNER JOIN cursos c ON m.curso_id = c.id
    ORDER BY m.id DESC
  `);

  return matriculas;
};

// Comprobar si existe un alumno
const alumnoExiste = async (connection, alumnoId) => {
  const [alumnos] = await connection.execute(
    'SELECT id FROM alumnos WHERE id = ?',
    [alumnoId]
  );

  return alumnos.length > 0;
};

// Obtener un curso y bloquearlo durante la transacción
const getCursoForUpdate = async (connection, cursoId) => {
  const [cursos] = await connection.execute(
    'SELECT id, plazas_maximas FROM cursos WHERE id = ? FOR UPDATE',
    [cursoId]
  );

  return cursos[0] || null;
};

// Comprobar si ya existe una matrícula activa
const tieneMatriculaActiva = async (connection, alumnoId, cursoId) => {
  const [matriculas] = await connection.execute(
    `SELECT id FROM matriculas
     WHERE alumno_id = ? AND curso_id = ? AND estado = 'active'`,
    [alumnoId, cursoId]
  );

  return matriculas.length > 0;
};

// Contar las matrículas activas de un curso
const contarMatriculasActivas = async (connection, cursoId) => {
  const [resultado] = await connection.execute(
    `SELECT COUNT(*) AS total
     FROM matriculas
     WHERE curso_id = ? AND estado = 'active'`,
    [cursoId]
  );

  return resultado[0].total;
};

// Crear una matrícula
const create = async (connection, alumnoId, cursoId) => {
  const [resultado] = await connection.execute(
    `INSERT INTO matriculas (alumno_id, curso_id, fecha_matricula, estado)
     VALUES (?, ?, CURDATE(), 'active')`,
    [alumnoId, cursoId]
  );

  return resultado.insertId;
};

// Actualizar estado y calificación
const updateEstado = async (id, estado, calificacion) => {
  const [resultado] = await pool.execute(
    `UPDATE matriculas
     SET estado = ?, calificacion = ?
     WHERE id = ?`,
    [estado, calificacion, id]
  );

  return resultado.affectedRows;
};

// Eliminar una matrícula
const remove = async (id) => {
  const [resultado] = await pool.execute(
    'DELETE FROM matriculas WHERE id = ?',
    [id]
  );

  return resultado.affectedRows;
};

module.exports = {
  getAll,
  alumnoExiste,
  getCursoForUpdate,
  tieneMatriculaActiva,
  contarMatriculasActivas,
  create,
  updateEstado,
  remove
};
