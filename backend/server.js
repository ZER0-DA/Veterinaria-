const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const citasRoutes = require('./routes/citas');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static('../')); 


app.use('/api/citas', citasRoutes);


app.get('/api/test', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente' });
});


app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
});