const express = require('express');
const router = express.Router();
const matriculasController = require('../controllers/matriculasController');

// Rutas para la gestión de matrículas
// GET /api/matriculas -> Listar todas las matrículas con datos combinados (JOIN alumno y curso)
router.get('/', (req, res, next) => matriculasController.getAll(req, res, next));

// POST /api/matriculas -> Matricular a un alumno en un curso (valida aforo y no duplicidad activa)
router.post('/', (req, res, next) => matriculasController.create(req, res, next));

// PUT /api/matriculas/:id/estado -> Modificar el estado ('activa', 'completada', 'cancelada') o calificación
router.put('/:id/estado', (req, res, next) => matriculasController.updateEstado(req, res, next));

// DELETE /api/matriculas/:id -> Eliminar registro de matrícula
router.delete('/:id', (req, res, next) => matriculasController.remove(req, res, next));

module.exports = router;

