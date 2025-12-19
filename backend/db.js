require('dotenv').config();
const mysql = require('mysql2/promise');

const validateConfig = () => {
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
    }
};

validateConfig();

const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool = null;


async function getConnection() {
    try {
        if (!pool) {
            pool = mysql.createPool(config);
            console.log('Pool de conexiones creado');
            
            const connection = await pool.getConnection();
            console.log(`Conectado a: ${config.database}`);
            connection.release();
        }
        return pool;
    } catch (err) {
        console.error(' Error al conectar:', err.message);
        pool = null;
        throw new Error(`Fallo en la conexión: ${err.message}`);
    }
}


async function closeConnection() {
    try {
        if (pool) {
            await pool.end();
            pool = null;
            console.log('Conexiones cerradas');
        }
    } catch (err) {
        console.error('Error al cerrar:', err.message);
        throw err;
    }
}


async function executeQuery(query, params = []) {
    let connection;
    try {
        const pool = await getConnection();
        connection = await pool.getConnection();
        const [results] = await connection.execute(query, params);
        return results;
    } catch (err) {
        console.error('Error en consulta:', err.message);
        throw err;
    } finally {
        if (connection) connection.release();
    }
}


async function executeTransaction(callback) {
    let connection;
    try {
        const pool = await getConnection();
        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        const result = await callback(connection);
        
        await connection.commit();
        return result;
    } catch (err) {
        if (connection) {
            await connection.rollback();
            console.log('Transacción revertida');
        }
        console.error('Error en transacción:', err.message);
        throw err;
    } finally {
        if (connection) connection.release();
    }
}

const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} recibido. Cerrando...`);
    try {
        await closeConnection();
        process.exit(0);
    } catch (err) {
        console.error('Error al cerrar:', err.message);
        process.exit(1);
    }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = {
    getConnection,
    closeConnection,
    executeQuery,
    executeTransaction
};