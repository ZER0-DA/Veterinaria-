const express = require('express');
const router = express.Router();
const { executeQuery } = require('../db');

// Función para generar código de confirmación único
function generarCodigo() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ========== CREATE - Crear nueva cita ==========
router.post('/', async (req, res) => {
    try {
        const {
            nombre, telefono, correo, descripcion,
            tipo_animal, nombre_mascota, razon_consulta,
            mensaje, fecha_cita, hora_cita
        } = req.body;

        // Validar que todos los campos estén presentes
        if (!nombre || !telefono || !correo || !descripcion ||
            !tipo_animal || !nombre_mascota || !razon_consulta ||
            !mensaje || !fecha_cita || !hora_cita) {
            return res.status(400).json({ 
                error: 'Todos los campos son obligatorios' 
            });
        }

        // Generar código único
        const codigo = generarCodigo();

        const query = `
            INSERT INTO citas (
                nombre, telefono, correo, descripcion,
                tipo_animal, nombre_mascota, razon_consulta,
                mensaje, fecha_cita, hora_cita, codigo_confirmacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await executeQuery(query, [
            nombre, telefono, correo, descripcion,
            tipo_animal, nombre_mascota, razon_consulta,
            mensaje, fecha_cita, hora_cita, codigo
        ]);

        res.status(201).json({
            success: true,
            message: 'Cita creada exitosamente',
            codigo_confirmacion: codigo,
            id: result.insertId
        });

    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({ 
            error: 'Error al crear la cita' 
        });
    }
});

// ========== READ - Obtener citas por correo y código ==========
router.get('/buscar', async (req, res) => {
    try {
        const { correo, codigo } = req.query;

        if (!correo || !codigo) {
            return res.status(400).json({ 
                error: 'Correo y código son obligatorios' 
            });
        }

        const query = `
            SELECT * FROM citas 
            WHERE correo = ? AND codigo_confirmacion = ?
            ORDER BY fecha_cita DESC
        `;

        const citas = await executeQuery(query, [correo, codigo]);

        if (citas.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron citas con esos datos' 
            });
        }

        res.json({
            success: true,
            citas: citas
        });

    } catch (error) {
        console.error('Error al buscar citas:', error);
        res.status(500).json({ 
            error: 'Error al buscar las citas' 
        });
    }
});

// ========== READ - Obtener una cita específica por ID ==========
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'SELECT * FROM citas WHERE id = ?';
        const citas = await executeQuery(query, [id]);

        if (citas.length === 0) {
            return res.status(404).json({ 
                error: 'Cita no encontrada' 
            });
        }

        res.json({
            success: true,
            cita: citas[0]
        });

    } catch (error) {
        console.error('Error al obtener cita:', error);
        res.status(500).json({ 
            error: 'Error al obtener la cita' 
        });
    }
});

// ========== UPDATE - Actualizar cita ==========
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fecha_cita, hora_cita, razon_consulta,
            mensaje, tipo_animal, nombre_mascota
        } = req.body;

        // Verificar que la cita existe
        const citaExiste = await executeQuery(
            'SELECT id FROM citas WHERE id = ?', 
            [id]
        );

        if (citaExiste.length === 0) {
            return res.status(404).json({ 
                error: 'Cita no encontrada' 
            });
        }

        const query = `
            UPDATE citas 
            SET fecha_cita = ?, hora_cita = ?, 
                razon_consulta = ?, mensaje = ?,
                tipo_animal = ?, nombre_mascota = ?
            WHERE id = ?
        `;

        await executeQuery(query, [
            fecha_cita, hora_cita, razon_consulta,
            mensaje, tipo_animal, nombre_mascota, id
        ]);

        res.json({
            success: true,
            message: 'Cita actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar cita:', error);
        res.status(500).json({ 
            error: 'Error al actualizar la cita' 
        });
    }
});

// ========== DELETE - Cancelar cita (cambiar estado) ==========
router.patch('/:id/cancelar', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            UPDATE citas 
            SET estado = 'cancelada' 
            WHERE id = ?
        `;

        const result = await executeQuery(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Cita no encontrada' 
            });
        }

        res.json({
            success: true,
            message: 'Cita cancelada exitosamente'
        });

    } catch (error) {
        console.error('Error al cancelar cita:', error);
        res.status(500).json({ 
            error: 'Error al cancelar la cita' 
        });
    }
});

// ========== DELETE - Eliminar cita permanentemente ==========
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM citas WHERE id = ?';
        const result = await executeQuery(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Cita no encontrada' 
            });
        }

        res.json({
            success: true,
            message: 'Cita eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar cita:', error);
        res.status(500).json({ 
            error: 'Error al eliminar la cita' 
        });
    }
});

module.exports = router;