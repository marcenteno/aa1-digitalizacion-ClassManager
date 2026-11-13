const express = require('express');
const router = express.Router();
const alumnosController = require('../controllers/alumnosController');

// Rutas CRUD para la gestión de alumnos
// GET /api/alumnos -> Listar todos los alumnos (soporta filtro opcional ?q=)
router.get('/', (req, res, next) => alumnosController.getAll(req, res, next));

// GET /api/alumnos/:id -> Obtener el detalle de un alumno por ID
router.get('/:id', (req, res, next) => alumnosController.getById(req, res, next));

// POST /api/alumnos -> Registrar un nuevo alumno
router.post('/', (req, res, next) => alumnosController.create(req, res, next));

// PUT /api/alumnos/:id -> Modificar los datos de un alumno existente
router.put('/:id', (req, res, next) => alumnosController.update(req, res, next));

// DELETE /api/alumnos/:id -> Eliminar un alumno (bloqueado si tiene matrículas)
router.delete('/:id', (req, res, next) => alumnosController.remove(req, res, next));

module.exports = router;

