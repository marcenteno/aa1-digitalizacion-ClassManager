
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env
dotenv.config();

// Configuración del pool de conexiones a MariaDB
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'classmanager',
  port: Number(process.env.DB_PORT) || 3306,

  // Configuración de conexiones
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Codificación para admitir caracteres españoles
  charset: 'utf8mb4'
});

// Comprobar la conexión con MariaDB
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();

    console.log('✅ Conexión con MariaDB establecida correctamente.');

    // Comprobar la codificación de la conexión
    const [result] = await connection.query(
      'SELECT @@character_set_connection AS charset'
    );

    console.log('Codificación de conexión:', result[0].charset);

    connection.release();
    return true;

  } catch (error) {
    console.error('❌ Error al conectar con MariaDB:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('👉 Comprueba que MariaDB esté iniciado.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 Revisa las credenciales del archivo .env.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('👉 La base de datos classmanager no existe.');
    }

    return false;
  }
};

// Añadir la función de comprobación al pool
pool.testConnection = testConnection;

module.exports = pool;
