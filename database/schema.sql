-- =============================================================================
-- Base de datos: classmanager
-- Proyecto: ClassManager - Sistema de Gestión de Alumnos, Cursos y Matrículas
-- Asignatura: Sostenibilidad aplicada al sistema productivo (2º DAW)
-- Motor de almacenamiento: InnoDB | Codificación: utf8mb4
-- =============================================================================

CREATE DATABASE IF NOT EXISTS classmanager
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE classmanager;

-- -----------------------------------------------------------------------------
-- 1. Tabla: alumnos
-- Almacena los datos personales y de contacto de los alumnos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alumnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefono VARCHAR(15) NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Tabla: cursos
-- Almacena las acciones formativas con su código, carga lectiva y cupo
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    horas INT NOT NULL CHECK (horas > 0),
    plazas_maximas INT NOT NULL CHECK (plazas_maximas > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Tabla: matriculas (Relación N:M entre alumnos y cursos)
-- Registra las inscripciones, su estado y calificación opcional
-- Integridad referencial: ON DELETE RESTRICT (impide borrar alumno/curso con matrículas)
-- Estados permitidos: 'active', 'completed', 'canceled' (por defecto 'active')
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS matriculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT NOT NULL,
    curso_id INT NOT NULL,
    fecha_matricula DATE NOT NULL DEFAULT (CURRENT_DATE),
    estado ENUM('active', 'completed', 'canceled') NOT NULL DEFAULT 'active',
    calificacion DECIMAL(4,2) NULL CHECK (calificacion >= 0 AND calificacion <= 10),
    CONSTRAINT fk_matricula_alumno FOREIGN KEY (alumno_id) 
        REFERENCES alumnos(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_matricula_curso FOREIGN KEY (curso_id) 
        REFERENCES cursos(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
