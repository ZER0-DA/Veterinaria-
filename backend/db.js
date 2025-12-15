require('dotenv').config();
const mysql = require('mysql2/promise');

// Validar que las variables de entorno necesarias estén definidas
const validateConfig = () => {
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        throw new Error(`Faltan variables de entorno requeridas: ${missing.join(', ')}`);
    }
};

// Validar configuración al inicio
validateConfig();

// Configuración del pool de conexiones
const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

let pool = null;

/**
 * Obtiene el pool de conexiones a la base de datos
 * Si no existe, lo crea
 * @returns {Promise<Pool>} Pool de conexiones MySQL
 */
async function getConnection() {
    try {
        if (!pool) {
            pool = mysql.createPool(config);
            console.log('✓ Pool de conexiones creado exitosamente');
            
            // Verificar conexión inicial
            const connection = await pool.getConnection();
            console.log(`✓ Conectado a la base de datos: ${config.database}`);
            connection.release();
        }
        return pool;
    } catch (err) {
        console.error('✗ Error al crear el pool de conexiones:', err.message);
        pool = null; // Resetear el pool en caso de error
        throw new Error(`Fallo en la conexión a la base de datos: ${err.message}`);
    }
}

/**
 * Cierra todas las conexiones del pool
 */
async function closeConnection() {
    try {
        if (pool) {
            await pool.end();
            pool = null;
            console.log('✓ Conexiones cerradas correctamente');
        }
    } catch (err) {
        console.error('✗ Error al cerrar las conexiones:', err.message);
        throw err;
    }
}

/**
 * Verifica si la conexión a la base de datos está funcionando
 * @returns {Promise<boolean>} true si la conexión es exitosa
 */
async function checkConnection() {
    try {
        const connection = await getConnection();
        await connection.query('SELECT 1');
        console.log('✓ Conexión a la base de datos verificada');
        return true;
    } catch (err) {
        console.error('✗ Error al verificar la conexión:', err.message);
        return false;
    }
}

/**
 * Ejecuta una consulta SQL de forma segura
 * @param {string} query - Consulta SQL
 * @param {Array} params - Parámetros para la consulta preparada
 * @returns {Promise<Array>} Resultado de la consulta
 */
async function executeQuery(query, params = []) {
    let connection;
    try {
        const pool = await getConnection();
        connection = await pool.getConnection();
        const [results] = await connection.execute(query, params);
        return results;
    } catch (err) {
        console.error('✗ Error al ejecutar consulta:', err.message);
        throw err;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

/**
 * Ejecuta múltiples consultas en una transacción
 * @param {Function} callback - Función que recibe la conexión y ejecuta las consultas
 * @returns {Promise} Resultado de la transacción
 */
async function executeTransaction(callback) {
    let connection;
    try {
        const pool = await getConnection();
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        const result = await callback(connection);
        
        await connection.commit();
        console.log('✓ Transacción completada exitosamente');
        return result;
    } catch (err) {
        if (connection) {
            await connection.rollback();
            console.log('↺ Transacción revertida debido a error');
        }
        console.error('✗ Error en la transacción:', err.message);
        throw err;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

// Manejo de cierre graceful de la aplicación
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} recibido. Cerrando conexiones...`);
    try {
        await closeConnection();
        console.log('✓ Aplicación cerrada correctamente');
        process.exit(0);
    } catch (err) {
        console.error('✗ Error durante el cierre:', err.message);
        process.exit(1);
    }
};

// Escuchar señales de terminación
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('✗ Promesa rechazada no manejada:', err);
});

module.exports = {
    getConnection,
    closeConnection,
    checkConnection,
    executeQuery,
    executeTransaction
};

// Si el archivo se ejecuta directamente (no como módulo importado)
if (require.main === module) {
    console.log('\n========================================');
    console.log('  Prueba de Conexión a Base de Datos');
    console.log('========================================\n');
    
    (async () => {
        try {
            console.log('Configuración cargada:');
            console.log(`  Host: ${config.host}`);
            console.log(`  Puerto: ${config.port}`);
            console.log(`  Usuario: ${config.user}`);
            console.log(`  Base de datos: ${config.database}`);
            console.log(`  Límite de conexiones: ${config.connectionLimit}\n`);
            
            console.log('Verificando conexión...');
            const isConnected = await checkConnection();
            
            if (isConnected) {
                console.log('\n✓ ¡Conexión exitosa a la base de datos!');
                
                // Obtener información adicional
                const pool = await getConnection();
                const [rows] = await pool.query('SELECT VERSION() as version, DATABASE() as db');
                console.log(`  MySQL Version: ${rows[0].version}`);
                console.log(`  Base de datos activa: ${rows[0].db}`);
            } else {
                console.log('\n✗ No se pudo conectar a la base de datos');
            }
            
            await closeConnection();
            console.log('\n========================================\n');
        } catch (err) {
            console.error('\n✗ Error durante la prueba:', err.message);
            process.exit(1);
        }
    })();
}