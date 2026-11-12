-- =============================================================================
-- Datos de prueba iniciales (Seeds) para ClassManager
-- Asignatura: Sostenibilidad aplicada al sistema productivo (2º DAW)
-- Base de datos: classmanager
-- =============================================================================

USE classmanager;

-- -----------------------------------------------------------------------------
-- 1. Inserción de alumnos de prueba
-- DNI y correos únicos con formatos realistas
-- -----------------------------------------------------------------------------
INSERT INTO alumnos (dni, nombre, apellidos, email, telefono) VALUES
('12345678A', 'Laura', 'Gómez Martínez', 'laura.gomez@example.com', '600111222'),
('87654321B', 'Carlos', 'Navarro Ruiz', 'carlos.navarro@example.com', '611222333'),
('23456789C', 'Elena', 'Sanz Morales', 'elena.sanz@example.com', '622333444'),
('98765432D', 'Marcos', 'López Pardo', 'marcos.lopez@example.com', '633444555'),
('34567890E', 'Sara', 'Fernández Castillo', 'sara.fernandez@example.com', '644555666'),
('45678901F', 'David', 'Vidal Torres', 'david.vidal@example.com', '655666777');

-- -----------------------------------------------------------------------------
-- 2. Inserción de cursos formativos
-- Códigos únicos, horas lectivas y cupos de plazas máximas
-- -----------------------------------------------------------------------------
INSERT INTO cursos (codigo, nombre, descripcion, horas, plazas_maximas) VALUES
('DAW-SOST-01', 'Sostenibilidad aplicada al sistema productivo', 'Principios de desarrollo de software verde, eficiencia energética, desmaterialización y reducción de la huella de carbono digital.', 60, 25),
('DAW-NODE-02', 'Desarrollo Backend con Node.js y Express', 'Construcción de APIs REST modulares, controladores asíncronos y conexión segura a MariaDB mediante pools.', 80, 20),
('DAW-BD-03', 'Bases de Datos Relacionales con MariaDB', 'Diseño de modelos relacionales, restricciones de integridad referencial, transacciones ACID y optimización.', 70, 15),
('DAW-WEB-04', 'Desarrollo Frontend con Vanilla JavaScript', 'Interfaces ligeras sin frameworks pesados, manipulación de DOM y consumo asíncrono con Fetch API.', 65, 2);

-- -----------------------------------------------------------------------------
-- 3. Inserción de matrículas de prueba
-- Relacionan alumnos y cursos existentes.
-- Estados permitidos: 'active', 'completed', 'canceled'
--
-- Casos preparados para testing y demostración:
-- - Alumno 1 (Laura): Tiene un curso completado ('completed') y uno en curso ('active').
-- - Alumno 2 (Carlos): Tiene un curso activo ('active') y uno completado con nota ('completed').
-- - Alumno 3 (Elena): Tiene una matrícula CANCELADA ('canceled') en el curso 2 (DAW-NODE-02),
--   lo que permite probar la funcionalidad de rematriculación.
-- - Curso 4 (DAW-WEB-04): Tiene cupo de 2 plazas y cuenta con 2 matrículas activas (alumnos 4 y 5),
--   lo que permite probar el bloqueo de inscripciones por aforo completo.
-- -----------------------------------------------------------------------------
INSERT INTO matriculas (alumno_id, curso_id, fecha_matricula, estado, calificacion) VALUES
(1, 1, '2026-09-15', 'completed', 9.20),
(1, 2, '2026-10-01', 'active', NULL),
(2, 1, '2026-10-05', 'active', NULL),
(2, 3, '2026-09-20', 'completed', 8.50),
(3, 2, '2026-10-10', 'canceled', NULL),
(4, 4, '2026-10-15', 'active', NULL),
(5, 4, '2026-10-16', 'active', NULL);

