const pool = require('../config/db');

// Obtener todos los alumnos
const getAll = async (filtro = '') => {
  let sql = 'SELECT * FROM alumnos';
  let params = [];

  if (filtro) {
    sql += `
      WHERE nombre LIKE ?
      OR apellidos LIKE ?
      OR dni LIKE ?
      OR email LIKE ?
    `;

    const busqueda = `%${filtro}%`;
    params = [busqueda, busqueda, busqueda, busqueda];
  }

  sql += ' ORDER BY id ASC';

  const [alumnos] = await pool.execute(sql, params);
  return alumnos;
};

// Obtener un alumno por ID
const getById = async (id) => {
  const [alumnos] = await pool.execute(
    'SELECT * FROM alumnos WHERE id = ?',
    [id]
  );

  return alumnos[0] || null;
};

// Crear un alumno
const create = async (alumno) => {
  const { dni, nombre, apellidos, email, telefono } = alumno;

  const [resultado] = await pool.execute(
    `INSERT INTO alumnos (dni, nombre, apellidos, email, telefono)
     VALUES (?, ?, ?, ?, ?)`,
    [dni, nombre, apellidos, email, telefono || null]
  );

  return resultado.insertId;
};

// Actualizar un alumno
const update = async (id, alumno) => {
  const { dni, nombre, apellidos, email, telefono } = alumno;

  const [resultado] = await pool.execute(
    `UPDATE alumnos
     SET dni = ?, nombre = ?, apellidos = ?, email = ?, telefono = ?
     WHERE id = ?`,
    [dni, nombre, apellidos, email, telefono || null, id]
  );

  return resultado.affectedRows;
};

// Eliminar un alumno
const remove = async (id) => {
  const [resultado] = await pool.execute(
    'DELETE FROM alumnos WHERE id = ?',
    [id]
  );

  return resultado.affectedRows;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};