require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'admin',
    database: 'equus_petclinic',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool = null;

async function getConnection() {
    try {
        if (!pool) {
            pool = mysql.createPool(config);
            const connection = await pool.getConnection();
            connection.release();
        }
        return pool;
    } catch (err) {
        console.error('Error al conectar a MySQL:', err.message);
        throw err;
    }
}

async function closeConnection() {
    try {
        if (pool) {
            await pool.end();
            pool = null;
        }
    } catch (err) {
        console.error('Error al cerrar conexión:', err.message);
    }
}

async function checkConnection() {
    try {
        const connection = await getConnection();
        await connection.query('SELECT 1');
        return true;
    } catch (err) {
        console.error('Error al verificar conexión:', err.message);
        return false;
    }
}

module.exports = {
    getConnection,
    closeConnection,
    checkConnection
};