const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const citasRoutes = require('./routes/citas');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos (tu HTML, CSS, JS)
app.use(express.static('../')); // Ajusta la ruta según tu estructura

// Rutas
app.use('/api/citas', citasRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente' });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
});