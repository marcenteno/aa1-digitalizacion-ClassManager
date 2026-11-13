const express = require('express');
const router = express.Router();
const cursosController = require('../controllers/cursosController');

// Rutas CRUD y consultas para la gestión de cursos
// GET /api/cursos -> Listar todos los cursos con plazas totales y ocupadas
router.get('/', (req, res, next) => cursosController.getAll(req, res, next));

// GET /api/cursos/:id -> Obtener detalle de un curso por ID
router.get('/:id', (req, res, next) => cursosController.getById(req, res, next));

// GET /api/cursos/:id/alumnos -> Consultar alumnos inscritos en un curso (Requisito obligatorio)
router.get('/:id/alumnos', (req, res, next) => cursosController.getAlumnosByCurso(req, res, next));

// POST /api/cursos -> Registrar un nuevo curso
router.post('/', (req, res, next) => cursosController.create(req, res, next));

// PUT /api/cursos/:id -> Modificar datos de un curso existente
router.put('/:id', (req, res, next) => cursosController.update(req, res, next));

// DELETE /api/cursos/:id -> Eliminar un curso (bloqueado si tiene matrículas)
router.delete('/:id', (req, res, next) => cursosController.remove(req, res, next));

module.exports = router;

