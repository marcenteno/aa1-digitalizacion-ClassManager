/**
 * Middleware centralizado para la gestión y formateo de errores en Express.
 * Captura cualquier excepción delegada mediante next(err) en la aplicación.
 *
 * @param {Error} err - Objeto de error capturado.
 * @param {import('express').Request} req - Objeto de petición HTTP.
 * @param {import('express').Response} res - Objeto de respuesta HTTP.
 * @param {import('express').NextFunction} next - Función para continuar la cadena de middlewares.
 */
const errorHandler = (err, req, res, next) => {
  // Registrar el error en la consola para depuración en el servidor
  console.error(`❌ [ERROR] ${req.method} ${req.originalUrl}:`, err);

  // Determinar el código de estado HTTP (utiliza err.status o err.statusCode si existe, o 500 por defecto)
  const statusCode = err.status || err.statusCode || 500;

  // Determinar el mensaje de error para el cliente
  // Si es un error 500, protegemos los detalles internos devolviendo un mensaje genérico
  const message = statusCode === 500
    ? 'Error interno del servidor'
    : (err.message || 'Ha ocurrido un error en la solicitud');

  // Devolver respuesta JSON uniforme según el estándar de la Skill rest-endpoint-generator
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = errorHandler;

