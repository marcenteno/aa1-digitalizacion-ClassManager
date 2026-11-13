const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Conexión a la base de datos MariaDB para comprobación en arranque
const pool = require('./config/db');

// Importar los enrutadores de los recursos
const alumnosRoutes = require('./routes/alumnosRoutes');
const cursosRoutes = require('./routes/cursosRoutes');
const matriculasRoutes = require('./routes/matriculasRoutes');

// Importar el middleware centralizado de gestión de errores
const errorHandler = require('./middlewares/errorHandler');

// Crear la aplicación de Express
const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Servir los archivos estáticos del frontend desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Registro de las rutas de la API REST
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/matriculas', matriculasRoutes);

// Middleware de manejo de errores (debe registrarse después de las rutas)
app.use(errorHandler);

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Iniciar el servidor únicamente si el archivo se ejecuta directamente (no en tests automatizados)
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`🚀 Servidor ClassManager iniciado en http://localhost:${PORT}`);
    // Comprobar la conexión con MariaDB al arrancar el servidor
    await pool.testConnection();
  });
}

// Exportar la aplicación para que Jest y Supertest puedan ejecutar pruebas sin abrir puertos
module.exports = app;

