
const pool = require('../config/db');

// Obtener todos los cursos con información de ocupación
const getAll = async () => {
  const [cursos] = await pool.execute(`
    SELECT
      c.*,
      COUNT(CASE WHEN m.estado = 'active' THEN 1 END) AS plazas_ocupadas,
      c.plazas_maximas - COUNT(CASE WHEN m.estado = 'active' THEN 1 END)
        AS plazas_disponibles
    FROM cursos c
    LEFT JOIN matriculas m ON c.id = m.curso_id
    GROUP BY c.id
    ORDER BY c.id ASC
  `);

  return cursos;
};

// Obtener un curso por ID
const getById = async (id) => {
  const [cursos] = await pool.execute(
    'SELECT * FROM cursos WHERE id = ?',
    [id]
  );

  return cursos[0] || null;
};

// Obtener alumnos activos inscritos en un curso
const getAlumnosByCurso = async (id) => {
  const [cursos] = await pool.execute(
    'SELECT id, nombre FROM cursos WHERE id = ?',
    [id]
  );

  if (cursos.length === 0) {
    return null;
  }

  const [alumnos] = await pool.execute(`
    SELECT
      a.id,
      a.dni,
      a.nombre,
      a.apellidos,
      a.email,
      m.fecha_matricula,
      m.estado,
      m.calificacion
    FROM matriculas m
    INNER JOIN alumnos a ON m.alumno_id = a.id
    WHERE m.curso_id = ? AND m.estado = 'active'
    ORDER BY a.apellidos ASC
  `, [id]);

  return {
    curso: cursos[0],
    alumnos
  };
};

// Crear un curso
const create = async (curso) => {
  const { codigo, nombre, descripcion, horas, plazas_maximas } = curso;

  const [resultado] = await pool.execute(
    `INSERT INTO cursos (codigo, nombre, descripcion, horas, plazas_maximas)
     VALUES (?, ?, ?, ?, ?)`,
    [codigo, nombre, descripcion || null, horas, plazas_maximas]
  );

  return resultado.insertId;
};

// Actualizar un curso
const update = async (id, curso) => {
  const { codigo, nombre, descripcion, horas, plazas_maximas } = curso;

  const [resultado] = await pool.execute(
    `UPDATE cursos
     SET codigo = ?, nombre = ?, descripcion = ?, horas = ?, plazas_maximas = ?
     WHERE id = ?`,
    [codigo, nombre, descripcion || null, horas, plazas_maximas, id]
  );

  return resultado.affectedRows;
};

// Eliminar un curso
const remove = async (id) => {
  const [resultado] = await pool.execute(
    'DELETE FROM cursos WHERE id = ?',
    [id]
  );

  return resultado.affectedRows;
};

module.exports = {
  getAll,
  getById,
  getAlumnosByCurso,
  create,
  update,
  remove
};
